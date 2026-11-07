import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { parseContent } from '../src/lib/content-parse.ts'
import { contentSchemas, type ContentData, type ContentName } from '../src/lib/content-schemas.ts'
import { headTags, robotsTxt, sitemapXml, type SeoOptions } from '../src/lib/seo.ts'

const ID = 'virtual:content'
const RESOLVED = '\0' + ID
const HEAD_MARKER = '<!-- seo-head -->'

/**
 * Canonical origin and indexability. SITE_URL overrides the YAML value (for the custom domain switch-over).
 * Vercel sets VERCEL_ENV during its builds: anything other than production is kept out of search results.
 */
export function seoOptions(data: Pick<ContentData, 'profile'>, env: NodeJS.ProcessEnv = process.env): SeoOptions {
  const siteUrl = (env.SITE_URL || data.profile.seo.siteUrl).replace(/\/+$/, '')
  const indexable = !env.VERCEL_ENV || env.VERCEL_ENV === 'production'
  return { siteUrl, indexable }
}

/**
 * Parses and validates every YAML content file at build time and serves the result as plain JSON.
 * The browser no longer ships the YAML parser or runs schema validation on load, and a content error
 * fails the build (or shows the dev overlay) with the file and field named.
 */
export function contentPlugin(): Plugin {
  const dir = resolve(import.meta.dirname, '../src/content')
  const names = Object.keys(contentSchemas) as ContentName[]
  const readAll = () => {
    const data: Record<string, unknown> = {}
    for (const name of names) data[name] = parseContent(name, readFileSync(resolve(dir, `${name}.yaml`), 'utf8'))
    return data as ContentData
  }
  return {
    name: 'portfolio-content',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null
      const data: Record<string, unknown> = {}
      for (const name of names) {
        const file = resolve(dir, `${name}.yaml`)
        this.addWatchFile(file)
        data[name] = parseContent(name, readFileSync(file, 'utf8'))
      }
      return `export default ${JSON.stringify(data)}`
    },
    // Search and share metadata goes into the initial HTML, not only after JavaScript runs.
    transformIndexHtml(html) {
      const data = readAll()
      if (!html.includes(HEAD_MARKER)) throw new Error(`index.html is missing the ${HEAD_MARKER} marker`)
      return html.replace(HEAD_MARKER, headTags(data, seoOptions(data)))
    },
    generateBundle() {
      if (this.environment?.config.build.ssr) return
      const data = readAll()
      const opts = seoOptions(data)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(opts) })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(opts, new Date().toISOString().slice(0, 10)) })
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(dir) || !file.endsWith('.yaml')) return
      const mod = server.moduleGraph.getModuleById(RESOLVED)
      if (mod) server.moduleGraph.invalidateModule(mod)
      server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
