import { load } from 'js-yaml'
import { contentSchemas, formatZodError, type ContentName } from './content-schemas.ts'

type Output<N extends ContentName> = ReturnType<(typeof contentSchemas)[N]['parse']>

/** Parse and validate one YAML content file. Throws an Error with a readable message. */
export function parseContent<N extends ContentName>(name: N, raw: string): Output<N> {
  let data: unknown
  try {
    data = load(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`YAML syntax error in src/content/${name}.yaml\n${msg}`)
  }
  const result = contentSchemas[name].safeParse(data)
  if (!result.success) throw new Error(formatZodError(name, result.error))
  return result.data as Output<N>
}
