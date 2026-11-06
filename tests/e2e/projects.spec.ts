import { expect, test } from '@playwright/test'
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

  test('no outcome section, metrics, client names or links are invented', async ({ page }) => {
    await page.goto('/')
    for (const id of ['gti-main', 'gti-north']) {
      const scene = page.locator(`#${id}`)
      await expect(scene.getByRole('button', { name: 'Outcome' })).toHaveCount(0)
      await expect(scene.locator('a[target="_blank"]')).toHaveCount(0)
      const text = await scene.innerText()
      expect(text).not.toMatch(/\d+%|\d+ (users|customers|orders|members)|revenue/i)
    }
  })

  test('the visuals are labelled illustrative and have descriptive alt text', async ({ page }) => {
    await page.goto('/')
    for (const id of ['gti-main', 'gti-north']) {
      await expect(page.locator(`#${id} figcaption`)).toContainText('Illustrative artwork')
      await expect(page.locator(`#${id} img`)).toHaveAttribute('alt', /Not a real screenshot/)
    }
  })
})
