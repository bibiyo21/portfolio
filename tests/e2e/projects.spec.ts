import { expect, test } from '@playwright/test'
import { projectCount } from '../fixtures/test-data'

test.describe('projects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('#projects').scrollIntoViewIfNeeded()
  })

  test('shows all sample projects and filter chips', async ({ page }) => {
    await expect(page.getByTestId('project-card')).toHaveCount(projectCount)
    const filters = page.getByRole('group', { name: 'Filter projects by category' })
    await expect(filters.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('category filter narrows the gallery and All restores it', async ({ page }) => {
    const filters = page.getByRole('group', { name: 'Filter projects by category' })
    await filters.getByRole('button', { name: 'E-commerce' }).click()
    await expect(page.getByTestId('project-card')).toHaveCount(1)
    await expect(page.getByTestId('project-card').first()).toContainText('E-commerce')
    await filters.getByRole('button', { name: 'All' }).click()
    await expect(page.getByTestId('project-card')).toHaveCount(projectCount)
  })

  test('project opens a detail modal with case-study sections and closes with Escape', async ({ page }) => {
    await page.getByTestId('project-card').first().getByRole('button').click()
    const dialog = page.getByRole('dialog', { name: /Sample: E-commerce Platform/ })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Challenges')).toBeVisible()
    await expect(dialog.getByText('Solutions')).toBeVisible()
    await expect(dialog.getByText('Business impact')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('project cards are keyboard operable', async ({ page }) => {
    const card = page.getByTestId('project-card').first().getByRole('button')
    await card.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
