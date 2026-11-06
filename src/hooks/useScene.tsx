import { useReducedMotion } from 'framer-motion'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { scenes, sceneIndex, type SceneDef } from '../lib/scenes'

interface SceneState {
  activeId: string
  active: SceneDef
  activeIndex: number
  /** Scroll to a scene using native hash navigation. */
  goTo: (id: string) => void
}

const SceneContext = createContext<SceneState | null>(null)

const LOCK_MS = 1200

/**
 * One active-scene state for every consumer (tabs, mobile label, drawer, progress, animations).
 * The scroll position is the source of truth. A click sets the target immediately, then a short
 * lock stops the observer from fighting the smooth scroll, and the observer resyncs afterwards.
 */
export function SceneProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const [activeId, setActiveId] = useState<string>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    return sceneIndex(hash) >= 0 ? hash : scenes[0]!.id
  })
  const lock = useRef<{ id: string; until: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  /** Active scene = the one crossing the middle of the viewport. */
  const recompute = useCallback(() => {
    const mid = window.innerHeight / 2
    let found: string | null = null
    for (const s of scenes) {
      const el = document.getElementById(s.id)
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (r.top <= mid && r.bottom > mid) {
        found = s.id
        break
      }
    }
    if (found) setActiveId(found)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (!hit) return
        const l = lock.current
        if (l && performance.now() < l.until) {
          if (hit.target.id === l.id) lock.current = null
          else return
        }
        setActiveId(hit.target.id)
      },
      { rootMargin: '-50% 0px -49.9% 0px', threshold: 0 },
    )
    scenes.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1)
      if (sceneIndex(id) >= 0) setActiveId(id)
    }
    const onScrollEnd = () => {
      lock.current = null
      recompute()
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onHash)
    window.addEventListener('scrollend', onScrollEnd)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onHash)
      window.removeEventListener('scrollend', onScrollEnd)
      window.clearTimeout(timer.current)
    }
  }, [recompute])

  const goTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      lock.current = { id, until: performance.now() + LOCK_MS }
      setActiveId(id)
      if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`)
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      // Resync once the lock expires, in case the observer never fired for the target.
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        lock.current = null
        recompute()
      }, LOCK_MS + 100)
    },
    [reduce, recompute],
  )

  const value = useMemo<SceneState>(() => {
    const idx = Math.max(0, sceneIndex(activeId))
    return { activeId, active: scenes[idx]!, activeIndex: idx, goTo }
  }, [activeId, goTo])

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}

export function useScene(): SceneState {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used inside SceneProvider')
  return ctx
}
