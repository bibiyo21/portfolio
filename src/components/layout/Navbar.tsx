import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { useScene } from '../../hooks/useScene'
import { profile } from '../../lib/content-loader'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/animations'
import { isDarkTone, scenes, tabs } from '../../lib/scenes'
import { Logo, LogoMark } from '../ui/Logo'
import { MobileProgress } from '../scenes/SceneControls'
import { Container } from './Container'

/**
 * Desktop (1080px and up): sticky tab bar with a gliding active pill.
 * Below that: compact header with the live scene label and a right-aligned burger that opens
 * a full-height drawer from the right. Both read the same active-scene state.
 */
export function Navbar() {
  const { active, activeId, goTo } = useScene()
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const dark = isDarkTone(active.tone)
  // At the very top the header floats over the hero with no surface of its own; it gains one on scroll.
  const [atTop, setAtTop] = useState(true)
  useEffect(() => {
    const update = () => setAtTop(window.scrollY < 12)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  const floating = atTop && activeId === 'home'

  const nav = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    goTo(id)
  }

  const closeThenGo = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // Let the scroll lock release first, then use the same navigation as the tabs.
    window.setTimeout(() => goTo(id), 120)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,color,backdrop-filter] duration-300',
        floating
          ? 'border-transparent bg-transparent text-ivory'
          : dark
            ? 'border-ivory/10 bg-burgundy-dark/80 text-ivory backdrop-blur-[14px]'
            : 'border-line bg-ivory/88 text-charcoal backdrop-blur-[14px]',
      )}
    >
      <Container className="flex h-[var(--nav-h)] items-center justify-between gap-4">
        <a
          href="#home"
          onClick={nav('home')}
          className="inline-flex min-h-11 shrink-0 items-center"
          aria-label={`${profile.wordmark}, back to the start`}
        >
          {/* The wide logo needs room the eleven tabs take below 1366px, so the compact mark stands in there. */}
          <Logo variant={dark ? 'dark' : 'light'} height={46} alt="" className="hidden min-[1366px]:block" />
          <LogoMark variant={dark ? 'dark' : 'light'} size={40} className="min-[1366px]:hidden" />
        </a>

        {/* Desktop tabs */}
        <nav aria-label="Primary" className="hidden min-[1080px]:block">
          <ul className="flex items-center gap-0.5 min-[1280px]:gap-1">
            {tabs.map((t) => {
              const isActive = active.tab === t.id
              return (
                <li key={t.id}>
                  <a
                    href={`#${t.target}`}
                    onClick={nav(t.target)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'relative inline-flex min-h-11 items-center rounded-full px-2.5 font-display text-sm transition-colors duration-200 active:translate-y-px min-[1280px]:px-3 min-[1280px]:text-[0.9375rem]',
                      isActive
                        ? dark
                          ? 'font-medium text-burgundy-dark'
                          : 'font-medium text-ivory'
                        : dark
                          ? 'text-on-dark-soft hover:text-ivory'
                          : 'text-ink-soft hover:text-charcoal',
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="tab-pill"
                        aria-hidden
                        className={cn('absolute inset-0 rounded-full', dark ? 'bg-peach' : 'bg-burgundy')}
                        transition={{ duration: reduce ? 0 : 0.35, ease: ease.out }}
                      />
                    ) : null}
                    <span className="relative">{t.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Compact header: live label immediately left of the burger on the right edge */}
        <div className="flex min-w-0 items-center gap-2 min-[1080px]:hidden">
          <p
            className={cn(
              'min-w-0 max-w-[9rem] truncate text-sm font-medium sm:max-w-[16rem]',
              dark ? 'text-peach' : 'text-burgundy',
            )}
            aria-live="polite"
            data-testid="active-label"
          >
            <span className="sr-only">Current section: </span>
            {active.label}
          </p>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-controls="mobile-drawer"
                aria-expanded={open}
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-full border transition-colors',
                  dark ? 'border-ivory/30 hover:bg-ivory/10' : 'border-line-strong hover:bg-peach-soft',
                )}
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </Dialog.Trigger>
            <AnimatePresence>
              {open ? (
                <Dialog.Portal forceMount>
                  <Dialog.Overlay asChild forceMount>
                    <motion.div
                      className="fixed inset-0 z-50 bg-burgundy-deep/55 backdrop-blur-[2px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0.15 : 0.35 }}
                    />
                  </Dialog.Overlay>
                  <Dialog.Content asChild forceMount>
                    <motion.div
                      id="mobile-drawer"
                      className="on-dark fixed bottom-0 right-0 top-0 z-50 flex h-screen h-dvh w-[clamp(260px,70vw,420px)] max-w-full flex-col bg-burgundy-dark text-ivory shadow-float"
                      style={{
                        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
                        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                        paddingRight: 'max(1rem, env(safe-area-inset-right))',
                      }}
                      initial={reduce ? { opacity: 0 } : { x: '100%' }}
                      animate={reduce ? { opacity: 1 } : { x: 0 }}
                      exit={reduce ? { opacity: 0 } : { x: '100%' }}
                      transition={{ duration: reduce ? 0.15 : 0.45, ease: ease.out }}
                    >
                      <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
                      <Dialog.Description className="sr-only">Jump to a section of the portfolio.</Dialog.Description>
                      <div className="flex min-h-11 items-center justify-between pl-5">
                        <Logo variant="dark" height={44} alt="" />
                        <Dialog.Close
                          aria-label="Close navigation menu"
                          className="grid size-11 shrink-0 place-items-center rounded-full border border-ivory/30 hover:bg-ivory/10"
                        >
                          <X className="size-5" aria-hidden />
                        </Dialog.Close>
                      </div>
                      <p className="t-eyebrow pl-5 pt-3 text-peach">
                        Now <span className="sr-only">viewing</span>: {active.label}
                      </p>
                      <nav aria-label="Mobile" className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pl-3">
                        <ol className="space-y-1">
                          {scenes.map((s, i) => {
                            const isActive = s.id === activeId
                            return (
                              <li key={s.id}>
                                <a
                                  href={`#${s.id}`}
                                  onClick={closeThenGo(s.id)}
                                  aria-current={isActive ? 'location' : undefined}
                                  className={cn(
                                    'flex min-h-[52px] items-center gap-3 rounded-2xl px-3 text-lg transition-colors',
                                    isActive ? 'bg-peach font-medium text-burgundy-dark' : 'text-ivory hover:bg-ivory/10',
                                  )}
                                >
                                  <span className={cn('tabular-nums text-xs', isActive ? 'text-burgundy' : 'text-on-dark-mute')}>
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  <span className="font-display">{s.label}</span>
                                  {isActive ? <span className="ml-auto text-xs uppercase tracking-[0.12em]">Current</span> : null}
                                </a>
                              </li>
                            )
                          })}
                        </ol>
                        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-t border-ivory/12 px-3 pt-4 text-sm text-on-dark-soft">
                          <li>
                            <a className="inline-flex min-h-11 items-center hover:text-peach" href={`mailto:${profile.email}`}>
                              Email
                            </a>
                          </li>
                          <li>
                            <a className="inline-flex min-h-11 items-center hover:text-peach" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          </li>
                          <li>
                            <a className="inline-flex min-h-11 items-center hover:text-peach" href={profile.links.github} target="_blank" rel="noopener noreferrer">
                              GitHub<span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          </li>
                          <li>
                            <a className="inline-flex min-h-11 items-center hover:text-peach" href={profile.links.whatsapp} target="_blank" rel="noopener noreferrer">
                              WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          </li>
                        </ul>
                      </nav>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              ) : null}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </Container>
      <MobileProgress />
    </header>
  )
}
