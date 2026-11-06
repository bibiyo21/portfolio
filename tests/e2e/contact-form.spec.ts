import { expect, test, type Page } from '@playwright/test'
import { validForm } from '../fixtures/test-data'

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
    await expect(dialog.getByText('Please enter your full name.')).toBeVisible()
    await expect(dialog.getByText('Please enter a valid email address.')).toBeVisible()
    await expect(dialog.getByText('Please add a subject.')).toBeVisible()
    await expect(dialog.getByText('Please write at least 10 characters.')).toBeVisible()
    await expect(dialog.getByLabel('Full Name')).toHaveAttribute('aria-invalid', 'true')
    expect(called).toBe(false)
  })

  test('rejects an invalid email address', async ({ page }) => {
    const dialog = await openAndFill(page, { email: 'not-an-email' })
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByText('Please enter a valid email address.')).toBeVisible()
  })

  test('shows loading then success only after the API confirms delivery', async ({ page }) => {
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
    expect(body).toMatchObject({ name: validForm.name, email: validForm.email, subject: validForm.subject, website: '' })
  })

  test('shows an error message when the API fails and never claims success', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 502, json: { error: 'Your message could not be delivered. Please try again later.' } }),
    )
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
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 503, json: { error: 'Contact service is not configured.', code: 'not_configured' } }),
    )
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    const alert = dialog.getByRole('alert')
    await expect(alert).toContainText('not')
    await expect(alert).toContainText('sent')
    await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:/)
    await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
  })

  test('treats an HTML 200 response (no API behind the dev server) as not delivered', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html></html>' }),
    )
    const dialog = await openAndFill(page)
    await dialog.getByRole('button', { name: 'Submit Inquiry' }).click()
    await expect(dialog.getByRole('alert')).toBeVisible()
    await expect(dialog.getByText('Inquiry sent.')).toHaveCount(0)
  })

  test('honeypot field is hidden from users and assistive tech', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    const honeypot = page.locator('input[name="website"]')
    await expect(honeypot).toHaveAttribute('tabindex', '-1')
    const box = await honeypot.boundingBox()
    expect(box === null || box.x < 0).toBe(true)
  })
})
