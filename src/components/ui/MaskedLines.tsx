import { motion, useReducedMotion } from 'framer-motion'
import { dur, ease } from '../../lib/animations'

export function MaskedLines({
  lines,
  className,
  accentLast = false,
  delay = 0.1,
  as = 'h1',
  id,
  accentClass = 'text-burgundy',
}: {
  lines: string[]
  className?: string
  accentLast?: boolean
  delay?: number
  as?: 'h1' | 'h2'
  id?: string
  accentClass?: string
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag id={id} className={className}>
      {lines.map((line, i) => {
        const accent = accentLast && i === lines.length - 1
        return (
          <span key={line} className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className={accent ? `block ${accentClass}` : 'block'}
              initial={reduce ? { opacity: 0 } : { y: '110%' }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              transition={{
                duration: reduce ? 0.2 : dur.hero,
                ease: ease.out,
                delay: reduce ? 0 : delay + i * 0.09,
              }}
            >
              {line}
            </motion.span>
          </span>
        )
      })}
    </Tag>
  )
}
