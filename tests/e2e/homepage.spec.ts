import { expect, test } from '../fixtures/recaptcha'
import { desktopViewports, expectNoHorizontalOverflow, sceneIds, trackErrors, visitAllScenes, waitForImages } from '../fixtures/test-data'

test.describe('homepage', () => {
  test('loads with the right title, headline and no console errors', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await expect(page).toHaveTitle(/Ibrahem Sotejo/)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toContainText('Architecting Systems.')
    await expect(h1).toContainText('Engineering Experiences.')
    await expect(h1).toContainText('Building Possibilities.')
    await expect(page.getByText('Solutions Architect · Full-Stack Developer · Technology Enthusiast')).toBeVisible()
    await expect(page.getByText('Philippines').first()).toBeVisible()
    await visitAllScenes(page)
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('renders all thirteen scenes in order, each a labelled section', async ({ page }) => {
    await page.goto('/')
    const info = await page.evaluate((ids) =>
      ids.map((id) => {
        const el = document.getElementById(id)
        return { id, tag: el?.tagName, data: el?.getAttribute('data-scene'), labelled: el?.getAttribute('aria-labelledby'), top: el?.getBoundingClientRect().top ?? -1 }
      }),
    [...sceneIds])
    for (const s of info) {
      expect(s.tag, s.id).toBe('SECTION')
      expect(s.data, s.id).toBe(s.id)
      expect(s.labelled, s.id).toBeTruthy()
    }
    const tops = info.map((i) => i.top)
    expect(tops).toEqual([...tops].sort((a, b) => a - b))
    for (const s of info) await expect(page.locator(`#${s.labelled}`), `${s.id} heading`).toBeAttached()
  })

  test('hero has both calls to action, and no availability claim', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Let.s Connect/ })).toBeVisible()
    await expect(page.getByTestId('availability')).toHaveCount(0)
  })

  test('shows no placeholders, no résumé full name, no residential address and no invented numbers', async ({ page }) => {
    await page.goto('/')
    const text = await page.evaluate(() => document.body.innerText)
    expect(text).not.toMatch(/\[PLACEHOLDER\]|to be added|lorem ipsum|TBC|coming soon/i)
    expect(text).not.toContain('Aradanas')
    expect(text).not.toMatch(/barangay|purok|street/i)
    expect(text).not.toMatch(/\b\d+\+? years\b/i)
    expect(text).not.toMatch(/\$\s?\d|\d+%|\d+ (users|clients|customers)/i)
  })

  test('all images load', async ({ page }) => {
    await page.goto('/')
    await visitAllScenes(page)
    await waitForImages(page)
    const broken = await page.evaluate(() =>
      Array.from(document.images).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
    )
    expect(broken).toEqual([])
  })

  test('has the SEO and social metadata', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Solutions Architect/)
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('link[rel="icon"]')).toHaveCount(4)
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
  })

  for (const vp of desktopViewports) {
    test(`desktop ${vp.name}: no horizontal overflow and the hero fits`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await visitAllScenes(page)
      await expectNoHorizontalOverflow(page)
      const h1 = await page.getByRole('heading', { level: 1 }).boundingBox()
      expect(h1!.y + h1!.height).toBeLessThan(vp.height)
      const cta = await page.getByRole('link', { name: 'Explore My Work' }).boundingBox()
      expect(cta!.y + cta!.height).toBeLessThanOrEqual(vp.height)
    })
  }
})
