import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { scrollThrough } from '../fixtures/test-data'

test.describe('accessibility', () => {
  test('landing page has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)
    await page.waitForTimeout(1500)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    ).toEqual([])
  })

  test('contact modal has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await page.getByRole('dialog').waitFor()
    await page.waitForTimeout(700)
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
  })

  test('has one h1, landmarks, and a logical heading order', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('banner')).toHaveCount(1)
    await expect(page.getByRole('contentinfo')).toHaveCount(1)
    const levels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => Number(h.tagName[1])),
    )
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]! - levels[i - 1]!, `heading jump at index ${i}`).toBeLessThanOrEqual(1)
    }
  })

  test('every image has an alt attribute', async ({ page }) => {
    await page.goto('/')
    const missing = await page.evaluate(() => Array.from(document.images).filter((i) => !i.hasAttribute('alt')).map((i) => i.src))
    expect(missing).toEqual([])
  })

  test('respects prefers-reduced-motion', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Architecting Systems.')
    const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
    expect(behavior).toBe('auto')
    await ctx.close()
  })
})
