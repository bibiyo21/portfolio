// @vitest-environment node
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Google and Resend are always mocked. These tests never reach either service and never send email.
const GOOGLE = 'https://www.google.com/recaptcha/api/siteverify'
const RESEND = 'https://api.resend.com/emails'

const goodBody = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'A message long enough.',
  website: '',
  recaptchaToken: 'token-abc-123',
}
const goodGoogle = { success: true, score: 0.9, action: 'contact_submit', hostname: 'portfolio.example.com' }

function mockRes() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    payload: undefined as unknown,
    setHeader(k: string, v: string) {
      this.headers[k] = v
      return this
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(p: unknown) {
      this.payload = p
      return this
    },
  }
}

interface Mocks {
  google?: () => Response | Promise<Response>
  resend?: () => Response | Promise<Response>
}

/** A fetch that answers per URL and records the calls, so tests can assert what was and was not called. */
function installFetch(m: Mocks = {}) {
  const calls: Array<{ url: string; init: RequestInit }> = []
  const fn = vi.fn(async (url: string | URL | Request, init: RequestInit = {}) => {
    const u = String(url)
    calls.push({ url: u, init })
    if (u === GOOGLE) return (m.google ?? (() => Response.json(goodGoogle)))()
    if (u === RESEND) return (m.resend ?? (() => new Response('{"id":"1"}', { status: 200 })))()
    throw new Error(`unexpected request to ${u}`)
  })
  vi.stubGlobal('fetch', fn)
  return {
    calls,
    google: () => calls.filter((c) => c.url === GOOGLE),
    resend: () => calls.filter((c) => c.url === RESEND),
  }
}

