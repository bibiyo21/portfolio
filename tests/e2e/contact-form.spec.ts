import { GOOGLE_SCRIPT, expect, recaptchaFailingStub, test, type Page } from '../fixtures/recaptcha'
import { validForm } from '../fixtures/test-data'

// The API is always mocked: no test ever sends real email.
async function openAndFill(page: Page, overrides: Partial<typeof validForm> = {}) {
  await page.goto('/')
  await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
  const dialog = page.getByRole('dialog')
  const data = { ...validForm, ...overrides }
  await dialog.getByLabel('Full Name').fill(data.name)
  await dialog.getByLabel('Email Address').fill(data.email)
  await dialog.getByLabel('Subject').fill(data.subject)
  await dialog.getByLabel('Message').fill(data.message)
  return dialog
}

test.describe('contact form', () => {
  test('shows validation errors for an empty submit and does not call the API', async ({ page }) => {
    let called = false
    await page.route('**/api/contact', (route) => {
      called = true
      return route.fulfill({ status: 200, json: { ok: true } })
    })
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    for (const m of ['Please enter your full name.', 'Please enter a valid email address.', 'Please add a subject.', 'Please write at least 10 characters.']) await expect(dialog.getByText(m)).toBeVisible()
    await expect(dialog.getByLabel('Full Name')).toHaveAttribute('aria-invalid', 'true')
    expect(called).toBe(false)
  })

  test('rejects an invalid email and an empty message', async ({ page }) => {
    const dialog = await openAndFill(page, { email: 'not-an-email', message: '' })
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByText('Please enter a valid email address.')).toBeVisible()
    await expect(dialog.getByText('Please write at least 10 characters.')).toBeVisible()
  })

  test('shows loading, then success only after the API confirms delivery', async ({ page }) => {
    let body: unknown
    await page.route('**/api/contact', async (route) => {
      body = route.request().postDataJSON()
      await new Promise((r) => setTimeout(r, 400))
      await route.fulfill({ status: 200, json: { ok: true } })
    })
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByRole('button', { name: /Sending/ })).toBeDisabled()
    await expect(dialog.getByRole('status')).toContainText('Inquiry sent.')
    expect(body).toMatchObject({ name: validForm.name, email: validForm.email, subject: validForm.subject, website: '', recaptchaToken: 'e2e-token-1' })
  })

  test('shows an error and never claims success when the API fails', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 502, json: { error: 'Your message could not be delivered. Please try again later.' } }))
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByRole('alert')).toContainText('could not be delivered')
    await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
  })

  test('shows the rate limit message on 429', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 429, json: { error: 'Too many requests.' } }))
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByRole('alert')).toContainText('Too many requests')
  })

  test('falls back to mailto and says the message was not sent when unconfigured', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 503, json: { error: 'Contact service is not configured.', code: 'not_configured' } }))
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    const alert = dialog.getByRole('alert')
    await expect(alert).toContainText('not')
    await expect(alert).toContainText('sent')
    await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:ibrahem\.sotejo\.dev@gmail\.com/)
    await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
  })

  test('treats an HTML 200 response (dev server without the API) as not delivered', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html></html>' }))
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByRole('alert')).toBeVisible()
    await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
  })

  test('the honeypot is hidden from users and assistive tech', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    const honeypot = page.locator('input[name="website"]')
    await expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(await honeypot.evaluate((e) => !!e.closest('[aria-hidden="true"]'))).toBe(true)
    const box = await honeypot.boundingBox()
    expect(box === null || box.x < 0).toBe(true)
  })

  test('the modal fits a small phone with the keyboard-sized viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 420 })
    const dialog = await openAndFill(page)
    const box = await dialog.boundingBox()
    expect(box!.height).toBeLessThanOrEqual(420)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).scrollIntoViewIfNeeded()
    await expect(dialog.getByRole('button', { name: 'Submit Inquiry' })).toBeInViewport()
  })
})

