import { expect, test } from '@playwright/test'
import { jumpToScene } from '../fixtures/test-data'

test('a missing image falls back to the neutral placeholder instead of a broken icon', async ({ page }) => {
  await page.route('**/images/projects/gti-main-desktop-720.webp', (route) => route.abort())
  await page.goto('/')
  await jumpToScene(page, 'work')
  const img = page.locator('#work img[data-fallback]').first()
  await expect(img).toBeAttached()
  await expect(img).toHaveAttribute('src', '/images/illustrations/image-fallback.svg')
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0)
})

test('below-the-fold images are lazy and the hero art does not depend on photographs', async ({ page }) => {
  await page.goto('/')
  const modes = await page.evaluate(() => Array.from(document.images).map((i) => ({ src: i.src, loading: i.loading })))
  expect(modes.length).toBeGreaterThan(0)
  // Brand logos sit in the header, hero and footer, so they load eagerly. Everything else is lazy.
  for (const m of modes.filter((x) => !x.src.includes('/images/brand/'))) expect(m.loading, m.src).toBe('lazy')
  for (const m of modes.filter((x) => x.src.includes('/images/brand/'))) expect(m.loading, m.src).toBe('eager')
  // The hero carries only the brand mark, no photographs.
  const heroImages = await page.locator('#home img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src))
  for (const src of heroImages) expect(src).toContain('/images/brand/')
})

test('no person image is shown while no approved portrait is supplied', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('img[alt*="ortrait" i]')).toHaveCount(0)
})
