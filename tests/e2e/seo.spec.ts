import { expect, test } from '@playwright/test'

// These read the raw HTML response, before any JavaScript runs: what a crawler or link preview receives.
test.describe('search and share metadata in the initial HTML', () => {
  test('title, description, canonical, Open Graph, Twitter and JSON-LD are present', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('<title>Ibrahem Sotejo | Solutions Architect &amp; Full-Stack Developer</title>')
    expect(html).toMatch(/<meta name="description" content="Ibrahem Sotejo is a Solutions Architect and Full-Stack Developer[^"]+" \/>/)
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+\/" \/>/)
    for (const p of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:image:alt', 'og:site_name'])
      expect(html, p).toContain(`property="${p}"`)
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.+?)<\/script>/)![1]!)
    expect(ld['@type']).toBe('Person')
    expect(ld.name).toBe('Ibrahem Sotejo')
    expect(ld.sameAs).toHaveLength(2)
  })

  test('the canonical, og:url and JSON-LD url agree and are never a preview or localhost address', async ({ request }) => {
    const html = await (await request.get('/')).text()
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1]!
    expect(html).toContain(`<meta property="og:url" content="${canonical}" />`)
    expect(html).toContain(`"url":"${canonical}"`)
    expect(canonical).not.toMatch(/localhost|-git-|-[a-z0-9]{9}-flow-stack-digital/)
  })

  test('the page content is prerendered: headings and text exist without JavaScript', async ({ request }) => {
    const html = await (await request.get('/')).text()
    const body = html.slice(html.indexOf('<div id="root">'))
    expect(body.match(/<h1[ >]/g)).toHaveLength(1)
    for (const t of ['Architecting Systems.', 'Ibrahem Sotejo', 'GTI Main', 'Solutions30 Group SA', 'Venue Seat Planner', 'From Code Commit'])
      expect(body, t).toContain(t)
  })

  test('without JavaScript the prerendered content is readable', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('I turn complex requirements into practical digital solutions').first()).toBeVisible()
    await ctx.close()
  })

  test('robots.txt allows crawling and points at the sitemap; the sitemap lists only the root', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toMatch(/^User-agent: \*\nAllow: \/\n\nSitemap: https:\/\/[^\n]+\/sitemap\.xml\n$/)
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    const xml = await sitemap.text()
    expect(xml.match(/<loc>/g)).toHaveLength(1)
    const canonical = (await (await request.get('/')).text()).match(/<link rel="canonical" href="([^"]+)"/)![1]!
    expect(xml).toContain(`<loc>${canonical}</loc>`)
  })

  test('the unpublished Kora Design Solutions draft is not in the production page', async ({ request }) => {
    expect(await (await request.get('/')).text()).not.toContain('Kora Design Solutions')
  })
})
