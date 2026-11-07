// Renders the app to static HTML after `vite build` and places it inside #root in dist/index.html.
// Run by `npm run build`. Fails loudly if the marker is missing or the render is empty.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = resolve(import.meta.dirname, '..')
const outDir = resolve(root, 'dist-ssr')

await build({ root, logLevel: 'warn', build: { ssr: 'src/entry-server.tsx', outDir, emptyOutDir: true } })
const { render } = (await import(pathToFileURL(resolve(outDir, 'entry-server.js')).href)) as { render: () => string }
const html = render()
if (html.length < 1000) throw new Error('Prerender produced almost no HTML')

const file = resolve(root, 'dist/index.html')
const page = readFileSync(file, 'utf8')
const marker = '<div id="root"></div>'
if (!page.includes(marker)) throw new Error('dist/index.html has no empty #root to fill')
writeFileSync(file, page.replace(marker, `<div id="root">${html}</div>`))
rmSync(outDir, { recursive: true, force: true })
console.log(`prerendered ${Math.round(html.length / 1024)} kB of HTML into dist/index.html`)
