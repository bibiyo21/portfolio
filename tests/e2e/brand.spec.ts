import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene, openDrawer, trackErrors } from '../fixtures/test-data'

const pngSize = (buf: Buffer) => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) })

test.describe('logo', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the header shows the horizontal IS logo and swaps variant with the scene tone', async ({ page }) => {
    await page.goto('/')
    const logo = page.getByRole('banner').locator('img[src*="logo-horizontal"]')
    await expect(logo).toBeVisible()
    await jumpToScene(page, 'about')
    await expect(logo).toHaveAttribute('src', /logo-horizontal-light\.svg/)
    await jumpToScene(page, 'architecture')
    await expect(logo).toHaveAttribute('src', /logo-horizontal-dark\.svg/)
    await expect(page.getByRole('link', { name: /Ibrahem Sotejo, back to the start/ })).toBeVisible()
  })

  test('the logo is legible: its name text renders at least 14px tall', async ({ page }) => {
    await page.goto('/')
    const box = await page.getByRole('banner').locator('img[src*="logo-horizontal"]').boundingBox()
    // The name is 22/64 of the artwork height, so a 46px logo gives ~15.8px type.
    expect(box!.height).toBeGreaterThanOrEqual(40)
    expect((box!.height * 22) / 64).toBeGreaterThanOrEqual(14)
  })

  test('the hero names the owner once (no second logo) and the footer carries the full logo', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('hero-name')).toHaveText(/Ibrahem Sotejo/)
    await expect(page.locator('#home img[src*="logo-symbol"]')).toHaveCount(0)
    await page.keyboard.press('End')
    await expect(page.getByRole('contentinfo').getByRole('img', { name: 'Ibrahem Sotejo, Solutions Architect' })).toBeVisible()
  })

  test('the brand assets are served and keep the palette', async ({ page }) => {
    const get = async (p: string) => {
      const r = await page.request.get(p)
      expect(r.status(), p).toBe(200)
      return r
    }
    for (const v of ['light', 'dark']) {
      for (const k of ['horizontal', 'symbol']) {
        const r = await get(`/images/brand/logo-${k}-${v}.svg`)
        expect(r.headers()['content-type']).toContain('svg')
        const svg = await r.text()
        expect(svg).toContain(v === 'light' ? '#581C35' : '#F5C6AD')
        expect(svg).not.toMatch(/<text/) // outlined, so it does not depend on installed fonts
      }
    }
  })
})

test.describe('logo on small screens', () => {
  test.use({ viewport: { width: 360, height: 800 } })

  test('mobile shows the compact mark, never the wide logo, and nothing overflows', async ({ page }) => {
    await page.goto('/')
    const header = page.getByRole('banner')
    await expect(header.locator('img[src*="logo-symbol"]')).toBeVisible()
    await expect(header.locator('img[src*="logo-horizontal"]')).toBeHidden()
    const mark = await header.locator('img[src*="logo-symbol"]').boundingBox()
    expect(mark!.width).toBeGreaterThanOrEqual(36)
    const burger = await page.getByRole('button', { name: 'Open navigation menu' }).boundingBox()
    expect(mark!.x + mark!.width).toBeLessThan(burger!.x)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })

  test('the drawer shows the dark logo', async ({ page }) => {
    await page.goto('/')
    const drawer = await openDrawer(page)
    await expect(drawer.locator('img[src*="logo-horizontal-dark"]')).toBeVisible()
    const box = await drawer.boundingBox()
    const logo = await drawer.locator('img[src*="logo-horizontal-dark"]').boundingBox()
    expect(logo!.x + logo!.width).toBeLessThan(box!.x + box!.width - 44)
  })
})

