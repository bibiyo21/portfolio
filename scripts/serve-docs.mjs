// Tiny dependency-free static server for a folder under docs/. Binds to localhost only.
// Usage: node scripts/serve-docs.mjs [folder=gti-site-previews] [port=4175]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const folder = process.argv[2] ?? 'gti-site-previews'
const root = join(process.cwd(), 'docs', folder)
const port = Number(process.argv[3] ?? process.env.PORT ?? 4175)
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }

createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
    if (path === '/' || path === '') path = '/index.html'
    const file = join(root, path)
    if (!file.startsWith(root)) throw new Error('outside root')
    if (!(await stat(file)).isFile()) throw new Error('not a file')
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(await readFile(file))
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
}).listen(port, '127.0.0.1', () => console.log(`${folder}: http://localhost:${port}/`))
