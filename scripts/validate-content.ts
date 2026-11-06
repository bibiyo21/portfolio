import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseContent } from '../src/lib/content-parse'
import { contentSchemas, type ContentName } from '../src/lib/content-schemas'

let failed = false
for (const name of Object.keys(contentSchemas) as ContentName[]) {
  const file = join('src', 'content', `${name}.yaml`)
  try {
    parseContent(name, readFileSync(file, 'utf8'))
    console.log(`ok  ${file}`)
  } catch (err) {
    failed = true
    console.error(err instanceof Error ? err.message : String(err))
  }
}
if (failed) process.exit(1)
