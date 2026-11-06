import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react'
import { cn } from '../../lib/cn'
import { Container } from '../layout/Container'
import type { SceneTone } from '../../lib/scenes'

const SceneRefContext = createContext<RefObject<HTMLElement | null> | null>(null)
export const useSceneRef = () => useContext(SceneRefContext)

const tones: Record<SceneTone, string> = {
  ivory: 'bg-ivory text-charcoal',
  soft: 'bg-peach-soft text-charcoal',
  peach: 'bg-peach text-burgundy-dark',
  dark: 'on-dark bg-burgundy-dark text-ivory',
  deep: 'on-dark bg-burgundy-deep text-ivory',
}

/**
 * A full-height presentation scene. min-height (never a fixed height) so tall content
 * grows the scene. The backdrop is decorative and sits behind the content.
 */
export function Scene({
  id,
  tone,
  titleId,
  backdrop,
  children,
  className,
  center = false,
}: {
  id: string
  tone: SceneTone
  /** id of the heading that labels the scene. Defaults to `${id}-title`. */
  titleId?: string
  backdrop?: ReactNode
  children: ReactNode
  className?: string
  center?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  return (
    <SceneRefContext.Provider value={ref}>
      <section
        ref={ref}
        id={id}
        data-scene={id}
        aria-labelledby={titleId ?? `${id}-title`}
        className={cn(
          'scene relative overflow-hidden',
          center && 'flex flex-col justify-center',
          tones[tone],
          className,
        )}
      >
        {backdrop ? (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {backdrop}
          </div>
        ) : null}
        <Container className="relative z-10 w-full">{children}</Container>
      </section>
    </SceneRefContext.Provider>
  )
}
