import { cn } from '../../lib/cn'
import { FaIcon, skillNameIcon } from '../../lib/fa-icons'

export function SkillTag({ name, interest }: { name: string; interest: boolean }) {
  return (
    <li
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] font-medium transition-transform duration-200 motion-safe:hover:-translate-y-0.5',
        interest ? 'border border-dashed border-line-strong text-ink-mute' : 'bg-peach-soft text-burgundy-dark',
      )}
    >
      <FaIcon icon={skillNameIcon(name)} className={cn('size-3.5 shrink-0', interest ? 'text-ink-mute' : 'text-burgundy')} />
      {name}
      {interest ? <span className="sr-only"> (area of interest)</span> : null}
    </li>
  )
}
