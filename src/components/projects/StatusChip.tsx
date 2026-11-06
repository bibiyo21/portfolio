import { CheckCircle2, CircleDashed, Clock3, Lightbulb } from 'lucide-react'
import type { ProjectStatus } from '../../lib/content-schemas'
import { cn } from '../../lib/cn'

export const statusMeta: Record<ProjectStatus, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  implemented: { label: 'Implemented', icon: CheckCircle2, cls: 'bg-burgundy text-ivory' },
  'in-progress': { label: 'In progress', icon: Clock3, cls: 'bg-peach text-burgundy-dark' },
  proposed: { label: 'Proposed / designed', icon: Lightbulb, cls: 'border border-current bg-transparent' },
  planned: { label: 'Planned', icon: CircleDashed, cls: 'border border-dashed border-current bg-transparent' },
}

/** Status is always icon plus text, never colour alone. */
export function StatusChip({ status, className }: { status: ProjectStatus; className?: string }) {
  const { label, icon: Icon, cls } = statusMeta[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.06em]',
        cls,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}
