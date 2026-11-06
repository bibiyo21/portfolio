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
    expect(await submitContact(valid)).toEqual({ status: 'success' })
  })

  it('does not report success for a 200 that is not the API (HTML fallback page)', async () => {
    respond(200, '<!doctype html>', 'text/html')
    expect((await submitContact(valid)).status).toBe('fallback')
  })

  it('falls back to mailto when the service is not configured', async () => {
    respond(503, { code: 'not_configured', error: 'x' })
    expect((await submitContact(valid)).status).toBe('fallback')
  })

  it('falls back when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    expect((await submitContact(valid)).status).toBe('fallback')
  })

  it('returns a rate limit message on 429', async () => {
    respond(429, { error: 'x' })
    const r = await submitContact(valid)
    expect(r.status).toBe('error')
    expect(r.status === 'error' && r.message).toMatch(/Too many requests/)
  })

  it('surfaces the server error message otherwise', async () => {
    respond(502, { error: 'Could not deliver.' })
    expect(await submitContact(valid)).toEqual({ status: 'error', message: 'Could not deliver.' })
  })
})
