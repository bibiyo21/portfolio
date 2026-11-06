import { expect, type Page } from '@playwright/test'

export const desktopViewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
]

export const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 13/14', width: 390, height: 844 },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
  { name: 'Android small', width: 360, height: 800 },
  { name: 'Android standard', width: 393, height: 873 },
]

export const tabletViewports = [
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad', width: 820, height: 1180 },
  { name: 'Tablet landscape', width: 1024, height: 768 },
]

export const sectionIds = [
  'home',
  'about',
  'experience',
  'affiliations',
  'projects',
  'expertise',
  'philosophy',
  'contact',
] as const

export const skillCategoryCount = 11
export const projectCount = 4

export const validForm = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  subject: 'Project enquiry',
  message: 'This is a test message with enough characters.',
}

/** Collect console errors and uncaught exceptions for the lifetime of a page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(overflow.scroll, `scrollWidth ${overflow.scroll} > clientWidth ${overflow.client}`).toBeLessThanOrEqual(
    overflow.client,
  )
}

/** Scroll through the whole page so lazy images and whileInView reveals run. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.7))
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 80))
    }
    window.scrollTo(0, 0)
  })
}

export async function openContactFromNav(page: Page) {
  const viewport = page.viewportSize()
  if (viewport && viewport.width < 768) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('dialog', { name: 'Site navigation' }).getByRole('button', { name: /^Let.s Connect$/ }).click()
  } else {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Contact' }).click()
  }
}

/** Force lazy images to load, then wait until every image has decoded. */
export async function waitForImages(page: Page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.images)
    imgs.forEach((img) => (img.loading = 'eager'))
    await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)))
  })
}
