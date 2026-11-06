import { test, type Page, type TestInfo } from '@playwright/test'
import { jumpToScene, openDrawer, visitAllScenes, waitForImages } from '../fixtures/test-data'

// Review screenshots attached to the Playwright report (and kept in test-results).
// They are captures for human inspection, not pixel-diff baselines.
async function shot(page: Page, name: string, testInfo: TestInfo, opts: { fullPage?: boolean } = {}) {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage: opts.fullPage ?? false, animations: 'disabled' })
  await testInfo.attach(name, { path, contentType: 'image/png' })
}

async function prepare(page: Page) {
  await page.goto('/')
  await visitAllScenes(page)
  await waitForImages(page)
  await page.waitForTimeout(500)
}

/**
 * Capture the moment between two scenes: start a smooth scroll to the next scene and shoot while it is
 * still travelling. Snapping settles on the scene, so a static scrollBy cannot show the in-between state.
 */
async function transition(page: Page, from: string, to: string, name: string, testInfo: TestInfo) {
  await jumpToScene(page, from)
  await page.evaluate((id) => document.getElementById(id)!.scrollIntoView({ behavior: 'smooth', block: 'start' }), to)
  await page.waitForTimeout(260)
  await shot(page, name, testInfo)
  await page.waitForTimeout(900)
}

test.describe('desktop captures', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('homepage, hero, work, GTI scenes, FAQ, CI/CD and contact modal', async ({ page }, testInfo) => {
    await prepare(page)
    await shot(page, 'desktop-homepage', testInfo, { fullPage: true })
    await jumpToScene(page, 'home')
    await page.waitForTimeout(1500)
    await shot(page, 'desktop-hero', testInfo)
    for (const [id, name] of [['work', 'desktop-projects'], ['gti-main', 'desktop-gti-main'], ['gti-north', 'desktop-gti-north'], ['expertise', 'desktop-skills'], ['architecture', 'desktop-architecture'], ['cicd', 'desktop-cicd'], ['recognition', 'desktop-recognition'], ['faq', 'desktop-faq']] as const) {
      await jumpToScene(page, id)
      await page.waitForTimeout(1300)
      await shot(page, name, testInfo)
    }
    await jumpToScene(page, 'faq')
    await page.getByRole('button', { name: 'Who is Ibrahem Sotejo?' }).click()
    await page.waitForTimeout(700)
    await shot(page, 'desktop-faq-open', testInfo)
    await jumpToScene(page, 'home')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await page.waitForTimeout(700)
    await shot(page, 'desktop-contact-modal', testInfo)
  })

  test('scene transitions', async ({ page }, testInfo) => {
    await prepare(page)
    await transition(page, 'home', 'about', 'transition-hero-to-about', testInfo)
    await transition(page, 'about', 'expertise', 'transition-about-to-expertise', testInfo)
    await transition(page, 'expertise', 'work', 'transition-expertise-to-projects', testInfo)
    await transition(page, 'gti-main', 'gti-north', 'transition-gti-main-to-north', testInfo)
    await transition(page, 'architecture', 'cicd', 'transition-architecture-to-cicd', testInfo)
    await transition(page, 'faq', 'contact', 'transition-faq-to-contact', testInfo)
  })
})

test.describe('mobile captures', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('homepage, navigation drawer, FAQ, contact modal and transitions', async ({ page }, testInfo) => {
    await prepare(page)
    await shot(page, 'mobile-homepage', testInfo, { fullPage: true })
    await jumpToScene(page, 'home')
    await page.waitForTimeout(800)
    await shot(page, 'mobile-hero', testInfo)
    await openDrawer(page)
    await shot(page, 'mobile-navigation', testInfo)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(600)
    await jumpToScene(page, 'work')
    await page.waitForTimeout(900)
    await shot(page, 'mobile-projects', testInfo)
    await jumpToScene(page, 'gti-north')
    await page.waitForTimeout(900)
    await shot(page, 'mobile-gti-north', testInfo)
    await jumpToScene(page, 'architecture')
    await page.waitForTimeout(900)
    await shot(page, 'mobile-architecture', testInfo)
    await jumpToScene(page, 'faq')
    await page.getByRole('button', { name: 'What technologies does Ibrahem work with?' }).click()
    await page.waitForTimeout(800)
    await shot(page, 'mobile-faq', testInfo)
    await transition(page, 'about', 'expertise', 'mobile-transition-about-to-expertise', testInfo)
    await transition(page, 'faq', 'contact', 'mobile-transition-faq-to-contact', testInfo)
    await jumpToScene(page, 'home')
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await page.waitForTimeout(800)
    await shot(page, 'mobile-contact-modal', testInfo)
  })
})

test.describe('tablet and reduced-motion captures', () => {
  test('tablet homepage', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 820, height: 1180 })
    await prepare(page)
    await shot(page, 'tablet-homepage', testInfo, { fullPage: true })
  })

  test('reduced motion', async ({ browser }, testInfo) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await prepare(page)
    await shot(page, 'reduced-motion-hero', testInfo)
    await transition(page, 'about', 'expertise', 'reduced-motion-transition', testInfo)
    await ctx.close()
  })
})