test.describe('reCAPTCHA', () => {
  test('the Google script is not requested until the form is opened, then once, with the public site key', async ({ page }) => {
    const googleRequests: string[] = []
    page.on('request', (r) => r.url().includes('google.com/recaptcha') && googleRequests.push(r.url()))
    await page.goto('/')
    await page.waitForTimeout(800)
    expect(googleRequests).toEqual([])
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await expect.poll(() => googleRequests.length).toBe(1)
    expect(googleRequests[0]).toContain('render=e2e-test-site-key')
  })

  test('submits a fresh token with the contact_submit action each time, and never the secret', async ({ page }) => {
    const tokens: string[] = []
    await page.route('**/api/contact', async (route) => {
      const body = route.request().postDataJSON()
      tokens.push(body.recaptchaToken)
      expect(JSON.stringify(body)).not.toMatch(/secret/i)
      await route.fulfill({ status: 403, json: { code: 'captcha_failed', error: 'x' } })
    })
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByRole('alert')).toBeVisible()
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect.poll(() => tokens.length).toBe(2)
    expect(tokens).toEqual(['e2e-token-1', 'e2e-token-2'])
    const calls = await page.evaluate(() => (window as unknown as { __recaptchaCalls: Array<{ siteKey: string; action: string }> }).__recaptchaCalls)
    expect(calls).toEqual([
      { siteKey: 'e2e-test-site-key', action: 'contact_submit' },
      { siteKey: 'e2e-test-site-key', action: 'contact_submit' },
    ])
  })

  test('does not submit when a token cannot be obtained, and says nothing was sent', async ({ page }) => {
    await page.route(GOOGLE_SCRIPT, (route) => route.fulfill({ contentType: 'text/javascript', body: recaptchaFailingStub }))
    let called = false
    await page.route('**/api/contact', (route) => {
      called = true
      return route.fulfill({ status: 200, json: { ok: true } })
    })
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    const alert = dialog.getByRole('alert')
    await expect(alert).toContainText('could not complete the human check')
    await expect(alert).toContainText('not')
    await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:/)
    await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
    expect(called).toBe(false)
  })

  test('does not submit when Google cannot be reached at all', async ({ page }) => {
    await page.route(GOOGLE_SCRIPT, (route) => route.abort())
    let called = false
    await page.route('**/api/contact', (route) => {
      called = true
      return route.fulfill({ status: 200, json: { ok: true } })
    })
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByRole('alert')).toContainText('not')
    await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
    expect(called).toBe(false)
  })

  for (const [code, status, text] of [
    ['captcha_failed', 403, 'could not confirm that this request came from a person'],
    ['captcha_unavailable', 503, 'human check is unavailable'],
  ] as const) {
    test(`shows a retry message and the mailto fallback when the server answers ${code}`, async ({ page }) => {
      await page.route('**/api/contact', (route) => route.fulfill({ status, json: { code, error: 'generic' } }))
      const dialog = await openAndFill(page)
      await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
      const alert = dialog.getByRole('alert')
      await expect(alert).toContainText(text)
      await expect(alert).toContainText('not')
      await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:ibrahem\.sotejo\.dev@gmail\.com/)
      await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
    })
  }

  test("shows Google's required notice with working links, and hides the floating badge", async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    const notice = page.getByTestId('recaptcha-notice')
    await expect(notice).toContainText('This site is protected by reCAPTCHA')
    await expect(notice.getByRole('link', { name: /Privacy Policy/ })).toHaveAttribute('href', 'https://policies.google.com/privacy')
    await expect(notice.getByRole('link', { name: /Terms of Service/ })).toHaveAttribute('href', 'https://policies.google.com/terms')
    const hidden = await page.evaluate(() => {
      const el = document.createElement('div')
      el.className = 'grecaptcha-badge'
      document.body.append(el)
      const v = getComputedStyle(el).visibility
      el.remove()
      return v
    })
    expect(hidden).toBe('hidden')
  })

  test('validation errors never ask Google for a token', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByText('Please enter your full name.')).toBeVisible()
    const calls = await page.evaluate(() => (window as unknown as { __recaptchaCalls?: unknown[] }).__recaptchaCalls ?? [])
    expect(calls).toEqual([])
  })
})
