import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene } from '../fixtures/test-data'

const title = "Let's Start a Conversation"

test.describe('contact scene', () => {
  test('shows the heading, copy and every contact method with working links', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'contact')
    const s = page.locator('#contact')
    await expect(s.getByRole('heading', { level: 2, name: "Let's Build Something Meaningful." })).toBeVisible()
    await expect(s).toContainText("Have a project, technical challenge, or collaboration in mind? Let's start a conversation.")
    await expect(s.getByRole('link', { name: /ibrahem\.sotejo\.dev@gmail\.com/ })).toHaveAttribute('href', 'mailto:ibrahem.sotejo.dev@gmail.com')
    await expect(s.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', 'https://wa.me/639174912048')
    await expect(s.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/ibrahem-sotejo-511789103/')
    await expect(s.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/bibiyo21')
    await expect(s).toContainText('Viber')
    await expect(s).toContainText('+63 917 491 2048')
    await expect(s).toContainText('Philippines')
  })

  test('external links open safely in a new tab', async ({ page }) => {
    await page.goto('/')
    for (const l of await page.locator('#contact a[target="_blank"]').all()) await expect(l).toHaveAttribute('rel', /noopener/)
  })

  test('the Viber number is not wrapped in an unverified deep link', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href^="viber:"]')).toHaveCount(0)
  })
})

test.describe('contact modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
  })

  test('opens from the hero with title, description, fields and buttons', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Have a project in mind or looking for a technical partner?')
    for (const label of ['Full Name', 'Email Address', 'Subject', 'Message']) await expect(dialog.getByLabel(label)).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Submit Inquiry' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeVisible()
  })

  test('also opens from the contact scene', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await jumpToScene(page, 'contact')
    await page.getByRole('button', { name: 'Send an inquiry' }).click()
    await expect(page.getByRole('dialog', { name: title })).toBeVisible()
  })

  test('closes with Escape and returns focus to the trigger', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: title })).toBeHidden()
    await expect(page.getByRole('button', { name: /Let.s Connect/ }).first()).toBeFocused()
  })

  test('closes with the Close button and on outside click', async ({ page }) => {
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await page.mouse.click(5, 5)
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('locks background scrolling while open', async ({ page }) => {
    const before = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(250)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)
  })

  test('traps focus inside the dialog', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
  })
})
