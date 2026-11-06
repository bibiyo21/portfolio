import { expect, test } from '@playwright/test'
import { jumpToScene } from '../fixtures/test-data'

test.describe('experience and recognition', () => {
  test('lists every company and role with the periods exactly as supplied', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'experience')
    const scene = page.locator('#experience')
    await expect(scene.getByTestId('company')).toHaveCount(4)
    for (const text of ['Leaptel', 'Solutions30 Group SA', 'Eastvantage', 'Gameloft Philippines Inc.']) await expect(scene.getByRole('heading', { level: 3, name: text })).toBeVisible()
    for (const text of [
      'June 2026 – Present',
      'December 2025 – June 2026',
      'March 2019 – November 2025',
      'June 2021 – November 2023',
      'March 2019 – June 2021',
      'October 2017 – April 2019',
      'June 2016 – October 2017',
    ])
      await expect(scene.getByText(text, { exact: true })).toBeVisible()
  })

  test('Solutions30 contributions expand and use the supported wording', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'experience')
    const btn = page.getByRole('button', { name: /show details for solutions architect/i })
    await btn.click()
    await expect(page.getByText('Initiated migration from older frameworks')).toBeVisible()
    await expect(page.getByText('Contributed to migration from CakePHP 1.3')).toBeVisible()
    await expect(page.getByText('Conducted code reviews')).toBeVisible()
    await page.getByRole('button', { name: /hide details for solutions architect/i }).click()
    await expect(page.getByText('Initiated migration from older frameworks')).toBeHidden()
  })

  test('shows no placeholder text for roles without supplied details', async ({ page }) => {
    await page.goto('/')
    const text = await page.locator('#experience').innerText()
    expect(text).not.toMatch(/to be added|placeholder|details coming/i)
  })

  test('the Innovators Club chairmanship is nested under Gameloft', async ({ page }) => {
    await page.goto('/')
    const gameloft = page.locator('#experience [data-testid="company"]', { hasText: 'Gameloft Philippines Inc.' })
    const lead = gameloft.getByTestId('leadership')
    await expect(lead).toContainText("Chairman, Gameloft Innovators' Club")
    await expect(lead).toContainText('November 2016 – April 2019')
    await expect(page.locator('#experience').getByRole('heading', { level: 3, name: /Innovators/ })).toHaveCount(0)
  })

  test('recognition shows education, three certifications and seven award entries', async ({ page }) => {
    await page.goto('/')
    await jumpToScene(page, 'recognition')
    const scene = page.locator('#recognition')
    await expect(scene).toContainText('Bachelor of Science in Information Technology')
    await expect(scene).toContainText('Polytechnic University of the Philippines — Taguig Branch')
    await expect(scene).toContainText('2011 – 2016')
    for (const c of ['Certified SAFe 5 Agilist', 'Certified SAFe 5 Architect', 'Certified Lean Six Sigma White Belt']) await expect(scene).toContainText(c)
    await expect(scene.getByTestId('awards').getByRole('listitem')).toHaveCount(7)
    await expect(scene).toContainText('Q3 2019 · Q3 2021 · Q3 2022 · Q1 2023')
    await expect(scene).toContainText('1st GDG Hackfair')
    await expect(scene.locator('img')).toHaveCount(0)
  })
})
