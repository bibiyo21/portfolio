import { expect, test } from '@playwright/test'
import { jumpToScene } from '../fixtures/test-data'

test('a missing image falls back to the neutral placeholder instead of a broken icon', async ({ page }) => {
  await page.route('**/images/projects/gti-main.svg', (route) => route.abort())
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
  for (const m of modes) expect(m.loading, m.src).toBe('lazy')
  await expect(page.locator('#home img')).toHaveCount(0)
})

test('no person image is shown while no approved portrait is supplied', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('img[alt*="ortrait" i]')).toHaveCount(0)
})
