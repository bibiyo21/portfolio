import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene, openDrawer, sceneIds, visitAllScenes } from '../fixtures/test-data'

const serious = (results: Awaited<ReturnType<AxeBuilder['analyze']>>) =>
  results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)

test.describe('accessibility (axe-core)', () => {
  for (const id of sceneIds) {
    test(`scene ${id} has no serious or critical violations`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto('/')
      await visitAllScenes(page)
      await jumpToScene(page, id)
      await page.waitForTimeout(1300)
      const results = await new AxeBuilder({ page }).include(`#${id}`).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(serious(results)).toEqual([])
    })
  }

  test('header and scene controls have no serious violations', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(800)
    const results = await new AxeBuilder({ page }).include('header').include('nav[aria-label="Scene progress"]').analyze()
    expect(serious(results)).toEqual([])
  })

  test('the mobile drawer has no serious violations', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await openDrawer(page)
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze()
    expect(serious(results)).toEqual([])
  })

  test('the contact modal has no serious violations', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await page.getByRole('dialog').waitFor()
    await page.waitForTimeout(700)
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze()
    expect(serious(results)).toEqual([])
  })

  test('with an FAQ answer open and a case-study section open', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await jumpToScene(page, 'gti-main')
    await page.locator('#gti-main').getByRole('button', { name: 'Architecture and approach' }).click()
    await jumpToScene(page, 'faq')
    await page.getByRole('button', { name: 'Who is Ibrahem Sotejo?' }).click()
    await page.waitForTimeout(800)
    const results = await new AxeBuilder({ page }).include('#gti-main').include('#faq').analyze()
    expect(serious(results)).toEqual([])
  })
})

test.describe('structure and semantics', () => {
  test('has one h1, one main, one banner, one contentinfo and a skip link', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('banner')).toHaveCount(1)
    await expect(page.getByRole('contentinfo')).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
  })

  test('heading levels never skip downwards across the whole page', async ({ page }) => {
    await page.goto('/')
    const levels = await page.evaluate(() => Array.from(document.querySelectorAll('h1,h2,h3,h4,h5')).map((h) => Number(h.tagName[1])))
    for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!, `heading jump at index ${i}`).toBeLessThanOrEqual(1)
  })

  test('navigation landmarks have distinct accessible names', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const names = await page.evaluate(() => Array.from(document.querySelectorAll('nav')).map((n) => n.getAttribute('aria-label')))
    expect(names.every(Boolean)).toBe(true)
    expect(new Set(names).size).toBe(names.length)
  })

  test('every image has an alt attribute and informative images describe themselves', async ({ page }) => {
    await page.goto('/')
    const missing = await page.evaluate(() => Array.from(document.images).filter((i) => !i.hasAttribute('alt')).map((i) => i.src))
    expect(missing).toEqual([])
    const informative = await page.evaluate(() => Array.from(document.images).filter((i) => i.alt !== '').map((i) => i.alt))
    for (const alt of informative) expect(alt.length).toBeGreaterThan(10)
  })

  test('the active scene is not signalled by colour alone', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await jumpToScene(page, 'work')
    const active = page.locator('nav[aria-label="Primary"] a[aria-current="location"]')
    await expect(active).toHaveAttribute('aria-current', 'location')
    expect(await active.evaluate((e) => getComputedStyle(e).fontWeight)).toMatch(/500|600/)
    await expect(page.locator('nav[aria-label="Scene progress"] a[aria-current="location"]')).toHaveCount(1)
  })

  test('focus is never moved automatically when a scene becomes active', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Skip to content' }).focus()
    await jumpToScene(page, 'architecture')
    await page.waitForTimeout(500)
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  })

  test('every interactive control shows a visible focus indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const missing: string[] = []
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab')
      const r = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null
        if (!e || e === document.body) return null
        const cs = getComputedStyle(e)
        return { label: (e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 30), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2, shadow: cs.boxShadow !== 'none' }
      })
      if (r && !r.outline && !r.shadow) missing.push(r.label)
    }
    expect(missing).toEqual([])
  })

  test('reduced motion keeps content readable', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Architecting Systems.')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
    await ctx.close()
  })
})
