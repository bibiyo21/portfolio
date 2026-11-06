import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { ease } from '../../lib/animations'
import { cn } from '../../lib/cn'

export interface AccordionItem {
  id: string
  title: ReactNode
  /** Plain text used for accessible names when `title` is not a string. */
  label?: string
  content: ReactNode
}

/**
 * Accessible accordion. Single-open by default; pass `multiple` to allow several open rows.
 * Each header is a real button with aria-expanded and aria-controls, wrapped in a heading.
 */
export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  headingLevel = 3,
  tone = 'light',
  className,
}: {
  items: AccordionItem[]
  multiple?: boolean
  defaultOpen?: string[]
  headingLevel?: 3 | 4
  tone?: 'light' | 'dark' | 'peach'
  className?: string
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen)
  const reduce = useReducedMotion()
  const base = useId()
  const Heading = `h${headingLevel}` as 'h3' | 'h4'

  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : multiple ? [...cur, id] : [id]))

  const rowHover =
    tone === 'dark' ? 'hover:bg-ivory/[0.06]' : tone === 'peach' ? 'hover:bg-ivory/40' : 'hover:bg-peach-soft'
  const line = tone === 'dark' ? 'border-ivory/15' : tone === 'peach' ? 'border-burgundy/20' : 'border-line-strong'
  const mute = tone === 'dark' ? 'text-on-dark-soft' : tone === 'peach' ? 'text-burgundy-dark/80' : 'text-ink-soft'

  return (
    <div className={cn('border-t', line, className)}>
      {items.map((item, i) => {
        const isOpen = open.includes(item.id)
        const buttonId = `${base}-btn-${i}`
        const panelId = `${base}-panel-${i}`
        return (
          <div key={item.id} className={cn('border-b', line)}>
            <Heading>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  'group flex min-h-16 w-full items-center justify-between gap-6 px-2 py-4 text-left transition-colors duration-200 md:min-h-[72px] md:px-4',
                  rowHover,
                )}
              >
                <span className="t-heading-s">{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full border transition-colors',
                    tone === 'dark' ? 'border-ivory/30' : 'border-burgundy/30',
                    isOpen && (tone === 'dark' ? 'bg-peach text-burgundy-dark' : 'bg-burgundy text-ivory'),
                  )}
                >
                  {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </span>
              </button>
            </Heading>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0.15 : 0.45, ease: ease.out }}
                  className="overflow-hidden"
                >
                  <div className={cn('max-w-[68ch] px-2 pb-6 md:px-4', mute)}>{item.content}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
