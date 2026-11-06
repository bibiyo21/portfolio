import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { dur, ease } from '../../lib/animations'
import { cn } from '../../lib/cn'

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: 'md' | 'lg'
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const mobile = useMediaQuery('(max-width: 767px)')
  const returnFocus = useRef<HTMLElement | null>(null)

  // Remember what opened the dialog so focus can go back there on close.
  useLayoutEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement
  }, [open])

  const panelInitial = reduce
    ? { opacity: 0 }
    : mobile
      ? { y: '100%' }
      : { opacity: 0, y: 24, scale: 0.98 }
  const panelAnimate = reduce ? { opacity: 1 } : mobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }
  const panelExit = reduce ? { opacity: 0 } : mobile ? { y: '100%' } : { opacity: 0, y: 12, scale: 0.99 }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-burgundy-deep/60 backdrop-blur-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
              <Dialog.Content
                asChild
                forceMount
                onCloseAutoFocus={(e) => {
                  e.preventDefault()
                  returnFocus.current?.focus()
                }}
              >
                <motion.div
                  className={cn(
                    'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-ivory shadow-float md:max-h-[90dvh] md:rounded-[28px]',
                    size === 'md' ? 'md:max-w-[560px]' : 'md:max-w-[960px]',
                  )}
                  initial={panelInitial}
                  animate={panelAnimate}
                  exit={panelExit}
                  transition={{ duration: mobile ? 0.45 : dur.base, ease: ease.out }}
                >
                  <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden />
                  <div className="overflow-y-auto overscroll-contain p-6 md:p-10">
                    <Dialog.Close
                      aria-label="Close dialog"
                      className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-peach-soft text-burgundy-dark transition-colors hover:bg-peach md:right-6 md:top-6"
                    >
                      <X className="size-5" aria-hidden />
                    </Dialog.Close>
                    <Dialog.Title className="t-heading-m pr-12">{title}</Dialog.Title>
                    {description ? (
                      <Dialog.Description className="mt-3 max-w-prose text-ink-soft">{description}</Dialog.Description>
                    ) : (
                      <Dialog.Description className="sr-only">{title}</Dialog.Description>
                    )}
                    <div className="mt-8">{children}</div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}
