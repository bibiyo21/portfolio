import { test, type Page } from '@playwright/test'
import { scrollThrough, waitForImages } from '../fixtures/test-data'

// Captures review screenshots as Playwright attachments (they appear in the HTML report).
// These are visual captures for human inspection, not pixel-diff baselines.
async function shot(page: Page, name: string, testInfo: import('@playwright/test').TestInfo, opts: { fullPage?: boolean } = {}) {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage: opts.fullPage ?? false, animations: 'disabled' })
  await testInfo.attach(name, { path, contentType: 'image/png' })
}

async function prepare(page: Page) {
  await page.goto('/')
  await scrollThrough(page)
  await waitForImages(page)
  await page.waitForTimeout(500)
}

test.describe('desktop captures', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('homepage, hero, projects, skills, contact modal, CI/CD', async ({ page }, testInfo) => {
    await prepare(page)
    await shot(page, 'desktop-homepage', testInfo, { fullPage: true })
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot(page, 'desktop-hero', testInfo)
    await page.locator('#projects').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await page.locator('#projects').screenshot({ path: testInfo.outputPath('desktop-projects.png') })
    await testInfo.attach('desktop-projects', { path: testInfo.outputPath('desktop-projects.png'), contentType: 'image/png' })
    await page.locator('#expertise').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await page.locator('#expertise').screenshot({ path: testInfo.outputPath('desktop-skills.png') })
    await testInfo.attach('desktop-skills', { path: testInfo.outputPath('desktop-skills.png'), contentType: 'image/png' })
    await page.locator('#cicd').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    await page.locator('#cicd').screenshot({ path: testInfo.outputPath('desktop-cicd.png') })
    await testInfo.attach('desktop-cicd', { path: testInfo.outputPath('desktop-cicd.png'), contentType: 'image/png' })
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await page.waitForTimeout(700)
    await shot(page, 'desktop-contact-modal', testInfo)
  })
})

test.describe('mobile captures', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('homepage, navigation, projects, contact modal', async ({ page }, testInfo) => {
    await prepare(page)
    await shot(page, 'mobile-homepage', testInfo, { fullPage: true })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(1000)
    await shot(page, 'mobile-navigation', testInfo)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(800)
    await page.locator('#projects').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await page.locator('#projects').screenshot({ path: testInfo.outputPath('mobile-projects.png') })
    await testInfo.attach('mobile-projects', { path: testInfo.outputPath('mobile-projects.png'), contentType: 'image/png' })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByRole('button', { name: /Let.s Connect/ }).first().click()
    await page.waitForTimeout(800)
    await shot(page, 'mobile-contact-modal', testInfo)
  })
})

test.describe('tablet captures', () => {
  test.use({ viewport: { width: 820, height: 1180 } })

  test('homepage', async ({ page }, testInfo) => {
    await prepare(page)
    await shot(page, 'tablet-homepage', testInfo, { fullPage: true })
  })
})
