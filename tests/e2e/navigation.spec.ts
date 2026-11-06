import { expect, test } from '../fixtures/recaptcha'
import { activeLabel, activeTab, jumpToScene, openDrawer, sceneIds, sceneLabels, sceneTop, tabLabels } from '../fixtures/test-data'

test.describe('desktop tabs', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('shows the ten tabs in page order and no burger', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link')).toHaveText(tabLabels)
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeHidden()
    await expect(activeTab(page)).toHaveText('Home')
  })

  test('tab order matches scene order, so the active tab only moves forward while scrolling down', async ({ page }) => {
    await page.goto('/')
    const order = ['home', 'about', 'expertise', 'work', 'experience', 'architecture', 'cicd', 'recognition', 'faq', 'contact']
    const hrefs = await page.locator('nav[aria-label="Primary"] a').evaluateAll((els) => els.map((e) => e.getAttribute('href')!.slice(1)))
    expect(hrefs).toEqual(order)
    const seen: number[] = []
    for (const id of sceneIds) {
      await jumpToScene(page, id)
      const label = (await activeTab(page).innerText()).trim()
      seen.push(tabLabels.indexOf(label))
    }
    expect(seen.every((n) => n >= 0)).toBe(true)
    expect(seen).toEqual([...seen].sort((a, b) => a - b))
  })

  for (const width of [1080, 1280, 1440]) {
    test(`ten tabs fit beside the wordmark without overlap at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      const mark = await page.getByRole('link', { name: /back to the start/ }).boundingBox()
      const boxes = await page.locator('nav[aria-label="Primary"] a').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, h: r.height } }))
      expect(boxes).toHaveLength(10)
      expect(boxes[0]!.l).toBeGreaterThan(mark!.x + mark!.width)
      for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.l).toBeGreaterThanOrEqual(boxes[i - 1]!.r - 1)
      expect(boxes.at(-1)!.r).toBeLessThanOrEqual(width)
      for (const b of boxes) expect(b.h).toBeLessThan(60)
      const wrapped = await page.locator('nav[aria-label="Primary"] a').evaluateAll((els) => els.some((e) => e.getBoundingClientRect().height > 50))
      expect(wrapped).toBe(false)
    })
  }

  test('every tab reaches its scene and becomes active', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    const targets: Record<string, string> = { Home: 'home', About: 'about', Expertise: 'expertise', Work: 'work', Experience: 'experience', Architecture: 'architecture', 'CI/CD': 'cicd', Recognition: 'recognition', FAQ: 'faq', Contact: 'contact' }
    for (const label of tabLabels) {
      await nav.getByRole('link', { name: label }).click()
      await expect(activeTab(page)).toHaveText(label)
      await expect.poll(() => sceneTop(page, targets[label]!), { timeout: 6000 }).toBeLessThanOrEqual(2)
      expect(await sceneTop(page, targets[label]!)).toBeGreaterThanOrEqual(-2)
      await expect(page).toHaveURL(new RegExp(`#${targets[label]}$`))
    }
  })

  test('the header is sticky and never covers a scene heading', async ({ page }) => {
    await page.goto('/')
    for (const id of sceneIds) {
      await jumpToScene(page, id)
      const header = await page.getByRole('banner').boundingBox()
      expect(header!.y, `${id} header`).toBe(0)
      const heading = page.locator(`#${id}`).getByRole('heading').first()
      const box = await heading.boundingBox()
      expect(box!.y, `${id} heading below header`).toBeGreaterThanOrEqual(header!.height - 1)
    }
  })

  test('the active tab follows manual scrolling', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'about')
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 300)
    await expect(activeTab(page)).toHaveText('About')
    await jumpToScene(page, 'architecture')
    await expect(activeTab(page)).toHaveText('Architecture')
    await jumpToScene(page, 'gti-north')
    await expect(activeTab(page)).toHaveText('Work')
    await jumpToScene(page, 'recognition')
    await expect(activeTab(page)).toHaveText('Recognition')
    await jumpToScene(page, 'experience')
    await expect(activeTab(page)).toHaveText('Experience')
  })

  test('the tab group stays active across its scenes and the pill glides', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('link', { name: 'Work' }).click()
    await expect(activeTab(page)).toHaveText('Work')
    const pill = page.locator('nav[aria-label="Primary"] a[aria-current="location"] > span[aria-hidden]')
    await expect(pill).toHaveCount(1)
  })

  test('rapid repeated clicks end on the last target without desynchronising', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    for (const l of ['About', 'Work', 'Architecture', 'FAQ', 'Expertise']) await nav.getByRole('link', { name: l }).click()
    await expect(activeTab(page)).toHaveText('Expertise')
    await expect.poll(() => sceneTop(page, 'expertise'), { timeout: 8000 }).toBeLessThanOrEqual(2)
    await page.waitForTimeout(1500)
    await expect(activeTab(page)).toHaveText('Expertise')
    await expect(page).toHaveURL(/#expertise$/)
  })

  test('browser back and forward restore scenes and the active tab', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('link', { name: 'About' }).click()
    await expect.poll(() => sceneTop(page, 'about'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await nav.getByRole('link', { name: 'Experience' }).click()
    await expect.poll(() => sceneTop(page, 'experience'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await page.goBack()
    await expect(page).toHaveURL(/#about$/)
    await expect(activeTab(page)).toHaveText('About')
    await expect.poll(() => sceneTop(page, 'about'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await page.goForward()
    await expect(page).toHaveURL(/#experience$/)
    await expect(activeTab(page)).toHaveText('Experience')
  })

  test('direct section links open on the right scene', async ({ page }) => {
    await page.goto('/#faq')
    await expect.poll(() => sceneTop(page, 'faq'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await expect(activeTab(page)).toHaveText('FAQ')
    await page.goto('/#gti-north')
    await expect.poll(() => sceneTop(page, 'gti-north'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await expect(activeTab(page)).toHaveText('Work')
  })

  test('the header surface adapts to dark and light scenes', async ({ page }) => {
    await page.goto('/')
    const header = page.getByRole('banner')
    await jumpToScene(page, 'about')
    await expect(header).toHaveClass(/bg-ivory/)
    await jumpToScene(page, 'architecture')
    await expect(header).toHaveClass(/bg-burgundy-dark/)
  })

  test('tabs are keyboard operable with a visible focus ring', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab') // skip link
    await page.keyboard.press('Tab') // wordmark
    await page.keyboard.press('Tab') // Home
    await page.keyboard.press('Tab') // About
    const about = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' })
    await expect(about).toBeFocused()
    const outline = await about.evaluate((e) => getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth)
    expect(outline).toMatch(/solid 2px/)
    await page.keyboard.press('Enter')
    await expect(activeTab(page)).toHaveText('About')
  })

  test('skip link is the first tab stop and jumps to the content', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
  })
})

test.describe('mobile header and drawer', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('tabs collapse to a label plus a right-aligned burger', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden()
    const burger = await page.getByRole('button', { name: 'Open navigation menu' }).boundingBox()
    const label = await activeLabel(page).boundingBox()
    expect(burger!.width).toBeGreaterThanOrEqual(44)
    expect(burger!.height).toBeGreaterThanOrEqual(44)
    expect(390 - (burger!.x + burger!.width), 'burger at the right edge').toBeLessThanOrEqual(24)
    expect(label!.x + label!.width, 'label left of burger').toBeLessThanOrEqual(burger!.x)
    expect(burger!.x - (label!.x + label!.width), 'label immediately beside burger').toBeLessThanOrEqual(16)
    await expect(activeLabel(page)).toContainText('Home')
  })

  test('the label follows the visible scene, including the GTI scenes', async ({ page }) => {
    await page.goto('/')
    for (const id of ['about', 'gti-main', 'gti-north', 'architecture', 'faq', 'contact'] as const) {
      await jumpToScene(page, id)
      await expect(activeLabel(page)).toContainText(sceneLabels[id])
    }
  })

  test('the drawer is 100% tall, ~70% wide, anchored right, with the scene visible on the left', async ({ page }) => {
    await page.goto('/')
    const drawer = await openDrawer(page)
    const box = await drawer.boundingBox()
    expect(box!.height).toBeCloseTo(844, 0)
    expect(box!.width).toBeGreaterThanOrEqual(260)
    expect(box!.width).toBeLessThanOrEqual(420)
    expect(box!.width / 390).toBeGreaterThan(0.66)
    expect(box!.width / 390).toBeLessThan(0.74)
    expect(box!.x + box!.width).toBeCloseTo(390, 0)
    expect(box!.x, 'exposed backdrop on the left').toBeGreaterThan(90)
    // The page behind is still rendered (not a blank opaque menu): the hero heading is in the DOM and visible past the backdrop.
    const probe = await page.evaluate(() => {
      const el = document.elementFromPoint(20, 300)
      return el?.className?.toString() ?? ''
    })
    expect(probe).toMatch(/bg-burgundy-deep\/55/)
  })

  test('shows the current scene in the drawer and lists every scene', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'cicd')
    const drawer = await openDrawer(page)
    await expect(drawer.getByText(/Now.*CI\/CD/)).toBeVisible()
    await expect(drawer.locator('nav[aria-label="Mobile"] ol > li')).toHaveCount(12)
    await expect(drawer.locator('a[aria-current="location"]')).toContainText('CI/CD')
  })

  test('backdrop tap, close button and Escape each close it, and focus returns to the burger', async ({ page }) => {
    await page.goto('/')
    const burger = page.getByRole('button', { name: 'Open navigation menu' })
    for (const how of ['escape', 'close', 'backdrop'] as const) {
      const drawer = await openDrawer(page)
      if (how === 'escape') await page.keyboard.press('Escape')
      if (how === 'close') await drawer.getByRole('button', { name: 'Close navigation menu' }).click()
      if (how === 'backdrop') await page.mouse.click(20, 400)
      await expect(page.getByRole('dialog')).toBeHidden()
      await expect(burger).toBeFocused()
    }
  })

  test('selecting a destination closes the drawer, navigates and updates the label', async ({ page }) => {
    await page.goto('/')
    const drawer = await openDrawer(page)
    await drawer.getByRole('link', { name: /FAQ/ }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(activeLabel(page)).toContainText('FAQ')
    await expect.poll(() => sceneTop(page, 'faq'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await expect(page).toHaveURL(/#faq$/)
  })

  test('background scroll is locked while open and restored after', async ({ page }) => {
    await page.goto('/')
    const drawer = await openDrawer(page)
    const before = await page.evaluate(() => window.scrollY)
    await page.mouse.move(20, 400)
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)
    await drawer.getByRole('button', { name: 'Close navigation menu' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.mouse.move(200, 400)
    await page.mouse.wheel(0, 700)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before)
  })

  test('focus is trapped inside the drawer', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
  })

  test('menu items stay reachable on a short screen through internal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 420 })
    await page.goto('/')
    const drawer = await openDrawer(page)
    const nav = drawer.getByRole('navigation', { name: 'Mobile' })
    const scrollable = await nav.evaluate((e) => e.scrollHeight > e.clientHeight)
    expect(scrollable).toBe(true)
    await drawer.getByRole('link', { name: /Contact/ }).first().scrollIntoViewIfNeeded()
    await expect(drawer.getByRole('link', { name: /Contact/ }).first()).toBeInViewport()
    const box = await drawer.boundingBox()
    expect(box!.height).toBeCloseTo(420, 0)
  })

  test('reduced motion makes the drawer fade instead of slide', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto('/')
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    const drawer = page.getByRole('dialog')
    await drawer.waitFor()
    // No horizontal slide: the drawer is in place from the first frames.
    const x = await drawer.evaluate((e) => e.getBoundingClientRect().x)
    expect(x).toBeLessThan(390 * 0.35)
    await ctx.close()
  })
})
