import { expect, test } from '@playwright/test'
import {
  desktopViewports,
  expectNoHorizontalOverflow,
  mobileViewports,
  openContactFromNav,
  scrollThrough,
  waitForImages,
  tabletViewports,
  trackErrors,
} from '../fixtures/test-data'

const all = [
  ...desktopViewports.map((v) => ({ ...v, kind: 'desktop' as const })),
  ...tabletViewports.map((v) => ({ ...v, kind: 'tablet' as const })),
  ...mobileViewports.map((v) => ({ ...v, kind: 'mobile' as const })),
]

for (const vp of all) {
  test.describe(`${vp.kind}: ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('no horizontal overflow, no console errors, images load', async ({ page }) => {
      const errors = trackErrors(page)
      await page.goto('/')
      await scrollThrough(page)
      await waitForImages(page)
      await expectNoHorizontalOverflow(page)
      const broken = await page.evaluate(() =>
        Array.from(document.images)
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.src),
      )
      expect(broken).toEqual([])
      expect(errors, errors.join('\n')).toEqual([])
    })

    test('navigation collapses correctly for the width', async ({ page }) => {
      await page.goto('/')
      const inline = page.getByRole('navigation', { name: 'Primary' })
      const menuButton = page.getByRole('button', { name: 'Open menu' })
      if (vp.width < 768) {
        await expect(inline).toBeHidden()
        await expect(menuButton).toBeVisible()
      } else {
        await expect(inline).toBeVisible()
        await expect(menuButton).toBeHidden()
      }
    })

    test('hero headline and primary CTA are visible without scrolling', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 0.5 })
      const cta = page.getByRole('link', { name: 'Explore My Work' })
      await cta.scrollIntoViewIfNeeded()
      await expect(cta).toBeVisible()
    })

    test('contact modal fits the viewport and is operable', async ({ page }) => {
      await page.goto('/')
      await openContactFromNav(page)
      const dialog = page.getByRole('dialog', { name: "Let's Start a Conversation" })
      await expect(dialog).toBeVisible()
      await page.waitForTimeout(600)
      const box = await dialog.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1)
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 1)
      await dialog.getByLabel('Message').scrollIntoViewIfNeeded()
      await expect(dialog.getByRole('button', { name: 'Submit Inquiry' })).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
    })

    test('CI/CD diagram fits the viewport and stays readable', async ({ page }) => {
      await page.goto('/')
      await page.locator('#cicd').scrollIntoViewIfNeeded()
      await page.waitForTimeout(700)
      const svg = await page.locator('#cicd svg[role="group"]').boundingBox()
      expect(svg).not.toBeNull()
      expect(svg!.x).toBeGreaterThanOrEqual(0)
      expect(svg!.x + svg!.width).toBeLessThanOrEqual(vp.width + 1)
      const nodes = await page.locator('#cicd svg[role="group"] g[role="button"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
      // 17px SVG text must not scale below ~11px on screen.
      for (const h of nodes) expect(h).toBeGreaterThanOrEqual(vp.width < 1024 ? 50 : 55)
    })

    test('project cards stay inside the viewport', async ({ page }) => {
      await page.goto('/')
      await page.locator('#projects').scrollIntoViewIfNeeded()
      await page.waitForTimeout(700)
      const boxes = await page.getByTestId('project-card').evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect()
          return { left: r.left, right: r.right }
        }),
      )
      expect(boxes.length).toBeGreaterThan(0)
      for (const b of boxes) {
        expect(b.left).toBeGreaterThanOrEqual(0)
        expect(b.right).toBeLessThanOrEqual(vp.width + 1)
      }
      if (vp.width < 768) {
        const lefts = new Set(boxes.map((b) => Math.round(b.left)))
        expect(lefts.size, 'single column on mobile').toBe(1)
      }
    })

    test('interactive controls meet the 44px touch target on touch-sized screens', async ({ page }) => {
      test.skip(vp.width >= 1024, 'touch targets checked for mobile and tablet')
      await page.goto('/')
      const small = await page.evaluate(() => {
        const sel = 'header a, header button, main button, main a[class*="rounded-full"], footer a'
        return Array.from(document.querySelectorAll<HTMLElement>(sel))
          .filter((el) => {
            const r = el.getBoundingClientRect()
            const s = getComputedStyle(el)
            return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && el.closest('[aria-hidden="true"]') === null
          })
          .map((el) => ({ label: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40), h: Math.round(el.getBoundingClientRect().height), w: Math.round(el.getBoundingClientRect().width), inline: getComputedStyle(el).display === 'inline' }))
          .filter((x) => !x.inline && x.h < 44)
      })
      expect(small).toEqual([])
    })
  })
}
