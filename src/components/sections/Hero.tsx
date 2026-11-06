import { MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button, ButtonLink } from '../ui/Button'
import { Img } from '../ui/Img'
import { LogoMark } from '../ui/Logo'
import { MaskedLines } from '../ui/MaskedLines'
import { HeroGeometry } from '../scenes/HeroGeometry'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { useContactModal } from '../../hooks/useContactModal'
import { useScene } from '../../hooks/useScene'
import { profile } from '../../lib/content-loader'
import { ease } from '../../lib/animations'

export function Hero() {
  const { openModal } = useContactModal()
  const { goTo } = useScene()
  const reduce = useReducedMotion()
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: ease.out, delay },
  })
  return (
    <Scene
      id="home"
      tone="dark"
      titleId="hero-title"
      center
      backdrop={<SceneBackdrop tone="dark" />}
    >
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7 xl:col-span-8">
          <motion.div {...fade(0)} className="mb-5 sm:mb-6">
            <LogoMark variant="dark" size={48} />
          </motion.div>
          <motion.p
            {...fade(0.05)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-ivory/20 px-4 py-2 text-sm text-on-dark-soft sm:mb-6"
          >
            <MapPin className="size-4 text-peach" aria-hidden />
            {profile.location}
            {profile.availability ? (
              <>
                <span aria-hidden className="mx-1 text-ivory/30">
                  |
                </span>
                <span data-testid="availability">{profile.availability}</span>
              </>
            ) : null}
          </motion.p>

          <MaskedLines
            lines={profile.headline}
            accentLast
            accentClass="text-peach"
            className="t-display-xl"
            id="hero-title"
          />

          <motion.p
            {...fade(0.7)}
            className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-peach sm:mt-6"
          >
            {profile.supportingLine}
          </motion.p>
          <motion.p {...fade(0.8)} className="t-lede mt-4 max-w-xl text-on-dark-soft sm:mt-6">
            {profile.intro}
          </motion.p>
          <motion.div {...fade(0.95)} className="mt-7 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
            <ButtonLink
              variant="onDark"
              href="#work"
              arrow
              onClick={(e) => {
                e.preventDefault()
                goTo('work')
              }}
            >
              Explore My Work
            </ButtonLink>
            <Button variant="onDarkOutline" onClick={openModal} aria-haspopup="dialog">
              Let&apos;s Connect
            </Button>
          </motion.div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          {profile.portrait ? (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[28px] bg-burgundy lg:max-w-none">
              <Img
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                width={profile.portrait.width}
                height={profile.portrait.height}
                priority
                className="size-full object-cover"
              />
            </div>
          ) : (
            <HeroGeometry />
          )}
        </div>
      </div>
    </Scene>
  )
}
