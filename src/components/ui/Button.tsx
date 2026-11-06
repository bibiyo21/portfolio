import { ArrowRight, Loader2 } from 'lucide-react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'onDark' | 'onDarkOutline'

const variants: Record<Variant, string> = {
  primary: 'bg-burgundy text-ivory hover:bg-burgundy-hover active:bg-burgundy-dark',
  secondary:
    'border border-line-strong text-charcoal hover:bg-peach-soft hover:border-charcoal active:bg-peach',
  onDark: 'bg-peach text-burgundy-dark hover:bg-peach-soft active:bg-peach',
  onDarkOutline: 'border border-ivory/35 text-ivory hover:bg-ivory/10 hover:border-ivory',
}

const base =
  'group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.9375rem] font-medium leading-none transition-colors duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-45'

interface Common {
  variant?: Variant
  arrow?: boolean
  loading?: boolean
  children: ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  arrow = false,
  loading = false,
  children,
  className,
  disabled,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span>{children}</span>
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : arrow ? (
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      ) : null}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  arrow = false,
  children,
  className,
  ...rest
}: Omit<Common, 'loading'> & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(base, variants[variant], className)} {...rest}>
      <span>{children}</span>
      {arrow ? (
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      ) : null}
    </a>
  )
}
