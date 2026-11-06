import { motion, useReducedMotion } from 'framer-motion'
import { useId, useState, type KeyboardEvent } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { CicdPlatform } from '../../lib/content-schemas'
import { ease } from '../../lib/animations'
import { Tag } from '../ui/Tag'

const NODE_W = 150
const NODE_H = 92
const GAP_H = 40
const V_W = 340
const V_NODE_H = 58
const V_GAP = 18

function wrap(name: string, max: number): string[] {
  const words = name.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

export function PipelineDiagram({ platform, legend }: { platform: CicdPlatform; legend?: string }) {
  const stages = platform.stages
  const [activeId, setActiveId] = useState(stages[0]?.id ?? '')
  const horizontal = useMediaQuery('(min-width: 1024px)')
  const reduce = useReducedMotion()
  const panelId = useId()
  const active = stages.find((s) => s.id === activeId) ?? stages[0]
  if (!active) return null

  const n = stages.length
  const width = horizontal ? n * NODE_W + (n - 1) * GAP_H : V_W
  const height = horizontal ? NODE_H + 24 : n * V_NODE_H + (n - 1) * V_GAP
  const nodeW = horizontal ? NODE_W : V_W
  const nodeH = horizontal ? NODE_H : V_NODE_H
  const pos = (i: number) => (horizontal ? { x: i * (NODE_W + GAP_H), y: 12 } : { x: 0, y: i * (V_NODE_H + V_GAP) })

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveId(id)
    }
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={horizontal ? 'h-auto w-full' : 'mx-auto h-auto w-full max-w-[340px]'}
        role="group"
        aria-label={`${platform.name} pipeline with ${n} stages. Select a stage to see its details.`}
      >
        {stages.slice(0, -1).map((s, i) => {
          const a = pos(i)
          const b = pos(i + 1)
          const x1 = horizontal ? a.x + nodeW : a.x + nodeW / 2
          const y1 = horizontal ? a.y + nodeH / 2 : a.y + nodeH
          const x2 = horizontal ? b.x : b.x + nodeW / 2
          const y2 = horizontal ? b.y + nodeH / 2 : b.y
          return (
            <line
              key={`${s.id}-link`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#F5C6AD"
              strokeWidth={2}
              strokeDasharray="6 6"
              style={reduce ? undefined : { animation: 'flow 1.2s linear infinite' }}
            />
          )
        })}
        {stages.map((s, i) => {
          const { x, y } = pos(i)
          const selected = s.id === active.id
          const lines = wrap(s.name, horizontal ? 12 : 28)
          return (
            <motion.g
              key={s.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-controls={panelId}
              aria-label={`Stage ${i + 1} of ${n}: ${s.name}. Passing.`}
              onClick={() => setActiveId(s.id)}
              onKeyDown={(e) => onKey(e, s.id)}
              style={{ cursor: 'pointer', outline: 'none' }}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: ease.out, delay: i * 0.08 }}
              className="[&:focus-visible>rect:first-child]:stroke-[#F5C6AD] [&:focus-visible>rect:first-child]:stroke-[3px]"
            >
              <rect
                x={x}
                y={y}
                width={nodeW}
                height={nodeH}
                rx={20}
                fill={selected ? '#F5C6AD' : '#581C35'}
                stroke={selected ? '#FFF8F2' : '#FFF8F2'}
                strokeOpacity={selected ? 0.9 : 0.16}
              />
              <text
                x={x + 18}
                y={horizontal ? y + 26 : y + nodeH / 2 + 4}
                fontSize={11}
                letterSpacing="0.14em"
                fill={selected ? '#3D1426' : '#F5C6AD'}
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {String(i + 1).padStart(2, '0')}
              </text>
              {lines.map((line, li) => (
                <text
                  key={line}
                  x={horizontal ? x + 18 : x + 52}
                  y={horizontal ? y + 52 + li * 20 : y + nodeH / 2 + 6}
                  fontSize={17}
                  fill={selected ? '#3D1426' : '#FFF8F2'}
                  fontFamily="Space Grotesk, system-ui, sans-serif"
                >
                  {line}
                </text>
              ))}
              <g transform={`translate(${x + nodeW - 34}, ${horizontal ? y + 12 : y + nodeH / 2 - 11})`}>
                <circle cx={11} cy={11} r={11} fill={selected ? '#581C35' : '#F5C6AD'} />
                <motion.path
                  d="M6 11.5l3.2 3.2L16 7.8"
                  fill="none"
                  stroke={selected ? '#FFF8F2' : '#3D1426'}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                />
              </g>
            </motion.g>
          )
        })}
      </svg>
      {legend ? <p className="mt-3 text-sm text-on-dark-mute">{legend}</p> : null}

      <div
        id={panelId}
        aria-live="polite"
        className="mt-8 rounded-[20px] border border-ivory/12 bg-ivory/[0.04] p-6 md:p-8"
        data-testid="stage-detail"
      >
        <p className="t-eyebrow text-peach">
          Stage {stages.indexOf(active) + 1} of {n}
        </p>
        <h3 className="t-heading-m mt-2 text-ivory">{active.name}</h3>
        {active.description ? <p className="mt-3 max-w-[62ch] text-on-dark-soft">{active.description}</p> : null}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {active.tools.length > 0 ? (
            <div>
              <h4 className="t-eyebrow mb-3 text-peach">Tools</h4>
              <div className="flex flex-wrap gap-2">
                {active.tools.map((t) => (
                  <Tag key={t} variant="dark">
                    {t}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}
          {active.output ? (
            <div>
              <h4 className="t-eyebrow mb-3 text-peach">Expected output</h4>
              <p className="text-on-dark-soft">{active.output}</p>
            </div>
          ) : null}
          {active.commands.length > 0 ? (
            <div className="md:col-span-2">
              <h4 className="t-eyebrow mb-3 text-peach">Example commands</h4>
              <ul className="space-y-2">
                {active.commands.map((c) => (
                  <li key={c}>
                    <code className="block overflow-x-auto rounded-xl bg-burgundy-deep px-4 py-2.5 font-mono text-[0.8125rem] text-ivory">
                      <span aria-hidden className="select-none text-on-dark-mute">
                        ${' '}
                      </span>
                      {c}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
