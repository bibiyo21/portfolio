import { expect, test } from '@playwright/test'
import { activeTab, jumpToScene, sceneIds, sceneTop } from '../fixtures/test-data'

test.describe('scene presentation (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('uses CSS scroll snap, mandatory on a large fine-pointer screen', async ({ page }) => {
    await page.goto('/')
    const type = await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)
    expect(type).toMatch(/y mandatory/)
    const align = await page.locator('#about').evaluate((e) => getComputedStyle(e).scrollSnapAlign)
    expect(align).toMatch(/start/)
  })

  test('every scene is at least one viewport tall and grows with its content', async ({ page }) => {
    await page.goto('/')
    const heights = await page.evaluate((ids) => ids.map((id) => [id, Math.round(document.getElementById(id)!.getBoundingClientRect().height)] as const), [...sceneIds])
    for (const [id, h] of heights) expect(h, id).toBeGreaterThanOrEqual(895)
    const faq = heights.find(([id]) => id === 'faq')![1]
    expect(faq).toBeGreaterThan(900)
  })

  test('the wheel scrolls down through scenes and back up natively', async ({ page }) => {
    await page.goto('/')
    await page.mouse.move(720, 450)
    const seen = new Set<string>()
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 700)
      await page.waitForTimeout(500)
      seen.add((await activeTab(page).innerText()).trim())
    }
    expect(seen.size, `tabs seen while scrolling down: ${[...seen]}`).toBeGreaterThanOrEqual(3)
    const down = await page.evaluate(() => window.scrollY)
    expect(down).toBeGreaterThan(900)
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, -700)
      await page.waitForTimeout(500)
    }
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(down - 1500)
  })

  test('keyboard scrolling works: Page Down, arrows, Home and End', async ({ page }) => {
    await page.goto('/')
    await page.locator('body').click({ position: { x: 700, y: 500 } })
    await page.keyboard.press('PageDown')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    await page.keyboard.press('End')
    await expect.poll(() => page.evaluate(() => Math.round(window.innerHeight + window.scrollY)), { timeout: 8000 }).toBeGreaterThanOrEqual(await page.evaluate(() => document.documentElement.scrollHeight) - 4)
    await expect(activeTab(page)).toHaveText('Contact')
    await page.keyboard.press('Home')
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 8000 }).toBe(0)
    await expect(activeTab(page)).toHaveText('Home')
  })

  test('the footer is reachable and not skipped by snapping', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'contact')
    await page.keyboard.press('End')
    await expect(page.getByRole('contentinfo')).toBeInViewport()
  })

  test('the progress rail has a dot per scene and navigates to the right scene', async ({ page }) => {
    await page.goto('/')
    const rail = page.getByRole('navigation', { name: 'Scene progress' })
    await expect(rail.getByRole('link')).toHaveCount(12)
    await rail.getByRole('link', { name: /Scene 8 of 12: Architecture/ }).click()
    await expect.poll(() => sceneTop(page, 'architecture'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await expect(rail.getByRole('link', { name: /Architecture/ })).toHaveAttribute('aria-current', 'location')
  })

  test('previous and next controls target the neighbouring scenes', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Previous scene/ })).toHaveCount(0)
    await page.getByRole('link', { name: 'Next scene: About' }).click()
    await expect.poll(() => sceneTop(page, 'about'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await page.getByRole('link', { name: 'Next scene: Expertise' }).click()
    await expect.poll(() => sceneTop(page, 'expertise'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await page.getByRole('link', { name: 'Previous scene: About' }).click()
    await expect.poll(() => sceneTop(page, 'about'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await jumpToScene(page, 'contact')
    await expect(page.getByRole('link', { name: /Next scene/ })).toHaveCount(0)
  })

  test('scene controls never overlap the scene content they sit beside', async ({ page }) => {
    await page.goto('/')
    const controls = await page.getByRole('navigation', { name: 'Scene progress' }).boundingBox()
    for (const id of sceneIds) {
      await jumpToScene(page, id)
      const overlap = await page.evaluate((c) => {
        const scene = document.querySelector<HTMLElement>('main section:target, main section[data-scene]')!
        void scene
        const hits: string[] = []
        document.querySelectorAll<HTMLElement>('main a, main button, main h1, main h2, main h3, main p, main li').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) return
          if (r.right > c.x && r.left < c.x + c.width && r.bottom > c.y && r.top < c.y + c.height) hits.push(el.tagName + ':' + (el.textContent ?? '').slice(0, 30))
        })
        return hits
      }, controls!)
      expect(overlap, `${id}`).toEqual([])
    }
  })

  test('inactive scenes never block clicks: every scene stays interactive after scrolling past others', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'faq')
    await jumpToScene(page, 'expertise')
    await page.getByRole('tab', { name: 'Data and caching' }).click()
    await expect(page.getByRole('tab', { name: 'Data and caching' })).toHaveAttribute('aria-selected', 'true')
    await jumpToScene(page, 'faq')
    await page.getByRole('button', { name: 'Who is Ibrahem Sotejo?' }).click()
    await expect(page.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })).toHaveAttribute('aria-expanded', 'true')
    const blocked = await page.evaluate(() => {
      const bad: string[] = []
      document.querySelectorAll<HTMLElement>('main [data-scene]').forEach((s) => {
        if (getComputedStyle(s).pointerEvents === 'none' || getComputedStyle(s).visibility === 'hidden') bad.push(s.id)
      })
      return bad
    })
    expect(blocked).toEqual([])
  })

  test('contact stays reachable without waiting for any animation', async ({ page }) => {
    await page.goto('/#contact')
    await page.getByRole('button', { name: 'Send an inquiry' }).click()
    await expect(page.getByRole('dialog', { name: "Let's Start a Conversation" })).toBeVisible()
  })

  test('essential content is in the DOM before any animation completes', async ({ page }) => {
    await page.goto('/')
    const text = await page.evaluate(() => document.querySelector('main')!.textContent!)
    for (const needle of ['Solutions30 Group SA', 'Certified SAFe 5 Agilist', 'GTI North', 'Who is Ibrahem Sotejo?', 'ibrahem.sotejo.dev@gmail.com']) expect(text).toContain(needle)
  })

  test('parallax layers move while a scene crosses the viewport', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'about')
    const layer = page.locator('#about [aria-hidden="true"] > div').first()
    const a = await layer.evaluate((e) => getComputedStyle(e).transform)
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(500)
    const b = await layer.evaluate((e) => getComputedStyle(e).transform)
    expect(a).not.toBe(b)
  })
})

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

  test('removes parallax, smooth scrolling and large movement', async ({ page }) => {
    await page.goto('/')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
    await jumpToScene(page, 'about')
    const layer = page.locator('#about [aria-hidden="true"] > div').first()
    const a = await layer.evaluate((e) => getComputedStyle(e).transform)
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(400)
    const b = await layer.evaluate((e) => getComputedStyle(e).transform)
    expect(b).toBe(a)
    await jumpToScene(page, 'home')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Architecting Systems.')
  })

  test('tab navigation lands on the scene immediately', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'FAQ' }).click()
    await expect.poll(() => sceneTop(page, 'faq'), { timeout: 1500 }).toBeLessThanOrEqual(2)
  })
})

test.describe('mobile scrolling', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('uses gentle proximity snapping and never traps scrolling', async ({ page }) => {
    await page.goto('/')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toMatch(/^y( proximity)?$/)
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).not.toBe('hidden')
    await page.mouse.move(200, 400)
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, 500)
      await page.waitForTimeout(250)
    }
    const down = await page.evaluate(() => window.scrollY)
    expect(down).toBeGreaterThan(900)
    await page.mouse.wheel(0, -500)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(down)
  })

  test('removes large parallax on mobile', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'about')
    const layer = page.locator('#about [aria-hidden="true"] > div').first()
    const a = await layer.evaluate((e) => getComputedStyle(e).transform)
    await page.mouse.move(200, 400)
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(400)
    expect(await layer.evaluate((e) => getComputedStyle(e).transform)).toBe(a)
  })

  test('the desktop progress rail and prev/next are not shown, a progress bar is', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Scene progress' })).toBeHidden()
    await expect(page.getByRole('progressbar', { name: 'Scene progress' })).toBeVisible()
    await jumpToScene(page, 'architecture')
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '8')
  })
})
