import { expect, test } from '@playwright/test'

test('a missing image falls back to the neutral placeholder instead of a broken icon', async ({ page }) => {
  await page.route('**/images/projects/project-placeholder-1.svg', (route) => route.abort())
  await page.goto('/')
  await page.locator('#projects').scrollIntoViewIfNeeded()
  const img = page.locator('#projects img[data-fallback]').first()
  await expect(img).toBeAttached()
  await expect(img).toHaveAttribute('src', '/images/illustrations/image-fallback.svg')
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0)
})
