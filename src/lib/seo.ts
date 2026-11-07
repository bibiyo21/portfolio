import type { ContentData } from './content-schemas.ts'

// Builds the search and share metadata from the YAML content at build time, so it is in the initial HTML.
// Everything here is derived from verified content: no invented employers, awards or locations.

export interface SeoOptions {
  /** Canonical origin, e.g. https://ibrahemsotejo.com (no trailing slash). */
  siteUrl: string
  /** False for preview and development builds: adds noindex and a disallow-all robots.txt. */
  indexable: boolean
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function absolute(siteUrl: string, path: string): string {
  return new URL(path, siteUrl + '/').toString()
}

export function personJsonLd(content: Pick<ContentData, 'profile' | 'skills'>, siteUrl: string) {
  const { profile, skills } = content
  // Only résumé-confirmed skills, never the "current interests" category.
  const knowsAbout = skills.categories.filter((c) => c.kind === 'confirmed').flatMap((c) => c.skills.map((s) => s.name))
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.seo.description,
    url: siteUrl + '/',
    ...(profile.portrait ? { image: absolute(siteUrl, profile.portrait.src) } : {}),
    sameAs: [profile.links.linkedin, profile.links.github],
    homeLocation: { '@type': 'Country', name: profile.location },
    knowsAbout,
  }
}

export function headTags(content: Pick<ContentData, 'profile' | 'skills'>, opts: SeoOptions): string {
  const { seo } = content.profile
  const url = opts.siteUrl + '/'
  const image = absolute(opts.siteUrl, seo.ogImage)
  // "<" is escaped so the JSON can never close the script element.
  const jsonLd = JSON.stringify(personJsonLd(content, opts.siteUrl)).replace(/</g, '\\u003c')
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="robots" content="${opts.indexable ? 'index, follow' : 'noindex, nofollow'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(content.profile.name)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(seo.ogImageAlt)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')
}

export function robotsTxt(opts: SeoOptions): string {
  if (!opts.indexable) return 'User-agent: *\nDisallow: /\n'
  return `User-agent: *\nAllow: /\n\nSitemap: ${opts.siteUrl}/sitemap.xml\n`
}

export function sitemapXml(opts: SeoOptions, lastmod: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${esc(opts.siteUrl)}/</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '  </url>',
    '</urlset>',
    '',
  ].join('\n')
}
