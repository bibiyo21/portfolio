import { expect, type Page } from '@playwright/test'

export const desktopViewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
]
export const tabletViewports = [
  { name: 'iPad Mini 768x1024', width: 768, height: 1024 },
  { name: 'iPad 820x1180', width: 820, height: 1180 },
  { name: 'Tablet landscape 1024x768', width: 1024, height: 768 },
]
export const mobileViewports = [
  { name: 'Android 360x800', width: 360, height: 800 },
  { name: 'iPhone SE 375x667', width: 375, height: 667 },
  { name: 'iPhone 14 390x844', width: 390, height: 844 },
  { name: 'iPhone Pro Max 430x932', width: 430, height: 932 },
]

/** Header switches from burger to tabs at this width (see DESIGN.md section 5). */
export const TAB_BREAKPOINT = 1080

export const sceneIds = [
  'home',
  'about',
  'expertise',
  'work',
  'gti-main',
  'gti-north',
  'experience',
  'architecture',
  'cicd',
  'recognition',
  'affiliations',
  'faq',
  'contact',
] as const

export const sceneLabels: Record<(typeof sceneIds)[number], string> = {
  home: 'Home',
  about: 'About',
  expertise: 'Expertise',
  work: 'Work',
  'gti-main': 'GTI Main',
  'gti-north': 'GTI North',
  experience: 'Experience',
  architecture: 'Architecture',
  cicd: 'CI/CD',
  recognition: 'Recognition',
  affiliations: 'Affiliations',
  faq: 'FAQ',
  contact: 'Contact',
}

export const tabLabels = ['Home', 'About', 'Expertise', 'Work', 'Experience', 'Architecture', 'CI/CD', 'Recognition', 'Affiliations', 'FAQ', 'Contact']

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
  const o = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
    body: document.body.scrollWidth,
  }))
  expect(o.scroll, `scrollWidth ${o.scroll} > clientWidth ${o.client}`).toBeLessThanOrEqual(o.client)
  expect(o.body).toBeLessThanOrEqual(o.client)
}

/** Jump straight to a scene without animation. */
export async function jumpToScene(page: Page, id: string) {
  await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ behavior: 'instant', block: 'start' }), id)
  await page.waitForTimeout(250)
}

/** Distance of a scene's top edge from the viewport top. */
export const sceneTop = (page: Page, id: string) =>
  page.evaluate((i) => Math.round(document.getElementById(i)!.getBoundingClientRect().top), id)

/** Walk every scene so lazy images load and reveals fire. */
export async function visitAllScenes(page: Page) {
  for (const id of sceneIds) await jumpToScene(page, id)
  await jumpToScene(page, 'home')
}

/** Force lazy images to load, then wait until every image has decoded. */
export async function waitForImages(page: Page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.images)
    imgs.forEach((img) => (img.loading = 'eager'))
    await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)))
  })
}

export const activeTab = (page: Page) =>
  page.locator('nav[aria-label="Primary"] a[aria-current="location"]')

export const activeLabel = (page: Page) => page.getByTestId('active-label')

export async function openDrawer(page: Page) {
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const drawer = page.getByRole('dialog')
  await drawer.waitFor()
  await page.waitForTimeout(600)
  return drawer
}
