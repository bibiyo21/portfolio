import { createHash } from 'node:crypto'
import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene } from '../fixtures/test-data'

test('a missing image falls back to the neutral placeholder instead of a broken icon', async ({ page }) => {
  await page.route('**/images/projects/gti-main-desktop-720.webp', (route) => route.abort())
  await page.goto('/')
  await jumpToScene(page, 'work')
  const img = page.locator('#work img[data-fallback]').first()
  await expect(img).toBeAttached()
  await expect(img).toHaveAttribute('src', '/images/illustrations/image-fallback.svg')
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0)
})

test('below-the-fold images are lazy and the hero art does not depend on photographs', async ({ page }) => {
  await page.goto('/')
  const modes = await page.evaluate(() => Array.from(document.images).map((i) => ({ src: i.src, loading: i.loading })))
  expect(modes.length).toBeGreaterThan(0)
  // Brand logos sit in the header, hero and footer, so they load eagerly. Everything else is lazy.
  for (const m of modes.filter((x) => !x.src.includes('/images/brand/'))) expect(m.loading, m.src).toBe('lazy')
  for (const m of modes.filter((x) => x.src.includes('/images/brand/'))) expect(m.loading, m.src).toBe('eager')
  // The hero carries only the brand mark, no photographs.
  const heroImages = await page.locator('#home img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src))
  for (const src of heroImages) expect(src).toContain('/images/brand/')
})

test.describe('personal photography', () => {
  // The site serves the owner's original files. Their natural size must equal the upload: nothing was resized.
  const originals = {
    'ibrahem-professional-portrait.jpg': [1365, 2048],
    'ibrahem-iron-man-exhibit.jpg': [1536, 2048],
    'ibrahem-interactive-art-exhibit.jpg': [2048, 2048],
    'ibrahem-spartan-race.jpg': [2048, 1152],
  } as const

  test('About shows the professional portrait with descriptive alt text, framed by CSS only', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'about')
    const img = page.getByTestId('about-portrait').locator('img')
    await expect(img).toHaveAttribute('alt', /^Ibrahem Sotejo in a professional portrait/)
    await img.scrollIntoViewIfNeeded()
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBe(1365)
    expect(await img.evaluate((i) => [getComputedStyle(i).objectFit, getComputedStyle(i).filter])).toEqual(['cover', 'none'])
    await expect(img).toHaveAttribute('width', '1365')
    await expect(img).toHaveAttribute('height', '2048')
  })

  test('"Beyond the build" shows three captioned photos at their original size', async ({ page }) => {
    await page.goto('/')
    const section = page.getByTestId('beyond-the-build')
    await section.scrollIntoViewIfNeeded()
    const imgs = section.locator('img')
    await expect(imgs).toHaveCount(3)
    for (const img of await imgs.all()) {
      await img.scrollIntoViewIfNeeded()
      const [src, w, h] = await img.evaluate(async (i: HTMLImageElement) => {
        await i.decode().catch(() => {})
        return [i.src.split('/').pop()!, i.naturalWidth, i.naturalHeight] as const
      })
      expect(originals[src as keyof typeof originals], src).toEqual([w, h])
      await expect(img).toHaveAttribute('alt', /.{20,}/)
    }
    await expect(section.locator('figcaption')).toHaveCount(3)
  })

  test('the photo files are served unchanged, byte for byte', async ({ page }) => {
    const sha = {
      'ibrahem-professional-portrait.jpg': '5f1dad547b2fe32508f7eb0f75fed17ce454cbc126cdac261ec74ce38c95204c',
      'ibrahem-iron-man-exhibit.jpg': 'a94df9f2b4b8242c63fd5bdff8e8af945b5358308f4abf13da1da86ad9065766',
      'ibrahem-interactive-art-exhibit.jpg': '9151683d38db0e1428ade56eaae2fea643463326d5f62a9401c7e084ef761d88',
      'ibrahem-spartan-race.jpg': 'd682515aeba182c0be470a8ed488051502a1b4bc99ce15aa7c8d70b3d29ad997',
    }
    for (const [file, hash] of Object.entries(sha)) {
      const r = await page.request.get(`/images/profile/${file}`)
      expect(r.headers()['content-type'], file).toContain('image/jpeg')
      expect(createHash('sha256').update(await r.body()).digest('hex'), file).toBe(hash)
    }
    // The unused originals are not deployed (the server falls back to the page, never an image).
    for (const unused of ['images/profile/ibrahem-wedding-portrait.jpg', 'images/portfolio-photo-originals/ibrahem-wedding-portrait.jpg'])
      expect((await page.request.get(`/${unused}`)).headers()['content-type'] ?? '', unused).not.toContain('image/')
  })

  test('the hero image stays the brand and system visual, so the hero text paints first', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#home img[src*="/images/profile/"]')).toHaveCount(0)
  })
})
