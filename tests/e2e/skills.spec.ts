import { expect, test } from '@playwright/test'
import { skillCategoryCount } from '../fixtures/test-data'

test.describe('expertise', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('#expertise').scrollIntoViewIfNeeded()
  })

  test('renders every skill category', async ({ page }) => {
    await expect(page.getByTestId('skill-card')).toHaveCount(skillCategoryCount)
    for (const title of [
      'Software Development',
      'System and Solutions Architecture',
      'Database Engineering',
      'Cloud Infrastructure and DevOps',
      'AI Engineering and Integration',
      'Model Context Protocol (MCP) Integration',
      'E-commerce Development',
      'Payment Gateway Integration',
      'Business Website Development',
      'Business Solutions and Digital Platforms',
      'CI/CD and DevOps Engineering',
    ]) {
      await expect(page.locator('#expertise').getByRole('heading', { name: title })).toBeVisible()
    }
  })

  test('cards expand to reveal remaining skills and collapse again', async ({ page }) => {
    const card = page.getByTestId('skill-card').first()
    const toggle = card.getByRole('button', { name: /Show \d+ more/ })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(card.getByText('Frontend Development')).toBeHidden()
    await toggle.click()
    await expect(card.getByText('Frontend Development')).toBeVisible()
    await card.getByRole('button', { name: 'Show fewer' }).click()
    await expect(card.getByText('Frontend Development')).toBeHidden()
  })

  test('does not show proficiency percentages', async ({ page }) => {
    await expect(page.locator('#expertise')).not.toContainText(/\d+\s?%/)
  })
})
