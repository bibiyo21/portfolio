import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene } from '../fixtures/test-data'

test.describe('expertise', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'expertise')
  })

  test('shows eight capability pillars with grounded technologies', async ({ page }) => {
    await expect(page.getByTestId('capability-card')).toHaveCount(8)
    await expect(page.locator('#expertise')).toContainText('Solution Architecture')
    await expect(page.locator('#expertise')).toContainText('AI and Generative AI Exploration')
  })

  test('skill categories are tabs, with the résumé categories in order', async ({ page }) => {
    const tabs = page.getByRole('tablist', { name: 'Skill categories' }).getByRole('tab')
    await expect(tabs).toHaveText(['Frontend engineering', 'Backend and application development', 'Data and caching', 'Infrastructure and delivery', 'CMS and commerce', 'Testing, observability, and performance', 'AI and emerging technology', 'Exploring'])
  })

  test('switching tabs shows that category and how it relates to delivery', async ({ page }) => {
    await page.getByRole('tab', { name: 'Infrastructure and delivery' }).click()
    const panel = page.locator('#expertise').getByRole('tabpanel')
    for (const s of ['Docker', 'AWS', 'GitLab', 'CI/CD']) await expect(panel).toContainText(s)
    await expect(panel).toContainText('Why it matters')
  })

  test('tabs support arrow-key navigation', async ({ page }) => {
    const first = page.getByRole('tab', { name: 'Frontend engineering' })
    await first.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Backend and application development' })).toBeFocused()
  })

  test('exploration is clearly separated from confirmed skills', async ({ page }) => {
    await page.getByRole('tab', { name: 'Exploring' }).click()
    const panel = page.locator('#expertise').getByRole('tabpanel')
    await expect(panel).toContainText('Current interests, not delivery experience')
    for (const s of ['AI integration', 'Model Context Protocol (MCP)', 'Workflow automation']) await expect(panel).toContainText(s)
    await page.getByRole('tab', { name: 'AI and emerging technology' }).click()
    await expect(page.locator('#expertise').getByRole('tabpanel')).not.toContainText('Model Context Protocol')
  })

  test('there are no proficiency meters, percentages, stars or expert labels', async ({ page }) => {
    const text = await page.locator('#expertise').innerText()
    expect(text).not.toMatch(/\d+\s?%|★|\bexpert\b|proficien/i)
    await expect(page.locator('#expertise [role="progressbar"], #expertise progress, #expertise meter')).toHaveCount(0)
  })
})
