import { MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Button, ButtonLink } from '../ui/Button'
import { MaskedLines } from '../ui/MaskedLines'
import { CubeField } from '../scenes/CubeField'
import { ParallaxLayer } from '../scenes/ParallaxLayer'
import { Scene } from '../scenes/Scene'
import { useContactModal } from '../../hooks/useContactModal'
import { useScene } from '../../hooks/useScene'
import { profile } from '../../lib/content-loader'

/** Stagger delay for the CSS entrance (see `.hero-rise` in globals.css). */
const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties

function HeroBackdrop() {
  return (
    <>
      {/* The field is oversized so its slow scroll drift never shows an edge. */}
      <ParallaxLayer depth={48} className="hero-grid absolute -inset-x-0 -inset-y-14">
        <CubeField className="size-full" />
      </ParallaxLayer>
      {/* Keeps the copy readable: the wall fades into the scene colour towards the bottom-left corner. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top_right,rgba(42,13,26,0.94)_0%,rgba(42,13,26,0.72)_38%,rgba(42,13,26,0.18)_72%,rgba(42,13,26,0.3)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-burgundy-deep/80 to-transparent" />
    </>
  )
}

export function Hero() {
  const { openModal } = useContactModal()
  const { goTo } = useScene()
  // The entrance is CSS only, so it starts with the first paint of the prerendered HTML instead of waiting for
  // JavaScript. The intro paragraph is the largest element on phones: it only rises, it never starts transparent.
  return (
    <Scene
      id="home"
      tone="deep"
      titleId="hero-title"
      className="flex flex-col justify-end"
      backdrop={<HeroBackdrop />}
    >
      <div className="max-w-3xl">
        <p className="hero-rise t-eyebrow mb-4 flex items-center gap-3 text-peach sm:mb-5" style={delay(0.1)}>
          <span aria-hidden className="h-px w-8 bg-peach/60" />
          <span data-testid="hero-name">{profile.name}</span>
          <span className="sr-only">, {profile.title}</span>
        </p>

        <MaskedLines
          lines={profile.headline}
          accentLast
          accentClass="text-peach"
          className="t-display-xl"
          id="hero-title"
        />

        <p
          className="hero-rise mt-4 text-sm font-medium uppercase tracking-[0.14em] text-peach sm:mt-6"
          style={delay(0.4)}
        >
          {profile.supportingLine}
        </p>
        <p className="hero-lift t-lede mt-3 max-w-xl text-on-dark-soft sm:mt-5" style={delay(0.45)}>
          {profile.intro}
        </p>
        <div className="hero-rise mt-6 flex flex-wrap gap-3 sm:mt-9 sm:gap-4" style={delay(0.6)}>
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
        </div>
        <p
          className="hero-rise mt-5 flex items-center gap-2 text-xs text-on-dark-mute sm:mt-7 sm:text-[0.8125rem]"
          style={delay(0.75)}
        >
          <MapPin className="size-3.5 text-peach" aria-hidden />
          {profile.location}
          {profile.availability ? (
            <>
              <span aria-hidden className="mx-1 text-ivory/30">
                |
              </span>
              <span data-testid="availability">{profile.availability}</span>
            </>
          ) : null}
        </p>
      </div>
    </Scene>
  )
}
