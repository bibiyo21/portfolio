import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Steps through a set of tabs on its own so visitors see every panel, without fighting them:
 * - runs only while the section is on screen and the page is visible,
 * - pauses while the pointer is over it or focus is inside it,
 * - stops for good once the visitor picks a tab themselves (they can press play again),
 * - never starts for people who prefer reduced motion.
 * Timing comes from the CSS progress bar: `onCycleEnd` fires when its fill animation ends,
 * so pausing the animation pauses the timer too.
 */
export function useAutoCycle(ids: readonly string[], initial = ids[0] ?? '') {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(initial)
  const [playing, setPlaying] = useState(true)
  const [inView, setInView] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  const enabled = playing && !reduce
  const running = enabled && inView && pageVisible && !hovered && !focused

  /** A tab the visitor chose: show it and hand control to them. */
  const select = useCallback((id: string) => {
    setActive(id)
    setPlaying(false)
  }, [])

  const onCycleEnd = useCallback(() => {
    setActive((cur) => ids[(ids.indexOf(cur) + 1) % ids.length] ?? cur)
  }, [ids])

  const toggle = useCallback(() => setPlaying((p) => !p), [])

  const containerProps = {
    ref,
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === 'mouse' && setHovered(true),
    onPointerLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
    },
  }

  return { active, select, enabled, running, toggle, onCycleEnd, containerProps, inView, reduce: !!reduce }
}
