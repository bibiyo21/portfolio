import { expect, test } from '../fixtures/recaptcha'
import { activeLabel, activeTab, expectNoHorizontalOverflow, jumpToScene, openDrawer, sceneTop } from '../fixtures/test-data'

const FACEBOOK = 'https://www.facebook.com/koradesignsolutions'

test.describe('Affiliations scene', () => {
  test('the Affiliations tab reaches the scene, which shows the Kora card, logo and Facebook link', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Affiliations' }).click()
    await expect(activeTab(page)).toHaveText('Affiliations')
    await expect.poll(() => sceneTop(page, 'affiliations'), { timeout: 6000 }).toBeLessThanOrEqual(2)
    await expect(page).toHaveURL(/#affiliations$/)

    const scene = page.locator('#affiliations')
    await expect(scene.getByRole('heading', { level: 2, name: 'Affiliations' })).toBeVisible()
    const card = scene.getByRole('article', { name: 'Kora Design Solutions' })
    await expect(card.getByRole('heading', { level: 3, name: 'Kora Design Solutions' })).toBeVisible()
    for (const s of ['Graphic design', 'Web solutions', 'Creative service retainers']) await expect(card.getByText(s, { exact: true })).toBeVisible()

    const logo = card.getByRole('img', { name: /Kora Design Solutions logo/ })
    await expect(logo).toBeVisible()
    await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(718)
    expect(await logo.getAttribute('data-fallback')).toBeNull()

    const link = card.getByRole('link', { name: /Visit Kora Design Solutions on Facebook/ })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', FACEBOOK)
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    // Desktop: logo panel beside the details.
    const logoBox = (await logo.boundingBox())!
    const headingBox = (await card.getByRole('heading', { level: 3 }).boundingBox())!
    expect(logoBox.x + logoBox.width).toBeLessThan(headingBox.x)
    await expectNoHorizontalOverflow(page)
  })

  for (const vp of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`mobile ${vp.width}px: the drawer reaches the scene and the card stacks without overflow`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto('/')
      const drawer = await openDrawer(page)
      await drawer.getByRole('link', { name: /Affiliations/ }).click()
      await expect(activeLabel(page)).toContainText('Affiliations')
      await expect.poll(() => sceneTop(page, 'affiliations'), { timeout: 6000 }).toBeLessThanOrEqual(2)

      const card = page.locator('#affiliations').getByRole('article', { name: 'Kora Design Solutions' })
      const logo = card.getByRole('img', { name: /Kora Design Solutions logo/ })
      await logo.scrollIntoViewIfNeeded()
      await expect(logo).toBeVisible()
      // Mobile: logo above the details.
      const logoBox = (await logo.boundingBox())!
      const headingBox = (await card.getByRole('heading', { level: 3 }).boundingBox())!
      expect(logoBox.y + logoBox.height).toBeLessThan(headingBox.y)
      const link = card.getByRole('link', { name: /Visit Kora Design Solutions on Facebook/ })
      await link.scrollIntoViewIfNeeded()
      await expect(link).toBeVisible()
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      await expectNoHorizontalOverflow(page)
    })
  }

  test('sits between Recognition and FAQ in the page flow', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'affiliations')
    const order = await page.evaluate(() => [...document.querySelectorAll('main > section[data-scene]')].map((s) => s.id))
    expect(order.indexOf('affiliations')).toBe(order.indexOf('recognition') + 1)
    expect(order.indexOf('faq')).toBe(order.indexOf('affiliations') + 1)
  })
})
