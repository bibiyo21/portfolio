import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene, sceneTop } from '../fixtures/test-data'

test.describe('featured work and GTI case studies', () => {
  test('the Work scene presents the GTI family with two cards and the relationship', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'work')
    await expect(page.getByRole('heading', { level: 2, name: 'GTI Digital Platform — Main & North' })).toBeVisible()
    await expect(page.getByTestId('project-card')).toHaveCount(2)
    await expect(page.locator('#work')).toContainText('North is a location-specific implementation')
    await expect(page.getByRole('group', { name: /filter projects/i })).toHaveCount(0)
  })

  test('cards link to their dedicated case-study scenes', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'work')
    await page.getByRole('link', { name: /GTI North/ }).first().click()
    await expect.poll(() => sceneTop(page, 'gti-north'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await expect(page).toHaveURL(/#gti-north$/)
  })

  test('GTI Main and GTI North are distinct, related scenes', async ({ page }) => {
    await page.goto('/')
    const bg = await page.evaluate(() => ({
      main: getComputedStyle(document.getElementById('gti-main')!).backgroundColor,
      north: getComputedStyle(document.getElementById('gti-north')!).backgroundColor,
      mainImg: document.querySelector<HTMLImageElement>('#gti-main img')!.src,
      northImg: document.querySelector<HTMLImageElement>('#gti-north img')!.src,
    }))
    expect(bg.main).not.toBe(bg.north)
    expect(bg.mainImg).not.toBe(bg.northImg)
    await jumpToScene(page, 'gti-main')
    await expect(page.locator('#gti-main')).toContainText('Case study 1 of 2')
    await expect(page.locator('#gti-main')).toContainText('Primary platform')
    await jumpToScene(page, 'gti-north')
    await expect(page.locator('#gti-north')).toContainText('Case study 2 of 2')
    await expect(page.locator('#gti-north')).toContainText('Location implementation')
    await page.locator('#gti-north').getByRole('navigation', { name: /GTI case studies/ }).getByRole('link', { name: 'GTI Main' }).click()
    await expect.poll(() => sceneTop(page, 'gti-main'), { timeout: 6000 }).toBeLessThanOrEqual(2)
  })

  test('the layout direction is mirrored between the two case studies (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await jumpToScene(page, 'gti-main')
    await page.waitForTimeout(1200)
    const main = await page.evaluate(() => {
      const img = document.querySelector('#gti-main img')!.getBoundingClientRect()
      const h = document.querySelector('#gti-main h2')!.getBoundingClientRect()
      return img.x < h.x
    })
    await jumpToScene(page, 'gti-north')
    await page.waitForTimeout(1200)
    const north = await page.evaluate(() => {
      const img = document.querySelector('#gti-north img')!.getBoundingClientRect()
      const h = document.querySelector('#gti-north h2')!.getBoundingClientRect()
      return img.x < h.x
    })
    expect(main).toBe(true)
    expect(north).toBe(false)
  })

  test('case-study sections expand as an accessible accordion without clipping', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'gti-main')
    const scene = page.locator('#gti-main')
    const approach = scene.getByRole('button', { name: 'Architecture and approach' })
    await expect(approach).toHaveAttribute('aria-expanded', 'false')
    await approach.click()
    await expect(approach).toHaveAttribute('aria-expanded', 'true')
    const region = scene.getByRole('region', { name: 'Architecture and approach' })
    await expect(region).toContainText('Proposed / designed')
    await expect(region).toContainText('Registration and payment workflow')
    await expect.poll(() => region.evaluate((e) => e.scrollHeight - e.clientHeight), { timeout: 4000 }).toBeLessThanOrEqual(2)
    await approach.focus()
    await page.keyboard.press('Enter')
    await expect(approach).toHaveAttribute('aria-expanded', 'false')
  })

  test('statuses are labelled and nothing is claimed as implemented', async ({ page }) => {
    await page.goto('/')
    for (const id of ['gti-main', 'gti-north']) {
      await jumpToScene(page, id)
      const scene = page.locator(`#${id}`)
      await scene.getByRole('button', { name: 'Architecture and approach' }).click()
      await expect(scene.getByText('Proposed / designed').first()).toBeVisible()
      await expect(scene.getByText('Implemented')).toHaveCount(0)
      await expect(scene).toContainText('Status labels distinguish delivered work from proposed or planned architecture')
    }
  })

  test('no outcome section or invented metrics, and the only external link is the supplied live site', async ({ page }) => {
    await page.goto('/')
    const live = { 'gti-main': 'https://goalietraininginstitute.ca/', 'gti-north': 'https://north.goalietraininginstitute.ca/' }
    for (const id of ['gti-main', 'gti-north'] as const) {
      const scene = page.locator(`#${id}`)
      await expect(scene.getByRole('button', { name: 'Outcome' })).toHaveCount(0)
      const links = scene.locator('a[target="_blank"]')
      await expect(links).toHaveCount(1)
      await expect(links.first()).toHaveAttribute('href', live[id])
      await expect(links.first()).toHaveAttribute('rel', /noopener/)
      const text = await scene.innerText()
      expect(text).not.toMatch(/\d+%|\d+ (users|customers|orders|members)|revenue/i)
    }
  })

  test('the scenes show real screenshots of the live homepages, with a capture date', async ({ page }) => {
    await page.goto('/')
    for (const id of ['gti-main', 'gti-north'] as const) {
      await jumpToScene(page, id)
      const scene = page.locator(`#${id}`)
      await expect(scene).toContainText('Screenshots of the live site, captured 6 November 2026')
      await expect(scene).not.toContainText('Illustrative artwork')
      const desktop = scene.getByTestId('desktop-preview').locator('img')
      const mobile = scene.getByTestId('mobile-preview').locator('img')
      await expect(desktop).toHaveAttribute('alt', /Screenshot of the GTI (Main|North) homepage on desktop/)
      await expect(mobile).toHaveAttribute('alt', /on a phone/)
      for (const img of [desktop, mobile]) {
        await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth)).toBeGreaterThan(300)
      }
    }
  })

  test('Main and North use different screenshots and show their own site address', async ({ page }) => {
    await page.goto('/')
    const src = (id: string) => page.locator(`#${id} [data-testid="desktop-preview"] img`).getAttribute('src')
    expect(await src('gti-main')).not.toBe(await src('gti-north'))
    await expect(page.locator('#gti-main [data-testid="desktop-preview"]')).toContainText('goalietraininginstitute.ca')
    await expect(page.locator('#gti-north [data-testid="desktop-preview"]')).toContainText('north.goalietraininginstitute.ca')
  })

  test('the phone preview overlaps the desktop frame without overflowing the scene', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await jumpToScene(page, 'gti-main')
    await page.waitForTimeout(1200)
    const d = await page.locator('#gti-main [data-testid="desktop-preview"]').boundingBox()
    const m = await page.locator('#gti-main [data-testid="mobile-preview"]').boundingBox()
    expect(m!.x).toBeGreaterThan(d!.x + d!.width * 0.6)
    expect(m!.y + m!.height).toBeGreaterThan(d!.y + d!.height)
    expect(m!.x + m!.width).toBeLessThanOrEqual(1440)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })

  test('View full homepage opens a scrollable full-page preview with Desktop and Mobile tabs', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'gti-main')
    const scene = page.locator('#gti-main')
    expect(await page.locator('img[src*="-full.webp"]').count()).toBe(0)
    await scene.getByRole('button', { name: 'View full homepage' }).click()
    const dialog = page.getByRole('dialog', { name: 'GTI Main homepage' })
    await expect(dialog).toBeVisible()
    const region = dialog.getByRole('region', { name: /desktop homepage, scrollable/ })
    const img = region.locator('img')
    await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalHeight)).toBeGreaterThan(3000)
    expect(await region.evaluate((e) => e.scrollHeight > e.clientHeight * 2)).toBe(true)
    await region.focus()
    await page.keyboard.press('PageDown')
    await expect.poll(() => region.evaluate((e) => e.scrollTop)).toBeGreaterThan(100)
    await dialog.getByRole('tab', { name: 'Mobile' }).click()
    const mobile = dialog.getByRole('region', { name: /mobile homepage, scrollable/ })
    await expect(mobile).toBeVisible()
    await expect.poll(() => mobile.locator('img').evaluate((e: HTMLImageElement) => e.complete && e.naturalHeight)).toBeGreaterThan(4000)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(scene.getByRole('button', { name: 'View full homepage' })).toBeFocused()
  })

  test('the full-page dialog fits a phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await jumpToScene(page, 'gti-north')
    await page.locator('#gti-north').getByRole('button', { name: 'View full homepage' }).click()
    const dialog = page.getByRole('dialog', { name: 'GTI North homepage' })
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(700)
    const box = await dialog.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(391)
    expect(box!.y + box!.height).toBeLessThanOrEqual(845)
  })

  test('the screenshot files are real captures at the documented sizes', async ({ page }) => {
    const size = async (path: string) => {
      const r = await page.request.get(path)
      expect(r.status(), path).toBe(200)
      expect(r.headers()['content-type']).toContain('webp')
      const b = await r.body()
      expect(b.subarray(0, 4).toString()).toBe('RIFF')
      return b.length
    }
    for (const site of ['main', 'north']) {
      expect(await size(`/images/projects/gti-${site}-desktop.webp`)).toBeGreaterThan(20_000)
      expect(await size(`/images/projects/gti-${site}-mobile.webp`)).toBeGreaterThan(10_000)
      expect(await size(`/images/projects/gti-${site}-desktop-720.webp`)).toBeLessThan(120_000)
    }
  })
})
