import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene } from '../fixtures/test-data'

test.describe('case-study pages', () => {
  test('each legacy project card links to its own case-study page', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'work')
    const section = page.getByTestId('application-projects')
    await section.scrollIntoViewIfNeeded()
    await section.getByRole('link', { name: /Read the case study for Samsung S Connect Integration/ }).click()
    await expect(page).toHaveURL(/\/case-studies\/sconnect-integration$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Samsung S Connect Integration, reviewed')
    await expect(page).toHaveTitle(/Samsung S Connect Integration/)
    for (const h of ['How it is built', 'The interfaces it exposes and calls', 'What holds up', 'What I would fix', 'How I would modernise it'])
      await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible()
    await expect(page.getByText('POST /api/request')).toBeVisible()
  })

  test('the index keeps GTI Main and North on the home page and links the legacy reviews', async ({ page }) => {
    await page.goto('/case-studies')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Recent platform work')
    const hrefs = await page.locator('main a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
    expect(hrefs).toEqual(expect.arrayContaining(['/#gti-main', '/#gti-north', '/case-studies/nutridense-inventory', '/case-studies/sconnect-integration']))
  })

  test('the Nutridense page fits a phone and has no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/case-studies/nutridense-inventory')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nutridense Inventory System, reviewed')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
})
