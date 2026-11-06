import { expect, test } from '@playwright/test'
import { desktopViewports, expectNoHorizontalOverflow, scrollThrough, waitForImages, sectionIds, trackErrors } from '../fixtures/test-data'

test.describe('homepage', () => {
  test('loads with title, hero headline and no console errors', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await expect(page).toHaveTitle(/Solutions Architect/)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toContainText('Architecting Systems.')
    await expect(h1).toContainText('Engineering Experiences.')
    await expect(h1).toContainText('Building Possibilities.')
    await expect(page.getByText('Solutions Architect | Software Engineer | Digital Builder')).toBeVisible()
    await expect(page.getByTestId('availability')).toBeVisible()
    await scrollThrough(page)
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('renders every section in order', async ({ page }) => {
    await page.goto('/')
    for (const id of sectionIds) {
      await expect(page.locator(`#${id}`), `section #${id}`).toBeAttached()
    }
    const order = await page.evaluate((ids) => ids.map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? -1), [...sectionIds])
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  test('hero has both CTAs and a portrait', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Let.s Connect/ })).toBeVisible()
    await expect(page.locator('#home img[alt*="ortrait"]').first()).toBeVisible()
  })

  test('experience timeline lists all provided roles with original dates', async ({ page }) => {
    await page.goto('/')
    const exp = page.locator('#experience')
    await expect(exp.getByRole('heading', { level: 3 })).toHaveCount(6)
    for (const text of [
      'June 2026 – Present',
      'December 2025 – June 2026',
      'March 2019 – November 2025',
      'June 2021 – November 2023',
      'March 2019 – June 2021',
      'Earlier experience',
    ]) {
      await expect(exp.getByText(text, { exact: true })).toBeVisible()
    }
  })

  test('footer contact CTA opens the contact modal', async ({ page }) => {
    await page.goto('/')
    await page.locator('#contact').getByRole('button', { name: 'Contact Me' }).click()
    await expect(page.getByRole('dialog', { name: "Let's Start a Conversation" })).toBeVisible()
  })

  test('all images load', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)
    await waitForImages(page)
    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src),
    )
    expect(broken).toEqual([])
  })

  for (const vp of desktopViewports) {
    test(`desktop ${vp.name}: no horizontal overflow, nav visible`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await scrollThrough(page)
      await expectNoHorizontalOverflow(page)
      await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
      const h1 = await page.getByRole('heading', { level: 1 }).boundingBox()
      expect(h1).not.toBeNull()
      expect(h1!.y + h1!.height).toBeLessThan(vp.height)
    })
  }
})
