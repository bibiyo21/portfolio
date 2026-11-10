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

type SeoContent = Pick<ContentData, 'profile' | 'skills'> & Partial<Pick<ContentData, 'affiliations' | 'faq'>>

const personId = (siteUrl: string) => `${siteUrl}/#person`

export function personJsonLd(content: SeoContent, siteUrl: string) {
  const { profile, skills } = content
  // Only résumé-confirmed skills, never the "current interests" category.
  const knowsAbout = skills.categories.filter((c) => c.kind === 'confirmed').flatMap((c) => c.skills.map((s) => s.name))
  // Only published standalone affiliations; no role or relationship is implied beyond "affiliation".
  const affiliation = (content.affiliations?.items ?? [])
    .filter((a) => a.published && !a.parentCompany)
    .map((a) => {
      const sameAs = [a.links.facebook, a.links.website, a.url].filter((u): u is string => Boolean(u))
      return {
        '@type': 'Organization',
        name: a.name,
        ...(a.description ? { description: a.description } : {}),
        ...(a.logo ? { logo: absolute(siteUrl, a.logo) } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      }
    })
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId(siteUrl),
    name: profile.name,
    jobTitle: profile.title,
    description: profile.seo.description,
    url: siteUrl + '/',
    ...(profile.portrait ? { image: absolute(siteUrl, profile.portrait.src) } : {}),
    sameAs: [profile.links.linkedin, profile.links.github],
    homeLocation: { '@type': 'Country', name: profile.location },
    knowsAbout,
    ...(affiliation.length ? { affiliation } : {}),
  }
}

/**
 * The site, the page as a profile of the person, and the on-page FAQ, linked to the Person by @id.
 * Only text that is visible on the page is described.
 */
export function siteJsonLd(content: SeoContent, siteUrl: string) {
  const { profile, faq } = content
  const url = siteUrl + '/'
  const person = { '@id': personId(siteUrl) }
  // FAQ answers carry {email}-style tokens that the page turns into links; here they become plain text.
  const tokens: Record<string, string> = {
    email: profile.email,
    phone: profile.phoneDisplay,
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  }
  const plain = (answer: string) => answer.replace(/\{([a-z]+)\}/g, (all, key: string) => tokens[key] ?? all)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url,
        name: profile.name,
        description: profile.seo.description,
        inLanguage: 'en',
        publisher: person,
      },
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/#profile`,
        url,
        name: profile.seo.title,
        inLanguage: 'en',
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: person,
        mainEntity: person,
        primaryImageOfPage: absolute(siteUrl, profile.seo.ogImage),
      },
      ...(faq?.items.length
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${siteUrl}/#faq`,
              isPartOf: { '@id': `${siteUrl}/#website` },
              mainEntity: faq.items.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: plain(item.answer) },
              })),
            },
          ]
        : []),
    ],
  }
}

export function headTags(content: SeoContent, opts: SeoOptions): string {
  const { seo } = content.profile
  const url = opts.siteUrl + '/'
  const image = absolute(opts.siteUrl, seo.ogImage)
  // "<" is escaped so the JSON can never close the script element.
  const safe = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
  const jsonLd = safe(personJsonLd(content, opts.siteUrl))
  const siteLd = safe(siteJsonLd(content, opts.siteUrl))
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="author" content="${esc(content.profile.name)}" />`,
    // Lets search results use the full description and the large preview image.
    `<meta name="robots" content="${opts.indexable ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, nofollow'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:site_name" content="${esc(content.profile.name)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(seo.ogImageAlt)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    `<script type="application/ld+json">${siteLd}</script>`,
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
