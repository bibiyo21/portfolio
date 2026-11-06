import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

// Server-side mirror of src/lib/contact.ts (kept separate so the function bundles standalone).
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional().default(''),
})

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !to || !from) {
    return res.status(503).json({ error: 'Contact service is not configured.', code: 'not_configured' })
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
