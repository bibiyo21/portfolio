import { expect, test } from '@playwright/test'

const title = "Let's Start a Conversation"

test.describe('contact modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
  })

  test('opens with title, description, fields and buttons', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Have a project in mind or looking for a technical partner?')
    for (const label of ['Full Name', 'Email Address', 'Subject', 'Message']) {
      await expect(dialog.getByLabel(label)).toBeVisible()
    }
    await expect(dialog.getByRole('button', { name: 'Submit Inquiry' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeVisible()
  })

  test('closes with Escape and returns focus to the trigger', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: title })).toBeHidden()
    await expect(page.getByRole('button', { name: /Let.s Connect/ }).first()).toBeFocused()
  })

  test('closes with the Close buttons', async ({ page }) => {
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
    await expect(page.getByRole('dialog', { name: title })).toBeHidden()
  })

  test('closes on outside click', async ({ page }) => {
    await page.mouse.click(5, 5)
    await expect(page.getByRole('dialog', { name: title })).toBeHidden()
  })

  test('locks background scroll while open', async ({ page }) => {
    const before = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(250)
    const after = await page.evaluate(() => window.scrollY)
    expect(after).toBe(before)
  })

  test('traps focus inside the dialog', async ({ page }) => {
    for (let i = 0; i < 10; i++) await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
    expect(inside).toBe(true)
  })
})
