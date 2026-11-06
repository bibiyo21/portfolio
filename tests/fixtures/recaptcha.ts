import { test as base } from '@playwright/test'

export * from '@playwright/test'

/** Stand-in for Google's script: grecaptcha.execute resolves a numbered fake token. No test reaches Google. */
export const recaptchaStub = `
  window.__recaptchaCalls = []
  window.grecaptcha = {
    ready: (cb) => cb(),
    execute: (siteKey, opts) => {
      window.__recaptchaCalls.push({ siteKey, action: opts && opts.action })
      return Promise.resolve('e2e-token-' + window.__recaptchaCalls.length)
    },
  }
`

export const recaptchaFailingStub = `
  window.__recaptchaCalls = []
  window.grecaptcha = { ready: (cb) => cb(), execute: () => Promise.reject(new Error('blocked')) }
`

export const GOOGLE_SCRIPT = 'https://www.google.com/recaptcha/api.js**'

/** Every page in every test gets the stubbed Google script by default. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(GOOGLE_SCRIPT, (route) => route.fulfill({ contentType: 'text/javascript', body: recaptchaStub }))
    await use(page)
  },
})
