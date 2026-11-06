import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { ParallaxLayer } from './ParallaxLayer'
import { useScene } from '../../hooks/useScene'
import { philosophy } from '../../lib/content-loader'
import { ease } from '../../lib/animations'

// Hero visual: the same representative layers the Architecture scene explains, so the first screen
// previews real content instead of placeholder shapes. Offsets alternate to keep the stack lively.
const offsets = ['0%', '10%', '3%', '13%', '6%']

export function HeroSystem() {
  const reduce = useReducedMotion()
  const { goTo } = useScene()
  const layers = philosophy.diagram.nodes.filter((n) => n.lane === 'main')
  const ai = philosophy.diagram.nodes.find((n) => n.lane === 'ai')

  return (
    <figure className="relative mx-auto w-full max-w-[30rem]" data-testid="hero-system">
      <figcaption className="t-eyebrow mb-4 flex items-center gap-3 text-peach/80">
        <span aria-hidden className="h-px w-8 bg-peach/50" />
        Representative system layers
      </figcaption>
      <ol className="relative space-y-3">
        {layers.map((l, i) => (
          <li key={l.id} style={{ marginLeft: offsets[i % offsets.length] }} className="relative w-[87%]">
            <ParallaxLayer depth={10 + i * 8}>
              <motion.div
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.45 + i * 0.09, ease: ease.out }}
                className="rounded-2xl border border-peach/25 bg-gradient-to-br from-burgundy/90 to-burgundy-dark/90 px-4 py-3 shadow-float backdrop-blur-sm"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[0.7rem] tracking-[0.12em] text-peach/70">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-[0.98rem] font-medium leading-tight text-ivory">{l.label}</span>
                </div>
                <p className="mt-1.5 truncate pl-7 font-mono text-[0.68rem] tracking-[0.04em] text-on-dark-mute">
                  {l.technologies.slice(0, 3).join(' · ')}
                </p>
              </motion.div>
            </ParallaxLayer>
          </li>
        ))}
      </ol>
      {ai ? (
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-3 w-fit rounded-2xl border border-dashed border-peach/35 px-4 py-2 font-mono text-[0.68rem] tracking-[0.08em] text-peach/80"
        >
          + {ai.label} (optional)
        </motion.p>
      ) : null}
      <a
        href="#architecture"
        onClick={(e) => {
          e.preventDefault()
          goTo('architecture')
        }}
        className="group mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-peach underline-offset-4 hover:underline"
      >
        How these layers fit together
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </a>
    </figure>
  )
}
