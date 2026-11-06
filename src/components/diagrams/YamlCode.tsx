import type { ReactNode } from 'react'

const scalar = (value: string): ReactNode => {
  const v = value.trim()
  if (v === '') return value
  const lead = value.slice(0, value.length - value.trimStart().length)
  if (/^(true|false|null|~)$/.test(v) || /^-?\d+(\.\d+)?$/.test(v))
    return (
      <>
        {lead}
        <span className="text-peach-soft">{v}</span>
      </>
    )
  if (/^["'].*["']$/.test(v) || /^\$\{\{.*\}\}$/.test(v))
    return (
      <>
        {lead}
        <span className="text-peach">{v}</span>
      </>
    )
  return (
    <>
      {lead}
      <span className="text-ivory">{v}</span>
    </>
  )
}

function renderLine(line: string): ReactNode {
  const comment = /^(\s*)(#.*)$/.exec(line)
  if (comment) {
    return (
      <>
        {comment[1]}
        <span className="text-on-dark-mute">{comment[2]}</span>
      </>
    )
  }
  const kv = /^(\s*(?:-\s+)?)([A-Za-z0-9_.\-/"' ${}]+?)(:)(\s.*|)$/.exec(line)
  if (kv) {
    const [, indent = '', key = '', colon = '', rest = ''] = kv
    const hash = rest.indexOf(' #')
    const value = hash >= 0 ? rest.slice(0, hash) : rest
    const tail = hash >= 0 ? rest.slice(hash) : ''
    return (
      <>
        {indent.includes('-') ? (
          <>
            {indent.replace('-', '')}
            <span className="text-on-dark-mute">-</span>
            {indent.slice(indent.indexOf('-') + 1)}
          </>
        ) : (
          indent
        )}
        <span className="text-peach">{key}</span>
        <span className="text-on-dark-mute">{colon}</span>
        {scalar(value)}
        {tail ? <span className="text-on-dark-mute">{tail}</span> : null}
      </>
    )
  }
  const item = /^(\s*)(-\s+)(.*)$/.exec(line)
  if (item) {
    return (
      <>
        {item[1]}
        <span className="text-on-dark-mute">{item[2]}</span>
        {scalar(item[3] ?? '')}
      </>
    )
  }
  return <span className="text-ivory">{line}</span>
}

/** Dependency-free YAML highlighter for display only. Keyboard focusable so long files can scroll. */
export function YamlCode({ code, label }: { code: string; label: string }) {
  const lines = code.replace(/\n$/, '').split('\n')
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="max-h-[28rem] overflow-auto rounded-[20px] border border-ivory/12 bg-burgundy-deep p-5 text-[0.8125rem] leading-6"
    >
      <pre className="m-0 font-mono">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block min-w-max">
              {renderLine(line) || ' '}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
