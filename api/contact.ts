import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

// Server-side mirror of src/lib/contact.ts (kept separate so the function bundles standalone).
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional().default(''),
  // Single-use token from Google reCAPTCHA v3. Verified server-side before anything is sent.
  recaptchaToken: z.string().max(4096).optional(),
})

const CAPTCHA_FAILED = 'We could not verify that this request came from a person. Please try again.'
const CAPTCHA_UNAVAILABLE = 'The human check is unavailable right now. Please try again in a moment.'
const MAX_BODY_BYTES = 20_000
const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const VERIFY_TIMEOUT_MS = 5000

const WINDOW_SECONDS = 600
const MAX_REQUESTS = 5

// Best-effort, per-instance fallback. Serverless instances do not share memory,
// so configure Upstash (see README) for durable limiting.
const memory = new Map<string, { count: number; reset: number }>()

async function rateLimited(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    try {
      const key = `contact:${ip}`
      const res = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, WINDOW_SECONDS, 'NX'],
        ]),
      })
      if (res.ok) {
        const data = (await res.json()) as Array<{ result: number }>
        return (data[0]?.result ?? 0) > MAX_REQUESTS
      }
    } catch {
      // Fall through to the in-memory limiter.
    }
  }
  const now = Date.now()
  const entry = memory.get(ip)
  if (!entry || entry.reset < now) {
    memory.set(ip, { count: 1, reset: now + WINDOW_SECONDS * 1000 })
    return false
  }
  entry.count += 1
  return entry.count > MAX_REQUESTS
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)

const stripControl = (s: string) => s.replace(/[\r\n\u0000-\u001f]+/g, ' ').trim()


type Verdict =
  | { ok: true }
  | { ok: false; status: 403 | 503; code: 'captcha_failed' | 'captcha_unavailable'; reason: string }

interface SiteVerifyResponse {
  success?: boolean
  score?: number
  action?: string
  hostname?: string
  'error-codes'?: string[]
}

const rejected = (reason: string): Verdict => ({ ok: false, status: 403, code: 'captcha_failed', reason })
const unavailable = (reason: string): Verdict => ({ ok: false, status: 503, code: 'captcha_unavailable', reason })

/**
 * Verify a reCAPTCHA v3 token with Google. Fails closed: any doubt rejects the request, and Resend is only
 * reached after this returns ok. Reasons are short codes for the server log. They never contain the token,
 * the secret, Google's raw response or the visitor's message.
 */
async function verifyRecaptcha(token: string, ip: string, secret: string): Promise<Verdict> {
  const expectedAction = process.env.RECAPTCHA_EXPECTED_ACTION?.trim() || 'contact_submit'
  const minScoreRaw = Number.parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? '')
  const minScore = Number.isFinite(minScoreRaw) ? Math.min(1, Math.max(0, minScoreRaw)) : 0.5
  const allowed = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)

  const form = new URLSearchParams({ secret, response: token })
  if (ip !== 'unknown') form.set('remoteip', ip)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)
  let data: SiteVerifyResponse
  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: controller.signal,
    })
    if (!response.ok) return unavailable(`google_http_${response.status}`)
    data = (await response.json()) as SiteVerifyResponse
  } catch {
    return unavailable('google_unreachable')
  } finally {
    clearTimeout(timer)
  }

  if (!data.success) {
    const codes = data['error-codes'] ?? []
    // A bad or missing secret is our misconfiguration, not the visitor's fault.
    if (codes.includes('missing-input-secret') || codes.includes('invalid-input-secret')) return unavailable('bad_secret')
    // Includes timeout-or-duplicate: expired and replayed tokens.
    return rejected(`google_rejected:${codes.join('|') || 'unknown'}`)
  }
  if (data.action !== expectedAction) return rejected('wrong_action')
  if (!data.hostname || !allowed.includes(data.hostname.toLowerCase())) return rejected('wrong_hostname')
  if (typeof data.score !== 'number' || data.score < minScore) return rejected('low_score')
  return { ok: true }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
  const hasAllowlist = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? '').split(',').some((h) => h.trim())
  // Fail closed: without the human check configured the form must not send email.
  if (!apiKey || !to || !from || !recaptchaSecret || !hasAllowlist) {
    return res.status(503).json({ error: 'Contact service is not configured.', code: 'not_configured' })
  }

  const contentType = String(req.headers['content-type'] ?? '').toLowerCase()
  if (!contentType.startsWith('application/json')) {
    return res.status(415).json({ error: 'Unsupported content type.' })
  }
  const declaredLength = Number(req.headers['content-length'] ?? 0)
  if (declaredLength > MAX_BODY_BYTES || JSON.stringify(req.body ?? '').length > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Request too large.' })
  }

  const forwarded = req.headers['x-forwarded-for']
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim() || 'unknown'
  if (await rateLimited(ip)) {
    res.setHeader('Retry-After', String(WINDOW_SECONDS))
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    // A filled honeypot also fails here. Respond like a normal validation failure.
    return res.status(400).json({ error: 'Please check the form fields and try again.' })
  }
  const { name, email, subject, message } = parsed.data
  const token = parsed.data.recaptchaToken?.trim()
  if (!token) {
    console.warn('contact: rejected', 'missing_token')
    return res.status(403).json({ error: CAPTCHA_FAILED, code: 'captcha_failed' })
  }
  const verdict = await verifyRecaptcha(token, ip, recaptchaSecret)
  if (!verdict.ok) {
    console.warn('contact: rejected', verdict.reason)
    return res.status(verdict.status).json({
      error: verdict.code === 'captcha_failed' ? CAPTCHA_FAILED : CAPTCHA_UNAVAILABLE,
      code: verdict.code,
    })
  }

  const safeSubject = stripControl(subject)
  const html = `
    <h2>New portfolio inquiry</h2>
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
    <hr />
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${safeSubject}`,
        html,
        text: `From: ${stripControl(name)} <${email}>\nSubject: ${safeSubject}\n\n${message}`,
      }),
    })
    if (!response.ok) {
      console.error('Resend error', response.status, await response.text())
      return res.status(502).json({ error: 'Your message could not be delivered. Please try again later.' })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Resend request failed', err)
    return res.status(502).json({ error: 'Your message could not be delivered. Please try again later.' })
  }
}
