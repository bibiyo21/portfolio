// Captures real screenshots of the two live GTI sites with Playwright. Read-only: it only loads public pages,
// scrolls, and opens the mobile menu. It never submits forms or changes anything on either site.
import { chromium, type Browser, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join('docs', 'gti-site-previews')
const sites = [
  { key: 'main', name: 'GTI Main', url: 'https://goalietraininginstitute.ca/' },
  { key: 'north', name: 'GTI North', url: 'https://north.goalietraininginstitute.ca/' },
] as const
const views = [
  { key: 'desktop', width: 1440, height: 900, mobile: false },
  { key: 'mobile', width: 390, height: 844, mobile: true },
] as const

interface SiteResult {
  key: string
  name: string
  url: string
  finalUrl?: string
  title?: string
  status?: number
  embedHeaders?: { xFrameOptions: string | null; contentSecurityPolicy: string | null; iframeBlocked: boolean }
  files: string[]
  notes: string[]
  error?: string
}

/** Scroll the whole page so lazy images load, then return to the top. */
async function warm(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8))
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 150))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(800)
}

/**
 * Both sites show a timed newsletter popup (Divi Bloom) after some scrolling. It is part of how the live site
 * looks, so it is captured once as its own screenshot, then closed with the popup's own close button so it does
 * not cover the full-page and menu captures. Only the popup is dismissed; no form is touched or submitted.
 */
async function dismissNewsletterPopup(page: Page, dir: string, prefix: string, result: SiteResult) {
  const popup = page.locator('.et_bloom_popup').first()
  if ((await popup.count()) === 0 || !(await popup.isVisible().catch(() => false))) return
  const shot = join(dir, `${prefix}-newsletter-popup.png`)
  await page.screenshot({ path: shot })
  result.files.push(shot)
  const close = page.locator('.et_bloom_popup .et_bloom_close_button, .et_bloom_popup [class*="close" i]').first()
  if ((await close.count()) > 0) {
    await close.click({ timeout: 3000 }).catch(() => undefined)
    await page.waitForTimeout(800)
  }
  const stillOpen = await popup.isVisible().catch(() => false)
  result.notes.push(`${prefix}: a timed newsletter popup appeared and was ${stillOpen ? 'NOT closed' : 'closed with its own close button'} before the full-page and menu captures.`)
}

async function openMobileMenu(page: Page, notes: string[]): Promise<boolean> {
  // Themes often draw the hamburger with CSS on an empty element, which Playwright reports as "not visible".
  // So: find the control by its usual class or attribute, and tap the centre of its box.
  const candidates = [
    '.mobile_menu_bar',
    'button[aria-label*="menu" i]',
    'button[aria-controls*="menu" i]',
    'button[class*="menu" i]',
    'button[class*="hamburger" i]',
    '[class*="menu-toggle" i]',
    '[class*="hamburger" i]',
    '[class*="burger" i]',
  ]
  for (const sel of candidates) {
    // A page can contain several matches (hidden copies have no size), so use the first one that is actually laid out.
    for (const loc of await page.locator(sel).all()) {
      const box = await loc.boundingBox()
      if (!box || box.width < 8 || box.height < 8) continue
      if (box.y + box.height < 0 || box.y > 200) continue
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(1000)
      notes.push(`Mobile menu opened by tapping ${sel}`)
      return true
    }
  }
  notes.push('No mobile menu control was found, so no expanded-menu screenshot was taken.')
  return false
}

async function captureSite(browser: Browser, site: (typeof sites)[number]): Promise<SiteResult> {
  const dir = join(OUT, site.key)
  mkdirSync(dir, { recursive: true })
  const result: SiteResult = { key: site.key, name: site.name, url: site.url, files: [], notes: [] }
  for (const view of views) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 1,
      isMobile: view.mobile,
      hasTouch: view.mobile,
      // No user-agent spoofing: the layout responds to viewport width, and a spoofed UA trips bot protection.
    })
    const page = await context.newPage()
    try {
      const response = await page.goto(site.url, { waitUntil: 'load', timeout: 45_000 })
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => result.notes.push(`${view.key}: network never fully idle; captured after load.`))
      await page.waitForTimeout(1500)
      if (view.key === 'desktop') {
        result.status = response?.status()
        result.finalUrl = page.url()
        result.title = await page.title()
        const h = response?.headers() ?? {}
        const xfo = h['x-frame-options'] ?? null
        const csp = h['content-security-policy'] ?? null
        const frameAncestors = csp?.match(/frame-ancestors[^;]*/i)?.[0] ?? ''
        result.embedHeaders = {
          xFrameOptions: xfo,
          contentSecurityPolicy: csp ? (frameAncestors || '(no frame-ancestors directive)') : null,
          iframeBlocked: Boolean(xfo && /deny|sameorigin/i.test(xfo)) || /frame-ancestors\s+('none'|'self')/i.test(frameAncestors),
        }
      }
      const gated = await page.getByText(/confirm you are human|verify you are human|are you a robot/i).first().isVisible().catch(() => false)
      if (gated) {
        result.notes.push(`${view.key}: the site showed a human-verification page, so no screenshots were saved for this view. The check was not bypassed.`)
        result.error = `${view.key} blocked by human verification`
        continue
      }
      const viewport = join(dir, `${view.key}-viewport.png`)
      await page.screenshot({ path: viewport })
      result.files.push(viewport)
      await warm(page)
      await dismissNewsletterPopup(page, dir, view.key, result)
      const full = join(dir, `${view.key}-full-page.png`)
      await page.screenshot({ path: full, fullPage: true })
      result.files.push(full)
      if (view.mobile) {
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(500)
        if (await openMobileMenu(page, result.notes)) {
          const nav = join(dir, 'mobile-navigation.png')
          await page.screenshot({ path: nav })
          result.files.push(nav)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.split('\n')[0] : String(err)
      result.notes.push(`${view.key}: ${msg}`)
      result.error = `${view.key} capture failed: ${msg}`
    } finally {
      await context.close()
    }
  }
  return result
}

const browser = await chromium.launch()
const results: SiteResult[] = []
for (const site of sites) results.push(await captureSite(browser, site))
await browser.close()

const report = { capturedAt: new Date().toISOString(), viewports: views, results }
writeFileSync(join(OUT, 'capture-report.json'), JSON.stringify(report, null, 2))
for (const r of results) {
  console.log(`\n${r.name} (${r.url})`)
  console.log(`  status: ${r.status ?? 'n/a'}  title: ${r.title ?? 'n/a'}`)
  console.log(`  files: ${r.files.length ? r.files.join(', ') : 'none'}`)
  if (r.embedHeaders) console.log(`  iframe blocked by headers: ${r.embedHeaders.iframeBlocked}`)
  for (const n of r.notes) console.log(`  note: ${n}`)
  if (r.error) console.log(`  ERROR: ${r.error}`)
}
