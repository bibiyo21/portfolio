import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene } from '../fixtures/test-data'

// The live demo is never opened by these tests. Only the link attributes are checked.
const DEMO = 'https://venue-seat-planner.vercel.app/'

async function showPersonal(page: import('@playwright/test').Page) {
  await page.goto('/')
  await jumpToScene(page, 'work')
  const section = page.getByTestId('personal-projects')
  await section.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  return section
}

test.describe('Venue Seat Planner (personal proof of concept)', () => {
  test('appears in its own labelled section, separate from the GTI client case studies', async ({ page }) => {
    const section = await showPersonal(page)
    await expect(section.getByRole('heading', { level: 3, name: 'Side projects and proofs of concept' })).toBeVisible()
    await expect(section.getByTestId('personal-card')).toHaveCount(1)
    await expect(section.getByTestId('project-card')).toHaveCount(0)
    await expect(page.locator('#work').getByTestId('project-card')).toHaveCount(2)
    await expect(section.getByRole('heading', { level: 4, name: 'Venue Seat Planner' })).toBeVisible()
  })

  test('is framed as a hobby project and proof of concept, with an explicit status label', async ({ page }) => {
    const section = await showPersonal(page)
    const card = section.getByTestId('personal-card')
    await expect(card.getByText('Personal PoC')).toBeVisible()
    await expect(card.getByText('Hobby project', { exact: true })).toBeVisible()
    await expect(card).toContainText('A personal proof of concept exploring how venue seating plans can be organized through an interactive web experience.')
    await expect(card).toContainText('Built as a hobby project to experiment with product ideas, interface design, and practical application development.')
  })

  test('never reads as client work, a product, or a maintained service, and invents no numbers', async ({ page }) => {
    const section = await showPersonal(page)
    await section.getByRole('button', { name: 'View details' }).click()
    const text = (await section.getByTestId('personal-card').innerText()) + ' ' + (await page.getByRole('dialog').innerText())
    expect(text).not.toMatch(/\b(commissioned|commercial|saas|enterprise|production-ready|customers?|clients?|testimonials?|maintained)\b/i)
    expect(text).not.toMatch(/\d+%|\d+ (users|customers|events|venues)|revenue/i)
  })

  test('Open Demo goes to the supplied URL in a new tab with safe rel attributes', async ({ page }) => {
    const section = await showPersonal(page)
    const link = section.getByRole('link', { name: /Open Demo/ })
    await expect(link).toHaveAttribute('href', DEMO)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
    await expect(link).toHaveAttribute('rel', /noreferrer/)
    await expect(link).toContainText('opens in a new tab')
    // The label is "Open Demo", not a vague "Learn more".
    await expect(link).toContainText('Open Demo')
  })

  test('View details opens a dialog that shows only verified content', async ({ page }) => {
    const section = await showPersonal(page)
    await section.getByRole('button', { name: 'View details' }).click()
    const dialog = page.getByRole('dialog', { name: 'Venue Seat Planner' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Personal project · Proof of concept')
    await expect(dialog.getByLabel('Project status')).toContainText('Personal PoC')
    await expect(dialog).toContainText('An independently built web application for organizing event seating')
    await expect(dialog).toContainText('Technical specification')
    await expect(dialog).toContainText('Express 5')
    await expect(dialog).toContainText('The live demo opens on an administrator login page')
    for (const hidden of ['Motivation', 'What I learned', 'Outcome', 'Role and contribution']) {
      await expect(dialog.getByText(hidden, { exact: true }), hidden).toHaveCount(0)
    }
    await expect(dialog.getByRole('link', { name: /Open Demo/ })).toHaveAttribute('href', DEMO)
    await expect(dialog.getByRole('link', { name: /Open Demo/ })).toHaveAttribute('rel', /noopener/)
    const shots = dialog.getByLabel('Screenshots').locator('img')
    await expect(shots).toHaveCount(5)
    for (const img of await shots.all()) await expect(img).toHaveAttribute('alt', /.{10,}/)
    await expect(dialog.getByText('Sample data.').first()).toBeVisible()
  })

  test('the dialog closes with Escape and returns focus to the button that opened it', async ({ page }) => {
    const section = await showPersonal(page)
    const opener = section.getByRole('button', { name: 'View details' })
    await opener.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(opener).toBeFocused()
  })

  test('both actions are reachable by keyboard', async ({ page }) => {
    const section = await showPersonal(page)
    const link = section.getByRole('link', { name: /Open Demo/ })
    await link.focus()
    await expect(link).toBeFocused()
    expect(await link.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe('solid')
    await page.keyboard.press('Tab')
    await expect(section.getByRole('button', { name: 'View details' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('card shows one sample-data screenshot with alt text', async ({ page }) => {
    const section = await showPersonal(page)
    const img = section.getByTestId('personal-card').locator('img')
    await expect(img).toHaveCount(1)
    await expect(img).toHaveAttribute('alt', /floor plan/i)
    expect(await img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true)
  })

  test('is visually distinct from the client cards (dashed border) and fits the viewport', async ({ page }) => {
    const section = await showPersonal(page)
    const card = section.getByTestId('personal-card')
    expect(await card.evaluate((e) => getComputedStyle(e).borderTopStyle)).toBe('dashed')
    const box = await card.boundingBox()
    const vw = page.viewportSize()!.width
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(vw)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
})

test.describe('Venue Seat Planner on a phone', () => {
  test.use({ viewport: { width: 360, height: 800 } })

  test('the card and dialog fit a small screen and the actions have comfortable tap targets', async ({ page }) => {
    const section = await showPersonal(page)
    const card = section.getByTestId('personal-card')
    const box = await card.boundingBox()
    expect(box!.x + box!.width).toBeLessThanOrEqual(360)
    for (const el of [section.getByRole('link', { name: /Open Demo/ }), section.getByRole('button', { name: 'View details' })]) {
      const b = await el.boundingBox()
      expect(b!.height).toBeGreaterThanOrEqual(44)
    }
    await section.getByRole('button', { name: 'View details' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(700)
    const d = await dialog.boundingBox()
    expect(d!.x + d!.width).toBeLessThanOrEqual(361)
    expect(d!.y + d!.height).toBeLessThanOrEqual(801)
  })
})
