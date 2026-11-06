import { expect, test } from '@playwright/test'
import { openContactFromNav } from '../fixtures/test-data'

test.describe('navigation (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('links scroll to their sections and mark the active one', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    for (const [label, id] of [
      ['About', 'about'],
      ['Experience', 'experience'],
      ['Projects', 'projects'],
      ['Expertise', 'expertise'],
    ] as const) {
      await nav.getByRole('link', { name: label }).click()
      await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'true')
      await expect
        .poll(async () => page.evaluate((i) => Math.round(document.getElementById(i)!.getBoundingClientRect().top), id), { timeout: 5000 })
        .toBeLessThan(160)
    }
  })

  test('nav turns solid after scrolling', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header').first()
    await expect(header).not.toHaveClass(/backdrop-blur/)
    await page.evaluate(() => window.scrollTo(0, 600))
    await expect(header).toHaveClass(/backdrop-blur/)
  })

  test('Contact item opens the modal', async ({ page }) => {
    await page.goto('/')
    await openContactFromNav(page)
    await expect(page.getByRole('dialog', { name: "Let's Start a Conversation" })).toBeVisible()
  })

  test('skip link is the first tab stop', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  })
})

test.describe('navigation (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('inline links collapse into a menu that opens, navigates and closes', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden()
    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(menu).toBeVisible()
    await menu.getByRole('button', { name: 'Projects' }).click()
    await expect(menu).toBeHidden()
    await expect
      .poll(async () => page.evaluate(() => Math.round(document.getElementById('projects')!.getBoundingClientRect().top)), { timeout: 5000 })
      .toBeLessThan(140)
  })

  test('menu closes with Escape', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeHidden()
  })

  test('menu Contact opens the contact modal', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('dialog', { name: 'Site navigation' }).getByRole('button', { name: 'Contact' }).click()
    await expect(page.getByRole('dialog', { name: "Let's Start a Conversation" })).toBeVisible()
  })
})
