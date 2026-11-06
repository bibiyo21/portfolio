import { expect, test } from '../fixtures/recaptcha'
import {
  TAB_BREAKPOINT,
  desktopViewports,
  expectNoHorizontalOverflow,
  jumpToScene,
  mobileViewports,
  sceneIds,
  tabletViewports,
  trackErrors,
  visitAllScenes,
  waitForImages,
} from '../fixtures/test-data'

const all = [
  ...desktopViewports.map((v) => ({ ...v, kind: 'desktop' as const })),
  ...tabletViewports.map((v) => ({ ...v, kind: 'tablet' as const })),
  ...mobileViewports.map((v) => ({ ...v, kind: 'mobile' as const })),
]

for (const vp of all) {
  test.describe(`${vp.kind}: ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const compact = vp.width < TAB_BREAKPOINT

    test('no horizontal overflow, no console errors, images load', async ({ page }) => {
      const errors = trackErrors(page)
      await page.goto('/')
      await visitAllScenes(page)
      await waitForImages(page)
      await expectNoHorizontalOverflow(page)
      const broken = await page.evaluate(() => Array.from(document.images).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src))
      expect(broken).toEqual([])
      expect(errors, errors.join('\n')).toEqual([])
    })

    test('navigation collapses or expands correctly for the width', async ({ page }) => {
      await page.goto('/')
      const tabs = page.getByRole('navigation', { name: 'Primary' })
      const burger = page.getByRole('button', { name: 'Open navigation menu' })
      if (compact) {
        await expect(tabs).toBeHidden()
        await expect(burger).toBeVisible()
        await expect(page.getByTestId('active-label')).toBeVisible()
      } else {
        await expect(tabs).toBeVisible()
        await expect(burger).toBeHidden()
      }
    })

    test('the header never wraps or overflows', async ({ page }) => {
      await page.goto('/')
      const h = await page.getByRole('banner').evaluate((e) => ({ h: e.getBoundingClientRect().height, sw: e.scrollWidth, cw: e.clientWidth }))
      expect(h.sw).toBeLessThanOrEqual(h.cw)
      expect(h.h).toBeLessThanOrEqual(compact ? 66 : 76)
    })

    test('headlines wrap inside the viewport and stay readable', async ({ page }) => {
      await page.goto('/')
      const sizes = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('main h1, main h2')).map((h) => {
          const r = h.getBoundingClientRect()
          return { text: h.textContent!.slice(0, 30), right: r.right, font: parseFloat(getComputedStyle(h).fontSize) }
        }),
      )
      for (const s of sizes) {
        expect(s.right, s.text).toBeLessThanOrEqual(vp.width + 1)
        expect(s.font, s.text).toBeGreaterThanOrEqual(30)
      }
    })

    test('hero headline and primary action are visible on first load', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 0.9 })
      await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeInViewport()
    })

    test('scenes are never shorter than the viewport and never clipped by a fixed height', async ({ page }) => {
      await page.goto('/')
      const rows = await page.evaluate((ids) => ids.map((id) => {
        const el = document.getElementById(id)!
        // Decorative backdrops may extend past the scene (they are clipped on purpose); the real content must not.
        const content = el.querySelector(':scope > div.relative')!.getBoundingClientRect()
        const box = el.getBoundingClientRect()
        return { id, h: box.height, contentBottom: content.bottom, sceneBottom: box.bottom }
      }), [...sceneIds])
      for (const r of rows) {
        expect(r.h, r.id).toBeGreaterThanOrEqual(vp.height - 2)
        expect(r.contentBottom, `${r.id} content not clipped`).toBeLessThanOrEqual(r.sceneBottom + 1)
      }
    })

    test('the contact modal fits the viewport and is operable', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
      const dialog = page.getByRole('dialog', { name: "Let's Start a Conversation" })
      await expect(dialog).toBeVisible()
      await page.waitForTimeout(700)
      const box = await dialog.boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1)
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 1)
      await dialog.getByRole('button', { name: 'Submit Inquiry' }).scrollIntoViewIfNeeded()
      await expect(dialog.getByRole('button', { name: 'Submit Inquiry' })).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
    })

    test('GTI cards stack in one column on narrow screens and stay in the viewport', async ({ page }) => {
      await page.goto('/')
      await jumpToScene(page, 'work')
      await page.waitForTimeout(800)
      const boxes = await page.getByTestId('project-card').evaluateAll((els) => els.map((e) => ({ l: e.getBoundingClientRect().left, r: e.getBoundingClientRect().right })))
      for (const b of boxes) {
        expect(b.l).toBeGreaterThanOrEqual(0)
        expect(b.r).toBeLessThanOrEqual(vp.width + 1)
      }
      if (vp.width < 768) expect(new Set(boxes.map((b) => Math.round(b.l))).size).toBe(1)
    })

    test('the architecture and CI/CD diagrams fit and stay legible', async ({ page }) => {
      await page.goto('/')
      for (const id of ['architecture', 'cicd']) {
        await jumpToScene(page, id)
        await page.locator(`#${id} svg[role="group"]`).scrollIntoViewIfNeeded()
        await page.waitForTimeout(700)
        const svg = await page.locator(`#${id} svg[role="group"]`).boundingBox()
        expect(svg!.x).toBeGreaterThanOrEqual(0)
        expect(svg!.x + svg!.width).toBeLessThanOrEqual(vp.width + 1)
        const heights = await page.locator(`#${id} svg g[role="button"]`).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
        for (const h of heights) expect(h, id).toBeGreaterThanOrEqual(50)
      }
    })

    test('FAQ rows and the footer behave at this width', async ({ page }) => {
      await page.goto('/')
      await jumpToScene(page, 'faq')
      const rows = await page.locator('#faq button[aria-expanded]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
      for (const h of rows) expect(h).toBeGreaterThanOrEqual(64)
      await page.keyboard.press('End')
      await expect(page.getByRole('contentinfo')).toBeInViewport()
      await expectNoHorizontalOverflow(page)
    })

    test('interactive controls meet the 44px touch target below 1024px', async ({ page }) => {
      test.skip(vp.width >= 1024, 'touch targets checked for mobile and tablet')
      await page.goto('/')
      await visitAllScenes(page)
      const small = await page.evaluate(() => {
        const sel = 'header a, header button, main button, main [role="tab"], main a[class*="rounded-full"], main nav a, footer a, #contact a'
        return Array.from(document.querySelectorAll<HTMLElement>(sel))
          .filter((el) => {
            const r = el.getBoundingClientRect()
            return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && el.closest('[aria-hidden="true"]') === null && getComputedStyle(el).display !== 'inline'
          })
          .map((el) => ({ label: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40), h: Math.round(el.getBoundingClientRect().height), w: Math.round(el.getBoundingClientRect().width) }))
          .filter((x) => x.h < 44)
      })
      expect(small).toEqual([])
    })
  })
}
