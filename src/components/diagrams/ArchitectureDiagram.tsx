import { useScene } from '../../hooks/useScene'
import { motion, useReducedMotion } from 'framer-motion'
import { useId, type KeyboardEvent } from 'react'
import { faBriefcase, faListCheck, faMicrochip } from '@fortawesome/free-solid-svg-icons'
import { useAutoCycle } from '../../hooks/useAutoCycle'
import { FaIcon, layerIcon } from '../../lib/fa-icons'
import { AutoplayBar, AutoplayControl } from '../ui/Autoplay'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { philosophy } from '../../lib/content-loader'
import type { DiagramNode } from '../../lib/content-schemas'
import { ease } from '../../lib/animations'
import { Tag } from '../ui/Tag'

const H = { w: 168, h: 88, gap: 50, aiW: 220 }
const V = { w: 300, h: 76, gap: 34, vw: 340 }
const CYCLE_MS = 6500
/** Space at the left of each box for its icon. */
const ICON = { size: 20, pad: 16, text: 46 }

function wrap(text: string, max: number): string[] {
  const lines: string[] = []
  let cur = ''
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** Representative architecture. Nodes are buttons. Wide screens flow left to right, narrow screens top to bottom. */
const nodeIds = philosophy.diagram.nodes.map((n) => n.id)

export function ArchitectureDiagram() {
  const { goTo } = useScene()
  const nodes = philosophy.diagram.nodes
  const main = nodes.filter((n) => n.lane === 'main')
  const ai = nodes.find((n) => n.lane === 'ai')
  const horizontal = useMediaQuery('(min-width: 1024px)')
  const reduce = useReducedMotion()
  const panelId = useId()
  const tour = useAutoCycle(nodeIds)
  const activeId = tour.active
  const setActiveId = tour.select
  const active: DiagramNode | undefined = nodes.find((n) => n.id === activeId) ?? main[0]
  // AI connects to the application services / tools layer (the third main node, or the middle one).
  const toolsNode = main[Math.min(2, main.length - 1)]

  const boxes = new Map<string, Box>()
  let width: number
  let height: number
  if (horizontal) {
    main.forEach((n, i) => boxes.set(n.id, { x: i * (H.w + H.gap), y: 10, w: H.w, h: H.h }))
    width = main.length * H.w + (main.length - 1) * H.gap
    height = ai ? 10 + H.h + 100 + H.h + 10 : 10 + H.h + 10
    if (ai && toolsNode) {
      const t = boxes.get(toolsNode.id)!
      boxes.set(ai.id, { x: t.x + t.w / 2 - H.aiW / 2, y: 10 + H.h + 100, w: H.aiW, h: H.h })
    }
  } else {
    main.forEach((n, i) => boxes.set(n.id, { x: 0, y: i * (V.h + V.gap), w: V.w, h: V.h }))
    width = V.vw
    const lastY = (main.length - 1) * (V.h + V.gap) + V.h
    height = ai ? lastY + V.gap + V.h : lastY
    if (ai) boxes.set(ai.id, { x: 0, y: lastY + V.gap, w: V.w, h: V.h })
  }

  const edgeStyle = (hot: boolean) => ({
    stroke: '#F5C6AD',
    strokeWidth: hot ? 3 : 1.75,
    strokeOpacity: hot ? 1 : 0.5,
    strokeDasharray: '7 7',
    fill: 'none',
    markerEnd: 'url(#arch-arrow)',
    style: reduce ? undefined : { animation: 'flow 1.2s linear infinite' },
  })

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveId(id)
    }
  }

  const mainEdges = main.slice(0, -1).map((n, i) => {
    const a = boxes.get(n.id)!
    const b = boxes.get(main[i + 1]!.id)!
    const d = horizontal
      ? `M ${a.x + a.w} ${a.y + a.h / 2} H ${b.x - 4}`
      : `M ${a.x + a.w / 2} ${a.y + a.h} V ${b.y - 4}`
    return { id: `${n.id}-${main[i + 1]!.id}`, d, hot: activeId === n.id || activeId === main[i + 1]!.id }
  })

  let aiEdges: Array<{ id: string; d: string; hot: boolean }> = []
  if (ai && toolsNode) {
    const t = boxes.get(toolsNode.id)!
    const a = boxes.get(ai.id)!
    const hot = activeId === ai.id || activeId === toolsNode.id
    aiEdges = horizontal
      ? [
          { id: 'tools-ai', d: `M ${t.x + t.w / 2 - 16} ${t.y + t.h} V ${a.y - 4}`, hot },
          { id: 'ai-tools', d: `M ${t.x + t.w / 2 + 16} ${a.y} V ${t.y + t.h + 4}`, hot },
        ]
      : [
          { id: 'tools-ai', d: `M ${t.x + t.w} ${t.y + t.h / 2 + 10} H ${t.x + t.w + 26} V ${a.y + a.h / 2 + 10} H ${a.x + a.w + 4}`, hot },
          { id: 'ai-tools', d: `M ${a.x + a.w} ${a.y + a.h / 2 - 10} H ${a.x + a.w + 14} V ${t.y + t.h / 2 - 10} H ${t.x + t.w + 4}`, hot },
        ]
  }

  return (
    <div {...tour.containerProps}>
      <AutoplayControl
        dark
        className="mb-6"
        enabled={tour.enabled}
        onToggle={tour.toggle}
        reduce={tour.reduce}
        nudge={tour.inView}
        hint={tour.enabled ? 'Touring each layer. Select one to explore it yourself.' : 'Select a layer to see its details.'}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={horizontal ? 'h-auto w-full' : 'mx-auto h-auto w-full max-w-[340px]'}
        role="group"
        aria-label="Representative architecture diagram. Select a layer to see its details."
      >
        <defs>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 1 1 L 9 5 L 1 9 z" fill="#F5C6AD" />
          </marker>
        </defs>
        {[...mainEdges, ...aiEdges].map((e) => (
          <path key={e.id} d={e.d} {...edgeStyle(e.hot)} />
        ))}
        {nodes.map((n, i) => {
          const b = boxes.get(n.id)
          if (!b) return null
          const selected = n.id === active?.id
          const lines = wrap(n.label, horizontal ? 12 : 24)
          return (
            <motion.g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-controls={panelId}
              aria-label={`${n.label}. ${n.purpose}`}
              onClick={() => setActiveId(n.id)}
              onKeyDown={(e) => onKey(e, n.id)}
              style={{ cursor: 'pointer', outline: 'none' }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: ease.out, delay: i * 0.08 }}
              className="[&:focus-visible>rect:first-child]:stroke-[#F5C6AD] [&:focus-visible>rect:first-child]:stroke-[3px]"
            >
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={20}
                fill={selected ? '#F5C6AD' : n.lane === 'ai' ? '#3D1426' : '#581C35'}
                stroke={n.lane === 'ai' && !selected ? '#F5C6AD' : '#FFF8F2'}
                strokeDasharray={n.lane === 'ai' && !selected ? '6 5' : undefined}
                strokeOpacity={selected ? 0.9 : n.lane === 'ai' ? 0.6 : 0.18}
              />
              <FaIcon
                icon={layerIcon(n.id)}
                x={b.x + ICON.pad}
                y={b.y + b.h / 2 - ICON.size / 2}
                width={ICON.size}
                height={ICON.size}
                color={selected ? '#581C35' : '#F5C6AD'}
              />
              {lines.map((line, li) => (
                <text
                  key={line}
                  x={b.x + ICON.text}
                  y={b.y + b.h / 2 - ((lines.length - 1) * 19) / 2 + li * 19 + 5}
                  fontSize={horizontal ? 16 : 17}
                  fill={selected ? '#3D1426' : '#FFF8F2'}
                  fontFamily="Space Grotesk, system-ui, sans-serif"
                >
                  {line}
                </text>
              ))}
              {n.lane === 'ai' ? (
                <text x={b.x + b.w - 14} y={b.y + 20} textAnchor="end" fontSize={10} letterSpacing="0.1em" fill={selected ? '#581C35' : '#F5C6AD'} fontFamily="JetBrains Mono, ui-monospace, monospace">
                  OPTIONAL
                </text>
              ) : null}
            </motion.g>
          )
        })}
      </svg>

      <ol className="sr-only">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.label}: {n.purpose}
          </li>
        ))}
      </ol>

      {active ? (
        <div
          id={panelId}
          // The tour changes this panel every few seconds, so only the visitor's own choices are announced.
          aria-live={tour.enabled ? 'off' : 'polite'}
          data-testid="architecture-detail"
          className="relative mt-8 overflow-hidden rounded-[20px] border border-ivory/12 bg-ivory/[0.04] p-6 md:p-8"
        >
          {tour.enabled ? (
            <AutoplayBar
              cycleKey={active.id}
              ms={CYCLE_MS}
              running={tour.running}
              onEnd={tour.onCycleEnd}
              className="inset-x-0 top-0 h-[3px] bg-peach"
            />
          ) : null}
          <p className="t-eyebrow inline-flex items-center gap-2 text-peach">
            <FaIcon icon={layerIcon(active.id)} className="size-4" />{active.lane === 'ai' ? 'Optional AI and automation lane' : 'Layer'}</p>
          <h3 className="t-heading-m mt-2 text-ivory">{active.label}</h3>
          <p className="mt-3 max-w-[62ch] text-on-dark-soft">{active.purpose}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {active.responsibilities.length > 0 ? (
              <div>
                <h4 className="t-eyebrow mb-3 inline-flex items-center gap-2 text-peach">
                  <FaIcon icon={faListCheck} className="size-3.5" />
                  Typical responsibilities
                </h4>
                <ul className="list-disc space-y-1.5 pl-5 text-on-dark-soft marker:text-peach">
                  {active.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {active.technologies.length > 0 ? (
              <div>
                <h4 className="t-eyebrow mb-3 inline-flex items-center gap-2 text-peach">
                  <FaIcon icon={faMicrochip} className="size-3.5" />
                  Technologies I work with here
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {active.technologies.map((t) => (
                    <li key={t}>
                      <Tag variant="dark">{t}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {active.examples.length > 0 ? (
              <div className="md:col-span-2">
                <h4 className="t-eyebrow mb-3 inline-flex items-center gap-2 text-peach">
                  <FaIcon icon={faBriefcase} className="size-3.5" />
                  Where I have worked at this layer
                </h4>
                <ul className="list-disc space-y-1.5 pl-5 text-on-dark-soft marker:text-peach">
                  {active.examples.map((x) =>
                    typeof x === 'string' ? (
                      <li key={x}>{x}</li>
                    ) : (
                      <li key={x.text}>
                        <a
                          href={x.href}
                          onClick={(e) => {
                            e.preventDefault()
                            goTo(x.href.slice(1))
                          }}
                          className="underline decoration-peach/40 underline-offset-4 transition-colors hover:text-ivory hover:decoration-peach"
                        >
                          {x.text}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <p className="mt-4 text-sm text-on-dark-mute">{philosophy.representativeNote}</p>
    </div>
  )
}
