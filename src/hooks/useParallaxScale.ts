import { useReducedMotion } from 'framer-motion'
import { useMediaQuery } from './useMediaQuery'

/** 0 on mobile and with reduced motion, half on tablet, full on desktop. */
export function useParallaxScale(): number {
  const reduce = useReducedMotion()
  const tablet = useMediaQuery('(min-width: 768px)')
  const desktop = useMediaQuery('(min-width: 1024px)')
  if (reduce || !tablet) return 0
  return desktop ? 1 : 0.5
}
