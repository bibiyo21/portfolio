import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { ease } from '../../lib/animations'

/**
 * Clip-path unveil. The observed wrapper is never clipped (a fully clipped element reports no
 * intersection), and the content is fully visible without animation when motion is reduced.
 */
export function ImageReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const reduce = useReducedMotion()
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={false}
        animate={
          reduce
            ? { opacity: 1, clipPath: 'inset(0 0 0% 0)' }
            : inView
              ? { opacity: 1, clipPath: 'inset(0 0 0% 0)' }
              : { opacity: 1, clipPath: 'inset(0 0 100% 0)' }
        }
        transition={{ duration: reduce ? 0 : 1, ease: ease.out }}
      >
        {children}
      </motion.div>
    </div>
  )
}
