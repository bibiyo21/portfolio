import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { parseContent } from '../src/lib/content-parse.ts'
import { contentSchemas, type ContentName } from '../src/lib/content-schemas.ts'

const ID = 'virtual:content'
const RESOLVED = '\0' + ID

/**
 * Parses and validates every YAML content file at build time and serves the result as plain JSON.
 * The browser no longer ships the YAML parser or runs schema validation on load, and a content error
 * fails the build (or shows the dev overlay) with the file and field named.
 */
export function contentPlugin(): Plugin {
  const dir = resolve(import.meta.dirname, '../src/content')
  const names = Object.keys(contentSchemas) as ContentName[]
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
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(dir) || !file.endsWith('.yaml')) return
      const mod = server.moduleGraph.getModuleById(RESOLVED)
      if (mod) server.moduleGraph.invalidateModule(mod)
      server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
