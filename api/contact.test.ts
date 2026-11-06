// @vitest-environment node
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const body = { name: 'Ada Lovelace', email: 'ada@example.com', subject: 'Hello', message: 'A message long enough.', website: '' }

function mockRes() {
  const res = {
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
  return res
}

async function call(req: Partial<VercelRequest>) {
  const { default: handler } = await import('./contact')
  const res = mockRes()
  await handler({ headers: {}, ...req } as VercelRequest, res as unknown as VercelResponse)
  return res
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('RESEND_API_KEY', 're_test')
    vi.stubEnv('CONTACT_TO_EMAIL', 'me@example.com')
    vi.stubEnv('CONTACT_FROM_EMAIL', 'site@example.com')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('rejects non-POST methods with 405', async () => {
    const res = await call({ method: 'GET' })
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('POST')
  })

  it('returns 503 not_configured when env vars are missing and never calls Resend', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const res = await call({ method: 'POST', body })
    expect(res.statusCode).toBe(503)
    expect(res.payload).toMatchObject({ code: 'not_configured' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid input and for a filled honeypot', async () => {
    vi.stubGlobal('fetch', vi.fn())
    expect((await call({ method: 'POST', body: { ...body, email: 'bad' } })).statusCode).toBe(400)
    expect((await call({ method: 'POST', body: { ...body, website: 'spam' } })).statusCode).toBe(400)
  })

  it('sends through Resend and returns ok only on success, escaping HTML', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const res = await call({ method: 'POST', body: { ...body, message: '<script>alert(1)</script> hello there' } })
    expect(res.statusCode).toBe(200)
    expect(res.payload).toEqual({ ok: true })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test')
    const sent = JSON.parse(init.body as string)
    expect(sent.html).not.toContain('<script>')
    expect(sent.html).toContain('&lt;script&gt;')
    expect(sent.to).toEqual(['me@example.com'])
    expect(sent.reply_to).toBe('ada@example.com')
  })

  it('strips line breaks from the subject (header injection)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await call({ method: 'POST', body: { ...body, subject: 'Hi\r\nBcc: evil@example.com' } })
    const sent = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string)
    expect(sent.subject).not.toMatch(/[\r\n]/)
  })

  it('returns 502 and does not claim success when Resend fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await call({ method: 'POST', body })
    expect(res.statusCode).toBe(502)
    expect(res.payload).not.toMatchObject({ ok: true })
  })

  it('rate limits repeated requests from one IP with 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })))
    const req = { method: 'POST', body, headers: { 'x-forwarded-for': '203.0.113.9' } }
    const codes: number[] = []
    for (let i = 0; i < 7; i++) codes.push((await call(req)).statusCode)
    expect(codes.slice(0, 5)).toEqual([200, 200, 200, 200, 200])
    expect(codes.slice(5)).toEqual([429, 429])
  })
})