async function call(req: Partial<VercelRequest>) {
  const { default: handler } = await import('./contact')
  const res = mockRes()
  await handler(
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: goodBody, ...req } as VercelRequest,
    res as unknown as VercelResponse,
  )
  return res
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('RESEND_API_KEY', 're_test')
    vi.stubEnv('CONTACT_TO_EMAIL', 'me@example.com')
    vi.stubEnv('CONTACT_FROM_EMAIL', 'site@example.com')
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret-key-xyz')
    vi.stubEnv('RECAPTCHA_MIN_SCORE', '0.5')
    vi.stubEnv('RECAPTCHA_EXPECTED_ACTION', 'contact_submit')
    vi.stubEnv('RECAPTCHA_ALLOWED_HOSTNAMES', 'portfolio.example.com, www.portfolio.example.com')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('request basics', () => {
    it('rejects non-POST methods with 405 and calls nothing', async () => {
      const f = installFetch()
      const res = await call({ method: 'GET' })
      expect(res.statusCode).toBe(405)
      expect(res.headers.Allow).toBe('POST')
      expect(f.calls).toHaveLength(0)
    })

    it('rejects a non-JSON content type with 415', async () => {
      const f = installFetch()
      const res = await call({ headers: { 'content-type': 'text/plain' } })
      expect(res.statusCode).toBe(415)
      expect(f.calls).toHaveLength(0)
    })

    it('rejects an oversized body with 413, by header and by actual size', async () => {
      const f = installFetch()
      expect((await call({ headers: { 'content-type': 'application/json', 'content-length': '999999' } })).statusCode).toBe(413)
      expect((await call({ body: { ...goodBody, message: 'x'.repeat(30_000) } })).statusCode).toBe(413)
      expect(f.calls).toHaveLength(0)
    })
  })

  describe('configuration fails closed', () => {
    it.each([
      ['RESEND_API_KEY'],
      ['CONTACT_TO_EMAIL'],
      ['CONTACT_FROM_EMAIL'],
      ['RECAPTCHA_SECRET_KEY'],
      ['RECAPTCHA_ALLOWED_HOSTNAMES'],
    ])('returns 503 not_configured and sends nothing when %s is missing', async (name) => {
      vi.stubEnv(name, '')
      const f = installFetch()
      const res = await call({})
      expect(res.statusCode).toBe(503)
      expect(res.payload).toMatchObject({ code: 'not_configured' })
      expect(f.calls).toHaveLength(0)
    })
  })

  describe('input validation and spam controls', () => {
    it('returns 400 for invalid fields and never contacts Google or Resend', async () => {
      const f = installFetch()
      expect((await call({ body: { ...goodBody, email: 'bad' } })).statusCode).toBe(400)
      expect((await call({ body: { ...goodBody, name: 'A' } })).statusCode).toBe(400)
      expect((await call({ body: { ...goodBody, message: 'short' } })).statusCode).toBe(400)
      expect(f.calls).toHaveLength(0)
    })

    it('rejects a filled honeypot without calling Google or Resend', async () => {
      const f = installFetch()
      const res = await call({ body: { ...goodBody, website: 'http://spam.example' } })
      expect(res.statusCode).toBe(400)
      expect(f.calls).toHaveLength(0)
    })

    it('rate limits repeated requests from one IP with 429 and Retry-After, before spending a Google call', async () => {
      const f = installFetch()
      const req = { headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9' } }
      const codes: number[] = []
      for (let i = 0; i < 7; i++) codes.push((await call(req)).statusCode)
      expect(codes.slice(0, 5)).toEqual([200, 200, 200, 200, 200])
      expect(codes.slice(5)).toEqual([429, 429])
      expect(f.google()).toHaveLength(5)
      expect(f.resend()).toHaveLength(5)
      const limited = await call(req)
      expect(limited.headers['Retry-After']).toBeDefined()
    })
  })

  describe('reCAPTCHA verification', () => {
    it('accepts a valid token, then sends the email once, after verification', async () => {
      const f = installFetch()
      const res = await call({})
      expect(res.statusCode).toBe(200)
      expect(res.payload).toEqual({ ok: true })
      expect(f.calls.map((c) => c.url)).toEqual([GOOGLE, RESEND])
    })

    it('sends the secret, the token and the visitor IP to Google as a form post', async () => {
      const f = installFetch()
      await call({ headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.7, 10.0.0.1' } })
      const init = f.google()[0]!.init
      expect(init.method).toBe('POST')
      const sent = new URLSearchParams(String(init.body))
      expect(sent.get('secret')).toBe('secret-key-xyz')
      expect(sent.get('response')).toBe('token-abc-123')
      expect(sent.get('remoteip')).toBe('198.51.100.7')
    })

    it('rejects a missing token with 403 captcha_failed and calls neither Google nor Resend', async () => {
      const f = installFetch()
      const { recaptchaToken: _t, ...noToken } = goodBody
      void _t
      const res = await call({ body: noToken })
      expect(res.statusCode).toBe(403)
      expect(res.payload).toMatchObject({ code: 'captcha_failed' })
      expect(f.calls).toHaveLength(0)
      const blank = await call({ body: { ...goodBody, recaptchaToken: '   ' } })
      expect(blank.statusCode).toBe(403)
      expect(f.calls).toHaveLength(0)
    })

    it('rejects an invalid token and does not send email', async () => {
      const f = installFetch({ google: () => Response.json({ success: false, 'error-codes': ['invalid-input-response'] }) })
      const res = await call({})
      expect(res.statusCode).toBe(403)
      expect(res.payload).toMatchObject({ code: 'captcha_failed' })
      expect(f.resend()).toHaveLength(0)
    })

    it('rejects an expired or replayed token (timeout-or-duplicate) and does not send email', async () => {
      const f = installFetch({ google: () => Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }) })
      const res = await call({})
      expect(res.statusCode).toBe(403)
      expect(res.payload).toMatchObject({ code: 'captcha_failed' })
      expect(f.resend()).toHaveLength(0)
    })

    it('rejects a replay: the same token cannot send twice when Google reports it used', async () => {
      let first = true
      const f = installFetch({
        google: () => {
          if (first) {
            first = false
            return Response.json(goodGoogle)
          }
          return Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] })
        },
      })
      expect((await call({})).statusCode).toBe(200)
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(1)
    })

    it('fails closed with 503 captcha_unavailable when Google cannot be reached', async () => {
      const f = installFetch({
        google: () => {
          throw new TypeError('network down')
        },
      })
      const res = await call({})
      expect(res.statusCode).toBe(503)
      expect(res.payload).toMatchObject({ code: 'captcha_unavailable' })
      expect(f.resend()).toHaveLength(0)
    })

    it('fails closed when the verification request times out (aborted)', async () => {
      const f = installFetch({
        google: () => {
          throw new DOMException('aborted', 'AbortError')
        },
      })
      const res = await call({})
      expect(res.statusCode).toBe(503)
      expect(res.payload).toMatchObject({ code: 'captcha_unavailable' })
      expect(f.resend()).toHaveLength(0)
    })

    it('fails closed when Google answers with a server error or a non-JSON body', async () => {
      let f = installFetch({ google: () => new Response('oops', { status: 500 }) })
      expect((await call({})).statusCode).toBe(503)
      expect(f.resend()).toHaveLength(0)
      f = installFetch({ google: () => new Response('<html>', { status: 200 }) })
      expect((await call({})).statusCode).toBe(503)
      expect(f.resend()).toHaveLength(0)
    })

    it('treats a bad secret as our configuration problem (503), not a visitor failure', async () => {
      const f = installFetch({ google: () => Response.json({ success: false, 'error-codes': ['invalid-input-secret'] }) })
      const res = await call({})
      expect(res.statusCode).toBe(503)
      expect(res.payload).toMatchObject({ code: 'captcha_unavailable' })
      expect(f.resend()).toHaveLength(0)
    })

    it('rejects the wrong action', async () => {
      const f = installFetch({ google: () => Response.json({ ...goodGoogle, action: 'login' }) })
      const res = await call({})
      expect(res.statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
    })

    it('honours a configured expected action', async () => {
      vi.stubEnv('RECAPTCHA_EXPECTED_ACTION', 'custom_action')
      let f = installFetch()
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
      f = installFetch({ google: () => Response.json({ ...goodGoogle, action: 'custom_action' }) })
      expect((await call({})).statusCode).toBe(200)
    })

    it('rejects a hostname that is not on the allowlist, and a missing hostname', async () => {
      let f = installFetch({ google: () => Response.json({ ...goodGoogle, hostname: 'evil.example.net' }) })
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
      f = installFetch({ google: () => Response.json({ ...goodGoogle, hostname: undefined }) })
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
    })

    it('accepts any allowlisted hostname, ignoring case and spaces', async () => {
      const f = installFetch({ google: () => Response.json({ ...goodGoogle, hostname: 'WWW.Portfolio.Example.com' }) })
      expect((await call({})).statusCode).toBe(200)
      expect(f.resend()).toHaveLength(1)
    })

    it('does not accept a hostname that merely contains an allowed one', async () => {
      const f = installFetch({ google: () => Response.json({ ...goodGoogle, hostname: 'portfolio.example.com.evil.net' }) })
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
    })

    it('rejects a score below the threshold and a missing score, and accepts exactly the threshold', async () => {
      let f = installFetch({ google: () => Response.json({ ...goodGoogle, score: 0.49 }) })
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
      f = installFetch({ google: () => Response.json({ ...goodGoogle, score: undefined }) })
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
      f = installFetch({ google: () => Response.json({ ...goodGoogle, score: 0.5 }) })
      expect((await call({})).statusCode).toBe(200)
    })

    it('uses a configurable minimum score, with 0.5 as the default', async () => {
      vi.stubEnv('RECAPTCHA_MIN_SCORE', '0.8')
      let f = installFetch({ google: () => Response.json({ ...goodGoogle, score: 0.7 }) })
      expect((await call({})).statusCode).toBe(403)
      expect(f.resend()).toHaveLength(0)
      vi.stubEnv('RECAPTCHA_MIN_SCORE', '')
      f = installFetch({ google: () => Response.json({ ...goodGoogle, score: 0.6 }) })
      expect((await call({})).statusCode).toBe(200)
    })
  })

  describe('delivery and safety of responses', () => {
    it('reports success only after Resend accepts the email, and 502 if it does not', async () => {
      const f = installFetch({ resend: () => new Response('boom', { status: 500 }) })
      const res = await call({})
      expect(res.statusCode).toBe(502)
      expect(res.payload).not.toMatchObject({ ok: true })
      expect(f.google()).toHaveLength(1)
      expect(f.resend()).toHaveLength(1)
    })

    it('sends through Resend with escaped HTML, a safe subject and reply-to', async () => {
      const f = installFetch()
      await call({ body: { ...goodBody, subject: 'Hi\r\nBcc: evil@example.com', message: '<script>alert(1)</script> hello there' } })
      const init = f.resend()[0]!.init
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test')
      const sent = JSON.parse(init.body as string)
      expect(sent.html).not.toContain('<script>')
      expect(sent.html).toContain('&lt;script&gt;')
      expect(sent.subject).not.toMatch(/[\r\n]/)
      expect(sent.to).toEqual(['me@example.com'])
      expect(sent.reply_to).toBe('ada@example.com')
      expect(JSON.stringify(sent)).not.toContain('token-abc-123')
    })

    it('never leaks the secret, the token or Google details in any response', async () => {
      const cases: Mocks[] = [
        { google: () => Response.json({ success: false, 'error-codes': ['invalid-input-response'] }) },
        { google: () => Response.json({ ...goodGoogle, score: 0.1 }) },
        { google: () => Response.json({ ...goodGoogle, action: 'other' }) },
        { google: () => { throw new TypeError('down') } },
        { resend: () => new Response('boom', { status: 500 }) },
      ]
      for (const m of cases) {
        installFetch(m)
        const res = await call({})
        const text = JSON.stringify(res.payload)
        expect(text).not.toContain('secret-key-xyz')
        expect(text).not.toContain('token-abc-123')
        expect(text).not.toContain('invalid-input')
        expect(text).not.toContain('portfolio.example.com')
        expect(text).not.toContain('re_test')
      }
    })

    it('logs a short reason on rejection but never the message, the token or the secret', async () => {
      installFetch({ google: () => Response.json({ ...goodGoogle, score: 0.1 }) })
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await call({ body: { ...goodBody, message: 'a very private message body' } })
      const logged = JSON.stringify(warn.mock.calls)
      expect(logged).toContain('low_score')
      for (const secret of ['a very private message body', 'token-abc-123', 'secret-key-xyz', 'ada@example.com']) expect(logged).not.toContain(secret)
    })
  })
})
