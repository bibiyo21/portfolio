import { afterEach, describe, expect, it, vi } from 'vitest'
import { contactSchema, submitContact } from './contact'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', subject: 'Hello', message: 'A message long enough.', website: '' }

describe('contactSchema', () => {
  it('accepts a valid inquiry', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it.each([
    ['name', { name: ' ' }],
    ['email', { email: 'nope' }],
    ['subject', { subject: 'ab' }],
    ['message', { message: 'short' }],
  ])('rejects an invalid %s', (field, patch) => {
    const result = contactSchema.safeParse({ ...valid, ...patch })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path[0]).toBe(field)
  })

  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false)
  })
})

describe('submitContact', () => {
  afterEach(() => vi.unstubAllGlobals())
  const respond = (status: number, body: unknown, contentType = 'application/json') =>
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'Content-Type': contentType } }),
      ),
    )

  it('reports success only when the API confirms ok: true', async () => {
    respond(200, { ok: true })
    expect(await submitContact(valid, "tok")).toEqual({ status: 'success' })
  })

  it('does not report success for a 200 that is not the API (HTML fallback page)', async () => {
    respond(200, '<!doctype html>', 'text/html')
    expect((await submitContact(valid, "tok")).status).toBe('fallback')
  })

  it('falls back to mailto when the service is not configured', async () => {
    respond(503, { code: 'not_configured', error: 'x' })
    expect((await submitContact(valid, "tok")).status).toBe('fallback')
  })

  it('falls back when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    expect((await submitContact(valid, "tok")).status).toBe('fallback')
  })

  it('returns a rate limit message on 429', async () => {
    respond(429, { error: 'x' })
    const r = await submitContact(valid, "tok")
    expect(r.status).toBe('error')
    expect(r.status === 'error' && r.message).toMatch(/Too many requests/)
  })

  it('sends the reCAPTCHA token with the form and keeps every field', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', f)
    await submitContact(valid, 'token-xyz')
    const sent = JSON.parse((f.mock.calls[0]![1] as RequestInit).body as string)
    expect(sent).toMatchObject({ ...valid, recaptchaToken: 'token-xyz' })
  })

  it.each([
    ['captcha_failed', 403],
    ['captcha_unavailable', 503],
  ])('maps %s to a fallback so nothing is reported as sent', async (code, status) => {
    respond(status, { code })
    expect((await submitContact(valid, 'tok')).status).toBe('fallback')
  })

  it('surfaces the server error message otherwise', async () => {
    respond(502, { error: 'Could not deliver.' })
    expect(await submitContact(valid, "tok")).toEqual({ status: 'error', message: 'Could not deliver.' })
  })
})
