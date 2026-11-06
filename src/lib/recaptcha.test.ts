import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RECAPTCHA_ACTION, getRecaptchaToken, getSiteKey } from './recaptcha'

describe('recaptcha client helper', () => {
  const execute = vi.fn()
  beforeEach(() => {
    execute.mockReset().mockResolvedValue('fresh-token')
    window.grecaptcha = { ready: (cb: () => void) => cb(), execute }
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    delete window.grecaptcha
  })

  it('uses the contact_submit action', () => {
    expect(RECAPTCHA_ACTION).toBe('contact_submit')
  })

  it('reports not_configured without a site key and never calls Google', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', '')
    expect(getSiteKey()).toBe('')
    expect(await getRecaptchaToken()).toEqual({ status: 'not_configured' })
    expect(execute).not.toHaveBeenCalled()
  })

  it('returns the token from grecaptcha.execute with the site key and action', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-1')
    expect(await getRecaptchaToken()).toEqual({ status: 'ok', token: 'fresh-token' })
    expect(execute).toHaveBeenCalledWith('site-key-1', { action: 'contact_submit' })
  })

  it('returns a different token on each call because nothing is cached', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-1')
    execute.mockResolvedValueOnce('a').mockResolvedValueOnce('b')
    const first = await getRecaptchaToken()
    const second = await getRecaptchaToken()
    expect([first, second]).toEqual([
      { status: 'ok', token: 'a' },
      { status: 'ok', token: 'b' },
    ])
  })

  it('reports failure when execute rejects, returns nothing, or never answers', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key-1')
    execute.mockRejectedValueOnce(new Error('blocked'))
    expect((await getRecaptchaToken()).status).toBe('failed')
    execute.mockResolvedValueOnce('')
    expect((await getRecaptchaToken()).status).toBe('failed')
    execute.mockReturnValueOnce(new Promise(() => {}))
    expect((await getRecaptchaToken(RECAPTCHA_ACTION, 20)).status).toBe('failed')
  })
})
