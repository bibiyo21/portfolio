// Browser side of Google reCAPTCHA v3. The site key is public. The secret key never reaches the browser.
// The script loads only when the inquiry form is opened, so the rest of the page makes no Google request.

export const RECAPTCHA_ACTION = 'contact_submit'

interface Grecaptcha {
  ready: (cb: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

export type TokenResult =
  | { status: 'ok'; token: string }
  | { status: 'not_configured' }
  | { status: 'failed'; message: string }

export const getSiteKey = (): string => (import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '').trim()

let scriptPromise: Promise<void> | null = null

/** Load the official Google script once. Resolves when `window.grecaptcha` exists. */
export function loadRecaptcha(siteKey = getSiteKey()): Promise<void> {
  if (!siteKey) return Promise.reject(new Error('reCAPTCHA site key is not configured'))
  if (window.grecaptcha) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      script.remove()
      reject(new Error('The reCAPTCHA script could not be loaded'))
    }
    document.head.append(script)
  })
  return scriptPromise
}

/** Ask Google for a fresh token. A token is single use, so call this once per submission. */
export async function getRecaptchaToken(action = RECAPTCHA_ACTION, timeoutMs = 10_000): Promise<TokenResult> {
  const siteKey = getSiteKey()
  if (!siteKey) return { status: 'not_configured' }
  const failed = (message: string): TokenResult => ({ status: 'failed', message })
  try {
    await loadRecaptcha(siteKey)
    const grecaptcha = window.grecaptcha
    if (!grecaptcha) return failed('The verification service did not start.')
    const token = await Promise.race([
      new Promise<string>((resolve, reject) => {
        grecaptcha.ready(() => {
          grecaptcha.execute(siteKey, { action }).then(resolve, reject)
        })
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ])
    if (!token) return failed('The verification service returned no token.')
    return { status: 'ok', token }
  } catch {
    return failed('We could not complete the human check.')
  }
}
