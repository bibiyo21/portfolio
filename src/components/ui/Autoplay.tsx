import { faHandPointer, faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { cn } from '../../lib/cn'
import { FaIcon } from '../../lib/fa-icons'

/** Fills while a tab is shown. Its animation end is the cue to move on, so pausing it pauses the cycle. */
export function AutoplayBar({
  cycleKey,
  ms,
  running,
  onEnd,
  className,
}: {
  cycleKey: string
  ms: number
  running: boolean
  onEnd: () => void
  className?: string
}) {
  return (
    <span
      key={cycleKey}
      aria-hidden
      data-testid="autoplay-bar"
      onAnimationEnd={onEnd}
      className={cn('pointer-events-none absolute origin-left', className)}
      style={{ animation: `autoplay-fill ${ms}ms linear forwards`, animationPlayState: running ? 'running' : 'paused' }}
    />
  )
}

/**
 * Tells visitors the tabs are interactive and lets them stop or restart the tour.
 * Reduced-motion visitors never get the tour, so they only see the hint.
 */
export function AutoplayControl({
  enabled,
  onToggle,
  hint,
  reduce,
  dark,
  nudge,
  className,
}: {
  enabled: boolean
  /** Bounce the pointer a few times, once the section is on screen. */
  nudge?: boolean
  onToggle: () => void
  hint: string
  reduce: boolean
  dark?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 text-sm', dark ? 'text-on-dark-soft' : 'text-ink-soft', className)}>
      {reduce ? null : (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-medium transition-colors',
            dark
              ? 'border-ivory/20 text-ivory hover:border-peach hover:text-peach'
              : 'border-line-strong text-burgundy hover:border-burgundy',
          )}
        >
          <FaIcon icon={enabled ? faPause : faPlay} className="size-3.5" />
          {enabled ? 'Pause tour' : 'Play tour'}
        </button>
      )}
      <span className="inline-flex items-center gap-2">
        <FaIcon icon={faHandPointer} className={cn('size-4', nudge && 'motion-safe:[animation:nudge_0.9s_ease-in-out_3]', dark ? 'text-peach' : 'text-burgundy')} />
        {hint}
      </span>
    </div>
  )
}
