import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene } from '../fixtures/test-data'

test.describe('architecture diagram', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'architecture')
  })

  test('is a representative architecture, labelled as such', async ({ page }) => {
    await expect(page.locator('#architecture')).toContainText('Representative architecture. This is a general pattern, not the architecture of any specific client system.')
    await expect(page.locator('#architecture svg[role="group"]')).toBeVisible()
    await expect(page.locator('#architecture img')).toHaveCount(0)
  })

  test('has the five layers plus the optional AI lane', async ({ page }) => {
    const nodes = page.locator('#architecture svg g[role="button"]')
    await expect(nodes).toHaveCount(6)
    for (const n of ['User Interfaces', 'Frontend Applications', 'Backend Services / APIs', 'Business Logic and Integrations', 'Data Stores / External Systems', 'AI Models / AI Services'])
      await expect(page.locator('#architecture svg').getByRole('button', { name: new RegExp(`^${n.replace('/', '\\/')}`) })).toBeVisible()
  })

  test('clicking a layer explains its purpose, responsibilities and technologies', async ({ page }) => {
    await page.locator('#architecture svg').getByRole('button', { name: /^Backend Services/ }).click()
    const d = page.getByTestId('architecture-detail')
    await expect(d).toContainText('Backend Services / APIs')
    await expect(d).toContainText('Typical responsibilities')
    await expect(d).toContainText('API design and contracts')
    for (const t of ['PHP', 'Laravel', 'Node.js', 'Python', 'WebSockets']) await expect(d).toContainText(t)
    await expect(d).toContainText('Where I have worked at this layer')
  })

  test('an example links to the scene that documents it', async ({ page }) => {
    await page.locator('#architecture svg').getByRole('button', { name: /^Business Logic/ }).click()
    await page.getByTestId('architecture-detail').getByRole('link', { name: /ERP APIs and XML-RPC/ }).click()
    await expect(page).toHaveURL(/#experience$/)
    await expect(page.locator('#experience')).toBeInViewport({ ratio: 0.2 })
  })

  test('the AI lane is marked optional and its details are shown on selection', async ({ page }) => {
    await page.locator('#architecture svg').getByRole('button', { name: /^AI Models/ }).click()
    await expect(page.getByTestId('architecture-detail')).toContainText('Optional AI and automation lane')
    await expect(page.getByTestId('architecture-detail')).toContainText('GPT')
  })

  test('is keyboard operable', async ({ page }) => {
    const node = page.locator('#architecture svg').getByRole('button', { name: /^Frontend Applications/ })
    await node.focus()
    await page.keyboard.press('Enter')
    await expect(node).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('architecture-detail')).toContainText('React.js')
  })

  test('connectors animate directionally (dash flow) unless motion is reduced', async ({ page }) => {
    const anim = await page.locator('#architecture svg path[stroke-dasharray]').first().evaluate((e) => getComputedStyle(e).animationName)
    expect(anim).toBe('flow')
  })

  test('flows left to right on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(800)
    const tops = await page.locator('#architecture svg g[role="button"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
    expect(new Set(tops.slice(0, 5)).size).toBe(1)
  })
})

test.describe('architecture diagram on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('becomes a legible vertical flow that fits the screen', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'architecture')
    await page.locator('#architecture svg').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    const boxes = await page.locator('#architecture svg g[role="button"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
    expect(boxes).toHaveLength(6)
    expect(new Set(boxes.slice(0, 5).map((b) => Math.round(b.left))).size).toBe(1)
    for (let i = 1; i < 5; i++) expect(boxes[i]!.top).toBeGreaterThan(boxes[i - 1]!.bottom - 1)
    for (const b of boxes) {
      expect(b.right).toBeLessThanOrEqual(390)
      expect(b.height).toBeGreaterThanOrEqual(60)
    }
  })
})
