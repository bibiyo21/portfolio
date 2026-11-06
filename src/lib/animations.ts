import type { Transition, Variants } from 'framer-motion'

// Mirrors DESIGN.md section 10.
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  soft: [0.4, 0, 0.2, 1] as const,
}

export const dur = { fast: 0.18, base: 0.4, slow: 0.8, hero: 1.2 }
export const stagger = 0.07

export const transition = {
  reveal: { duration: dur.slow, ease: ease.out } satisfies Transition,
  base: { duration: dur.base, ease: ease.out } satisfies Transition,
  hover: { duration: dur.fast, ease: ease.soft } satisfies Transition,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: transition.reveal },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
}

export const staggerContainer = (delayChildren = 0, gap = stagger): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren } },
})

export const viewportOnce = { once: true, amount: 0.15 } as const