test.describe('favicon and social assets', () => {
  test('the head links every favicon size and an absolute social image, and no fake PWA manifest', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/favicon.svg')
    await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute('href', '/favicon-32x32.png')
    await expect(page.locator('link[rel="icon"][sizes="16x16"]')).toHaveAttribute('href', '/favicon-16x16.png')
    await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveCount(1)
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png')
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(0)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/.+\/images\/illustrations\/og-image\.png$/)
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^https:\/\/.+og-image\.png$/)
  })

  test('every favicon file exists with the right dimensions and is not the old placeholder', async ({ page }) => {
    const bytes = async (p: string) => {
      const r = await page.request.get(p)
      expect(r.status(), p).toBe(200)
      return r.body()
    }
    expect(pngSize(await bytes('/favicon-16x16.png'))).toEqual({ w: 16, h: 16 })
    expect(pngSize(await bytes('/favicon-32x32.png'))).toEqual({ w: 32, h: 32 })
    expect(pngSize(await bytes('/apple-touch-icon.png'))).toEqual({ w: 180, h: 180 })
    expect(pngSize(await bytes('/icon-192.png'))).toEqual({ w: 192, h: 192 })
    expect(pngSize(await bytes('/icon-512.png'))).toEqual({ w: 512, h: 512 })
    expect(pngSize(await bytes('/images/illustrations/og-image.png'))).toEqual({ w: 1200, h: 630 })
    const ico = await bytes('/favicon.ico')
    expect(ico.readUInt16LE(2)).toBe(1) // ICO type
    expect(ico.readUInt16LE(4)).toBe(3) // 16, 32 and 48 px images
  })

  test('the SVG favicon is the IS mark and adapts to dark browser themes', async ({ page }) => {
    const svg = await (await page.request.get('/favicon.svg')).text()
    expect(svg).toContain('prefers-color-scheme:dark')
    expect(svg).toContain('#581C35')
    expect(svg).toContain('#F5C6AD')
    expect(svg).not.toMatch(/<text/)
  })
})

test.describe('typography system', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('headings use Space Grotesk, body uses Inter, labels use JetBrains Mono', async ({ page }) => {
    await page.goto('/')
    const fam = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).fontFamily)
    expect(await fam('h1')).toMatch(/^"?Space Grotesk"?/)
    expect(await fam('#home .t-lede')).toMatch(/Inter/)
    expect(await fam('#home .t-eyebrow, #home p.uppercase')).toMatch(/JetBrains Mono|Inter/)
    await jumpToScene(page, 'about')
    expect(await fam('#about h2')).toMatch(/^"?Space Grotesk"?/)
    expect(await fam('#about .t-eyebrow')).toMatch(/JetBrains Mono/)
    expect(await fam('#about .t-body-l')).toMatch(/Inter/)
    expect(await fam('nav[aria-label="Primary"] a')).toMatch(/^"?Space Grotesk"?/)
    await jumpToScene(page, 'cicd')
    expect(await fam('#cicd code')).toMatch(/JetBrains Mono/)
  })

  test('the web fonts actually load, and the old serif is gone', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'cicd')
    await page.evaluate(() => document.fonts.ready)
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight}`))
    expect(loaded.some((f) => f.startsWith('Space Grotesk 600'))).toBe(true)
    expect(loaded.some((f) => f.startsWith('Space Grotesk 500'))).toBe(true)
    expect(loaded.some((f) => f.startsWith('Inter'))).toBe(true)
    expect(loaded.some((f) => f.startsWith('JetBrains Mono'))).toBe(true)
    expect(loaded.join()).not.toMatch(/Fraunces/)
    const all = await page.evaluate(() => [...document.fonts].map((f) => f.family))
    expect(all.join()).not.toMatch(/Fraunces/)
  })

  test('only the planned weights are shipped', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (r) => /\.woff2?($|\?)/.test(r.url()) && requests.push(r.url()))
    await page.goto('/')
    for (const id of ['about', 'cicd', 'faq']) await jumpToScene(page, id)
    await page.waitForTimeout(500)
    const names = requests.map((u) => u.split('/').pop()!.replace(/-[A-Za-z0-9_]{6,}\./, '.'))
    expect(requests.join()).not.toMatch(/fraunces/i)
    expect(requests.join()).not.toMatch(/space-grotesk-latin-(300|400)/)
    expect(requests.join()).not.toMatch(/space-grotesk-.*(cyrillic|vietnamese|latin-ext)/)
    expect(names.length).toBeLessThanOrEqual(6)
  })

  test('there are no italic styles left on the page', async ({ page }) => {
    await page.goto('/')
    for (const id of ['home', 'about', 'gti-main', 'architecture', 'cicd', 'faq']) await jumpToScene(page, id)
    const italics = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('main *')).filter((e) => getComputedStyle(e).fontStyle === 'italic').map((e) => e.tagName + ':' + (e.textContent ?? '').slice(0, 20)))
    expect(italics).toEqual([])
  })

  test('headings carry the planned weights: hero 600, section 600, card 500', async ({ page }) => {
    await page.goto('/')
    const w = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).fontWeight)
    expect(await w('h1')).toBe('600')
    expect(await w('#about h2')).toBe('600')
    expect(await w('#about h3')).toBe('500')
  })

  test('loading the page causes almost no layout shift', async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/')
    await page.waitForTimeout(2500)
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls, `CLS ${cls}`).toBeLessThan(0.05)
  })

  test('the new system keeps the page free of console errors', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    for (const id of ['about', 'architecture', 'faq', 'contact']) await jumpToScene(page, id)
    expect(errors).toEqual([])
  })
})
