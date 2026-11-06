import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScene } from '../../hooks/useScene'
import { isDarkTone, scenes } from '../../lib/scenes'
import { cn } from '../../lib/cn'

/** Desktop progress rail and previous/next. Both are real links to scene ids. */
export function SceneControls() {
  const { activeIndex, active, goTo } = useScene()
  const dark = isDarkTone(active.tone)
  const prev = scenes[activeIndex - 1]
  const next = scenes[activeIndex + 1]

  const link = (id: string) => ({
    href: `#${id}`,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      goTo(id)
    },
  })

  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
      <nav aria-label="Scene progress" className="pointer-events-auto">
        <ol className="flex flex-col items-center">
          {scenes.map((s, i) => {
            const isActive = i === activeIndex
            return (
              <li key={s.id}>
                <a
                  {...link(s.id)}
                  aria-label={`Scene ${i + 1} of ${scenes.length}: ${s.label}`}
                  aria-current={isActive ? 'location' : undefined}
                  className="group relative grid size-6 place-items-center"
                >
                  <span
                    className={cn(
                      'block rounded-full transition-all duration-300',
                      isActive
                        ? cn('size-3', dark ? 'bg-peach' : 'bg-burgundy')
                        : cn('size-1.5 group-hover:size-2.5', dark ? 'bg-ivory/45' : 'bg-burgundy/35'),
                    )}
                  />
                  <span
                    className={cn(
                      'pointer-events-none absolute right-8 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100',
                      dark ? 'bg-peach text-burgundy-dark' : 'bg-burgundy text-ivory',
                    )}
                  >
                    {s.label}
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      </nav>
      <div className="pointer-events-auto flex flex-col gap-1">
        {prev ? (
          <a
            {...link(prev.id)}
            aria-label={`Previous scene: ${prev.label}`}
            className={cn(
              'grid size-9 place-items-center rounded-full border transition-colors',
              dark ? 'border-ivory/30 text-ivory hover:bg-ivory/10' : 'border-burgundy/25 text-burgundy hover:bg-burgundy/10',
            )}
          >
            <ChevronUp className="size-4" aria-hidden />
          </a>
        ) : (
          <span className="size-9" aria-hidden />
        )}
        {next ? (
          <a
            {...link(next.id)}
            aria-label={`Next scene: ${next.label}`}
            className={cn(
              'grid size-9 place-items-center rounded-full border transition-colors',
              dark ? 'border-ivory/30 text-ivory hover:bg-ivory/10' : 'border-burgundy/25 text-burgundy hover:bg-burgundy/10',
            )}
          >
            <ChevronDown className="size-4" aria-hidden />
          </a>
        ) : (
          <span className="size-9" aria-hidden />
        )}
      </div>
    </div>
  )
}

/** Compact progress bar shown under the mobile and tablet header. */
export function MobileProgress() {
  const { activeIndex, active } = useScene()
  const dark = isDarkTone(active.tone)
  return (
    <div
      role="progressbar"
      aria-label="Scene progress"
      aria-valuemin={1}
      aria-valuemax={scenes.length}
      aria-valuenow={activeIndex + 1}
      aria-valuetext={`Scene ${activeIndex + 1} of ${scenes.length}: ${active.label}`}
      className={cn('h-0.5 w-full min-[1080px]:hidden', dark ? 'bg-ivory/15' : 'bg-burgundy/10')}
    >
      <motion.div
        className={cn('h-full origin-left', dark ? 'bg-peach' : 'bg-burgundy')}
        animate={{ scaleX: (activeIndex + 1) / scenes.length }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
