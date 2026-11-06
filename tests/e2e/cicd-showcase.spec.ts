import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene } from '../fixtures/test-data'

test.describe('CI/CD showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'cicd')
  })

  test('shows the required title and description', async ({ page }) => {
    const s = page.locator('#cicd')
    await expect(s.getByRole('heading', { level: 2, name: 'From Code Commit to Production Deployment' })).toBeVisible()
    await expect(s).toContainText('I value delivery practices that make software changes easier to validate, review, and release.')
  })

  test('the pipeline is an SVG with six clickable stages, not an image', async ({ page }) => {
    const svg = page.locator('#cicd svg[role="group"]')
    await expect(svg).toBeVisible()
    await expect(page.locator('#cicd img')).toHaveCount(0)
    await expect(svg.getByRole('button', { name: /^Stage \d+ of 6/ })).toHaveCount(6)
  })

  test('platform tabs switch between GitHub Actions and GitLab CI/CD', async ({ page }) => {
    const tabs = page.getByRole('tablist', { name: 'CI/CD platform' })
    await expect(tabs.getByRole('tab', { name: 'GitHub Actions' })).toHaveAttribute('aria-selected', 'true')
    await page.locator('#cicd').getByRole('button', { name: 'Workflow example' }).click()
    await expect(page.getByRole('region', { name: 'GitHub Actions workflow file' })).toContainText('production-deploy')
    await tabs.getByRole('tab', { name: 'GitLab CI/CD' }).click()
    await page.locator('#cicd').getByRole('button', { name: 'Workflow example' }).click()
    const gl = page.getByRole('region', { name: 'GitLab CI/CD workflow file' })
    await expect(gl).toContainText('stages:')
    for (const s of ['validate', 'build', 'unit-test', 'deploy']) await expect(gl).toContainText(s)
  })

  test('each stage shows description, tools, commands and expected output', async ({ page }) => {
    const detail = page.getByTestId('stage-detail')
    await page.getByRole('button', { name: /Stage 2 of 6: Install and Validate/ }).click()
    await expect(detail).toContainText('npm run content:validate')
    await expect(detail).toContainText('Expected output')
    await expect(detail).toContainText('Zod')
    await page.getByRole('button', { name: /Stage 4 of 6: Automated Tests/ }).click()
    await expect(detail).toContainText('Playwright')
    await expect(detail).toContainText('npm run test:e2e')
    await page.getByRole('button', { name: /Stage 6 of 6: Deployment/ }).click()
    await expect(detail).toContainText('Vercel CLI')
    await expect(page.getByRole('button', { name: /Stage 6 of 6/ })).toHaveAttribute('aria-pressed', 'true')
  })

  test('is keyboard operable and offers a text explanation of stages, jobs and gates', async ({ page }) => {
    const node = page.getByRole('button', { name: /Stage 3 of 6/ })
    await node.focus()
    await page.keyboard.press('Enter')
    await expect(node).toHaveAttribute('aria-pressed', 'true')
    for (const h of ['Stages', 'Jobs', 'Quality gates', 'Deployment strategy', 'Pipeline architecture']) await expect(page.locator('#cicd').getByRole('heading', { name: h })).toBeVisible()
  })

  test('says it is illustrative and does not claim a live pipeline', async ({ page }) => {
    await expect(page.locator('#cicd')).toContainText('Illustrative passing run')
    await expect(page.locator('#cicd')).toContainText('not a live build status')
    const text = await page.locator('#cicd').innerText()
    expect(text).not.toMatch(/build passing|deployed successfully|✅/i)
  })

  test('links to the real workflow files in the owner repository', async ({ page }) => {
    await page.locator('#cicd').getByRole('button', { name: 'Workflow example' }).click()
    const gh = page.locator('#cicd').getByRole('link', { name: /View on GitHub/ })
    await expect(gh).toHaveAttribute('href', 'https://github.com/bibiyo21/portfolio/blob/main/.github/workflows/ci-cd.yml')
    await page.getByRole('tab', { name: 'GitLab CI/CD' }).click()
    await page.locator('#cicd').getByRole('button', { name: 'Workflow example' }).click()
    await expect(page.locator('#cicd').getByRole('link', { name: /View on GitLab/ })).toHaveAttribute('href', /\.gitlab-ci\.yml$/)
  })

  test('shows syntax-highlighted YAML from the actual workflow files', async ({ page }) => {
    await page.locator('#cicd').getByRole('button', { name: 'Workflow example' }).click()
    const code = page.getByRole('region', { name: 'GitHub Actions workflow file' })
    await expect(code).toContainText('name: CI/CD')
    await expect(code.locator('span.text-peach').first()).toBeVisible()
    await expect(code.locator('span.text-on-dark-mute').first()).toBeVisible()
    await expect(code).toHaveAttribute('tabindex', '0')
  })
})

test.describe('CI/CD diagram layout', () => {
  for (const width of [1080, 1280, 1440, 1920]) {
    test(`stage cards use one consistent label layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await jumpToScene(page, 'cicd')
      await page.locator('#cicd svg[role="group"]').scrollIntoViewIfNeeded()
      await page.waitForTimeout(1500)
      const cards = await page.locator('#cicd svg g[role="button"]').evaluateAll((els) =>
        els.map((g) => {
          const box = g.querySelector('rect')!.getBoundingClientRect()
          const labels = Array.from(g.querySelectorAll('text')).filter((t) => (t.textContent ?? '').length > 3)
          const first = labels[0]!.getBoundingClientRect()
          return {
            lines: labels.length,
            maxRight: Math.max(...labels.map((t) => t.getBoundingClientRect().right)) - box.right,
            left: first.left - box.left,
            top: first.top - box.top,
            height: box.height,
          }
        }),
      )
      expect(cards).toHaveLength(6)
      // Every label stays inside its card with room to spare.
      for (const c of cards) expect(c.maxRight).toBeLessThanOrEqual(-12)
      // Same left inset and the same first-line position on every card, whatever the label length.
      const lefts = cards.map((c) => Math.round(c.left))
      const tops = cards.map((c) => Math.round(c.top))
      expect(Math.max(...lefts) - Math.min(...lefts)).toBeLessThanOrEqual(1)
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1)
      // No label needs more than two lines, and all cards are the same height.
      for (const c of cards) expect(c.lines).toBeLessThanOrEqual(2)
      expect(new Set(cards.map((c) => Math.round(c.height))).size).toBe(1)
    })
  }

  test('is a horizontal flow on wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await jumpToScene(page, 'cicd')
    await page.locator('#cicd svg[role="group"]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    const tops = await page.locator('#cicd svg[role="group"] g[role="button"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
    expect(tops).toHaveLength(6)
    expect(new Set(tops).size).toBe(1)
  })

  test('becomes a vertical flow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await jumpToScene(page, 'cicd')
    await page.locator('#cicd svg[role="group"]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    const boxes = await page.locator('#cicd svg[role="group"] g[role="button"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
    expect(new Set(boxes.map((b) => Math.round(b.left))).size).toBe(1)
    for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.top).toBeGreaterThan(boxes[i - 1]!.bottom - 1)
    for (const b of boxes) expect(b.right).toBeLessThanOrEqual(390)
  })
})
