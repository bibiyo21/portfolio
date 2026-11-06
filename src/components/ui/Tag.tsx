import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Tag({
  children,
  variant = 'soft',
  className,
}: {
  children: ReactNode
  variant?: 'soft' | 'outline' | 'dark'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.08em]',
        variant === 'soft' && 'bg-peach-soft text-burgundy-dark',
        variant === 'outline' && 'border border-line-strong text-ink-soft',
        variant === 'dark' && 'bg-ivory/10 text-peach',
        className,
      )}
    >
      {children}
    </span>
  )
}
