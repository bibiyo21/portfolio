import { expect, test } from '@playwright/test'

test.describe('CI/CD showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('#cicd').scrollIntoViewIfNeeded()
  })

  test('shows the required title and supporting description', async ({ page }) => {
    const section = page.locator('#cicd')
    await expect(section.getByRole('heading', { name: 'From Code Commit to Production Deployment' })).toBeVisible()
    await expect(section).toContainText('I design and improve CI/CD pipelines that automate testing')
  })

  test('renders the pipeline as SVG, not an image', async ({ page }) => {
    const svg = page.locator('#cicd svg[role="group"]')
    await expect(svg).toBeVisible()
    await expect(page.locator('#cicd img')).toHaveCount(0)
    await expect(svg.getByRole('button', { name: /^Stage \d+ of \d+/ })).toHaveCount(6)
  })

  test('platform tabs switch between GitHub Actions and GitLab CI/CD', async ({ page }) => {
    const tabs = page.getByRole('tablist', { name: 'CI/CD platform' })
    await expect(tabs.getByRole('tab', { name: 'GitHub Actions' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('region', { name: 'GitHub Actions workflow file' })).toContainText('Production Deployment')
    await tabs.getByRole('tab', { name: 'GitLab CI/CD' }).click()
    await expect(tabs.getByRole('tab', { name: 'GitLab CI/CD' })).toHaveAttribute('aria-selected', 'true')
    const gitlab = page.getByRole('region', { name: 'GitLab CI/CD workflow file' })
    await expect(gitlab).toContainText('stages:')
    for (const stage of ['validate', 'build', 'unit-test', 'e2e-test', 'deploy']) {
      await expect(gitlab).toContainText(stage)
    }
  })

  test('clicking a stage shows its details', async ({ page }) => {
    const detail = page.getByTestId('stage-detail')
    await page.getByRole('button', { name: /Stage 2 of 6: Build & Validation/ }).click()
    await expect(detail).toContainText('Build & Validation')
    await expect(detail).toContainText('npm run content:validate')
    await expect(detail).toContainText('Expected output')
    await page.getByRole('button', { name: /Stage 4 of 6: End-to-End Testing/ }).click()
    await expect(detail).toContainText('Playwright')
    await expect(page.getByRole('button', { name: /Stage 4 of 6/ })).toHaveAttribute('aria-pressed', 'true')
  })

  test('pipeline is keyboard operable', async ({ page }) => {
    const node = page.getByRole('button', { name: /Stage 3 of 6/ })
    await node.focus()
    await page.keyboard.press('Enter')
    await expect(node).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('stage-detail')).toContainText('Unit Testing')
  })

  test('has an accessible text explanation of the stages, jobs and quality gates', async ({ page }) => {
    const section = page.locator('#cicd')
    await expect(section.getByRole('heading', { name: 'Stages' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Jobs' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Quality gates' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Deployment strategy' })).toBeVisible()
  })

  test('does not show repository links while repositoryUrl is unset', async ({ page }) => {
    await expect(page.locator('#cicd').getByRole('link', { name: /View on GitHub/ })).toHaveCount(0)
    await expect(page.locator('#cicd')).toContainText('repositoryUrl')
  })

  test('workflow YAML is syntax highlighted', async ({ page }) => {
    const code = page.getByRole('region', { name: 'GitHub Actions workflow file' })
    await expect(code.locator('span.text-peach').first()).toBeVisible()
    await expect(code.locator('span.italic').first()).toBeVisible()
  })
})

test.describe('CI/CD diagram layout', () => {
  test('is a horizontal flow on wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.locator('#cicd').scrollIntoViewIfNeeded()
    const boxes = await page.locator('#cicd svg[role="group"] g[role="button"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
    expect(boxes).toHaveLength(6)
    const tops = new Set(boxes.map((b) => Math.round(b.top)))
    expect(tops.size, 'all nodes share one row').toBe(1)
  })

  test('becomes a vertical flow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.locator('#cicd').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    const boxes = await page.locator('#cicd svg[role="group"] g[role="button"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
    expect(boxes).toHaveLength(6)
    const lefts = new Set(boxes.map((b) => Math.round(b.left)))
    expect(lefts.size, 'all nodes share one column').toBe(1)
    for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.top).toBeGreaterThan(boxes[i - 1]!.bottom - 1)
    for (const b of boxes) expect(b.right).toBeLessThanOrEqual(390)
  })
})
