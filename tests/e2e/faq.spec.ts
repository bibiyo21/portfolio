import { expect, test } from '../fixtures/recaptcha'
import { jumpToScene, sceneTop } from '../fixtures/test-data'

test.describe('FAQ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'faq')
  })

  test('lists the twelve questions as collapsed buttons with aria-expanded and aria-controls', async ({ page }) => {
    const buttons = page.locator('#faq button[aria-expanded]')
    await expect(buttons).toHaveCount(12)
    for (const b of await buttons.all()) {
      await expect(b).toHaveAttribute('aria-expanded', 'false')
      await expect(b).toHaveAttribute('aria-controls', /.+/)
    }
  })

  test('opening a question reveals a labelled answer, and closing hides it', async ({ page }) => {
    const q = page.getByRole('button', { name: 'What does Ibrahem do as a Solutions Architect?' })
    await q.click()
    await expect(q).toHaveAttribute('aria-expanded', 'true')
    const region = page.getByRole('region', { name: 'What does Ibrahem do as a Solutions Architect?' })
    await expect(region).toContainText('architecture documentation')
    await q.click()
    await expect(region).toBeHidden()
    await expect(q).toHaveAttribute('aria-expanded', 'false')
  })

  test('is single-open by default', async ({ page }) => {
    const a = page.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })
    const b = page.getByRole('button', { name: 'Does Ibrahem work with AI?' })
    await a.click()
    await b.click()
    await expect(a).toHaveAttribute('aria-expanded', 'false')
    await expect(b).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#faq [role="region"]')).toHaveCount(1)
  })

  test('works with Enter and Space and shows a visible focus ring', async ({ page }) => {
    const q = page.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })
    await q.focus()
    expect(await q.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe('solid')
    await page.keyboard.press('Enter')
    await expect(q).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Space')
    await expect(q).toHaveAttribute('aria-expanded', 'false')
  })

  test('grounded answers: GTI, availability, certifications and AI wording', async ({ page }) => {
    const open = async (name: string) => {
      await page.getByRole('button', { name }).click()
      return page.getByRole('region', { name })
    }
    await expect(await open('What is the GTI Digital Platform project?')).toContainText('proposed or designed unless the delivered status has been confirmed')
    await expect(await open('Is Ibrahem available for freelance or consulting work?')).toContainText('For project, consulting, or collaboration inquiries, please get in touch.')
    await expect(await open('What certifications does Ibrahem hold?')).toContainText('Certified Lean Six Sigma White Belt')
    const ai = await open('Does Ibrahem work with AI?')
    await expect(ai).toContainText('GPT, Gemini and DeepSeek')
    await expect(ai).not.toContainText(/production/i)
  })

  test('the contact answer shows working links and the latest details', async ({ page }) => {
    const region = await (async () => {
      await page.getByRole('button', { name: 'How can someone contact Ibrahem?' }).click()
      return page.getByRole('region', { name: 'How can someone contact Ibrahem?' })
    })()
    await expect(region.getByRole('link', { name: 'ibrahem.sotejo.dev@gmail.com' })).toHaveAttribute('href', 'mailto:ibrahem.sotejo.dev@gmail.com')
    await expect(region).toContainText('+63 917 491 2048')
    await expect(region.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/ibrahem-sotejo/')
    await expect(region.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/bibiyo21')
  })

  test('long answers expand the scene instead of clipping', async ({ page }) => {
    const before = await page.locator('#faq').evaluate((e) => e.getBoundingClientRect().height)
    await page.getByRole('button', { name: 'What technologies does Ibrahem work with?' }).click()
    const region = page.getByRole('region', { name: 'What technologies does Ibrahem work with?' })
    await expect(region).toBeVisible()
    await expect.poll(() => page.locator('#faq').evaluate((e) => e.getBoundingClientRect().height)).toBeGreaterThanOrEqual(before - 1)
    await expect.poll(() => region.evaluate((e) => e.scrollHeight - e.clientHeight), { timeout: 4000 }).toBeLessThanOrEqual(2)
  })

  test('the closing CTA leads to the contact scene', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Still have a question?' })).toBeVisible()
    await page.getByRole('button', { name: /Get in touch/ }).click()
    await expect.poll(() => sceneTop(page, 'contact'), { timeout: 6000 }).toBeLessThanOrEqual(2)
  })
})

test.describe('FAQ on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('rows are full width with comfortable tap targets and answers expand naturally', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'faq')
    const rows = await page.locator('#faq button[aria-expanded]').evaluateAll((els) => els.map((e) => ({ w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height })))
    for (const r of rows) {
      expect(r.h).toBeGreaterThanOrEqual(64)
      expect(r.w).toBeGreaterThan(390 - 60)
    }
    const q = page.getByRole('button', { name: 'What technologies does Ibrahem work with?' })
    await q.scrollIntoViewIfNeeded()
    await q.tap().catch(() => q.click())
    const region = page.getByRole('region', { name: 'What technologies does Ibrahem work with?' })
    await expect(region).toBeVisible()
    await expect.poll(() => region.evaluate((e) => e.scrollHeight - e.clientHeight), { timeout: 4000 }).toBeLessThanOrEqual(2)
    const box = await region.boundingBox()
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
  })
})
