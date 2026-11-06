import { cn } from '../../lib/cn'

export function SkillTag({ name, interest }: { name: string; interest: boolean }) {
  return (
    <li
      className={cn(
        'rounded-full px-3 py-1 text-[0.8125rem] font-medium',
        interest ? 'border border-dashed border-line-strong text-ink-mute' : 'bg-peach-soft text-burgundy-dark',
      )}
    >
      {name}
      {interest ? <span className="sr-only"> (area of interest)</span> : null}
    </li>
  )
}
