import { describe, expect, it } from 'vitest'
import { seoOptions } from '../../scripts/vite-content-plugin.ts'
import { affiliations, profile, skills } from './content-loader'
import { headTags, personJsonLd, robotsTxt, sitemapXml } from './seo'

const content = { profile, skills }
const prod = { siteUrl: 'https://example.com', indexable: true }

describe('SEO metadata', () => {
  it('builds title, description, canonical, Open Graph and Twitter tags from the content', () => {
    const html = headTags(content, prod)
    expect(html).toContain('<title>Ibrahem Sotejo | Solutions Architect &amp; Full-Stack Developer</title>')
    expect(html).toContain('<link rel="canonical" href="https://example.com/" />')
    expect(html).toContain('<meta name="robots" content="index, follow" />')
    for (const p of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:image:alt', 'og:site_name'])
      expect(html, p).toContain(`property="${p}"`)
    expect(html).toContain('<meta property="og:image" content="https://example.com/images/illustrations/og-image.png" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    // One of each: no duplicate metadata.
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html.match(/name="description"/g)).toHaveLength(1)
  })

  it('describes a Person with verified facts only', () => {
    const ld = personJsonLd(content, prod.siteUrl)
    expect(ld).toMatchObject({ '@type': 'Person', name: 'Ibrahem Sotejo', jobTitle: 'Solutions Architect', url: 'https://example.com/' })
    expect(ld.sameAs).toEqual([profile.links.linkedin, profile.links.github])
    expect(ld.image).toBe('https://example.com/images/profile/ibrahem-professional-portrait.jpg')
    // Current interests (GPT, MCP and the like) are not résumé skills, so they are not claimed.
    const interests = skills.categories.filter((c) => c.kind !== 'confirmed').flatMap((c) => c.skills.map((s) => s.name))
    for (const i of interests) expect(ld.knowsAbout).not.toContain(i)
    expect(ld.knowsAbout).toContain('React.js')
    expect(JSON.stringify(ld)).not.toMatch(/worksFor|award|alumniOf|founder/i)
  })

  it('names published affiliations as organisations, without implying a role', () => {
    const ld = personJsonLd({ ...content, affiliations }, prod.siteUrl)
    expect(ld.affiliation).toEqual([
      expect.objectContaining({
        '@type': 'Organization',
        name: 'Kora Design Solutions',
        logo: 'https://example.com/images/affiliations/kora-design-solutions-logo.jpg',
        sameAs: ['https://www.facebook.com/koradesignsolutions'],
      }),
    ])
    // The employer-nested Innovators Club is not a standalone affiliation.
    expect(JSON.stringify(ld)).not.toContain('Innovators')
    expect(JSON.stringify(ld)).not.toMatch(/worksFor|founder|owner|employee/i)
    expect(headTags({ ...content, affiliations }, prod)).toContain('"affiliation":[{"@type":"Organization","name":"Kora Design Solutions"')
  })

  it('keeps the JSON-LD from breaking out of its script element', () => {
    const tricky = { ...profile, seo: { ...profile.seo, description: '</script><script>alert(1)</script>' } }
    expect(headTags({ profile: tricky, skills }, prod)).not.toContain('</script><script>')
  })

  it('keeps previews and development builds out of search results', () => {
    const preview = { ...prod, indexable: false }
    expect(headTags(content, preview)).toContain('content="noindex, nofollow"')
    expect(robotsTxt(preview)).toBe('User-agent: *\nDisallow: /\n')
    expect(robotsTxt(prod)).toContain('Sitemap: https://example.com/sitemap.xml')
  })

  it('lists only the canonical root URL in the sitemap', () => {
    const xml = sitemapXml(prod, '2026-11-07')
    expect(xml.match(/<loc>/g)).toHaveLength(1)
    expect(xml).toContain('<loc>https://example.com/</loc>')
  })

  it('takes the canonical origin from SITE_URL, else the YAML, and never indexes a Vercel preview', () => {
    expect(seoOptions({ profile }, {})).toEqual({ siteUrl: profile.seo.siteUrl, indexable: true })
    expect(seoOptions({ profile }, { SITE_URL: 'https://ibrahemsotejo.com/' }).siteUrl).toBe('https://ibrahemsotejo.com')
    expect(seoOptions({ profile }, { VERCEL_ENV: 'preview' }).indexable).toBe(false)
    expect(seoOptions({ profile }, { VERCEL_ENV: 'production' }).indexable).toBe(true)
    expect(profile.seo.siteUrl).not.toMatch(/-git-|localhost/)
  })
})
