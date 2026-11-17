// Renders the app to static HTML after `vite build` and places it inside #root in dist/index.html.
// Run by `npm run build`. Fails loudly if the marker is missing or the render is empty.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { parseContent } from '../src/lib/content-parse.ts'
import { contentSchemas, type ContentData, type ContentName } from '../src/lib/content-schemas.ts'
import { headTags, pageHeadTags, standalonePages } from '../src/lib/seo.ts'
import { seoOptions } from './vite-content-plugin.ts'

const root = resolve(import.meta.dirname, '..')
const outDir = resolve(root, 'dist-ssr')

await build({ root, logLevel: 'warn', build: { ssr: 'src/entry-server.tsx', outDir, emptyOutDir: true } })
const { render } = (await import(pathToFileURL(resolve(outDir, 'entry-server.js')).href)) as { render: (path?: string) => string }

const file = resolve(root, 'dist/index.html')
const template = readFileSync(file, 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('dist/index.html has no empty #root to fill')

const html = render('/')
if (html.length < 1000) throw new Error('Prerender produced almost no HTML')
writeFileSync(file, template.replace(marker, `<div id="root">${html}</div>`))
console.log(`prerendered ${Math.round(html.length / 1024)} kB of HTML into dist/index.html`)

// Standalone pages (case studies): the home page's head tags are swapped for the page's own, and the page is
// written to dist/<path>/index.html, which Vercel serves at /<path> without any rewrite.
const dir = resolve(root, 'src/content')
const content = {} as Record<string, unknown>
for (const name of Object.keys(contentSchemas) as ContentName[]) content[name] = parseContent(name, readFileSync(resolve(dir, `${name}.yaml`), 'utf8'))
const data = content as ContentData
const opts = seoOptions(data)
const homeHead = headTags(data, opts)
if (!template.includes(homeHead)) throw new Error('Could not find the home page head tags to replace in dist/index.html')
for (const p of standalonePages(data.projects)) {
  const out = render(p.path)
  if (out.length < 1000) throw new Error(`Prerender of ${p.path} produced almost no HTML`)
  const target = resolve(root, 'dist' + p.path, 'index.html')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, template.replace(homeHead, pageHeadTags(data, opts, p)).replace(marker, `<div id="root">${out}</div>`))
  console.log(`prerendered ${p.path}  ${Math.round(out.length / 1024)} kB`)
}
rmSync(outDir, { recursive: true, force: true })
