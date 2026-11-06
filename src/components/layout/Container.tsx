import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

// Extra side padding from lg up keeps content clear of the fixed scene controls on the right.
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1320px] px-[var(--gutter)] lg:px-[max(var(--gutter),4.5rem)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
