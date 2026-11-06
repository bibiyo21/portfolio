import type { SceneTone } from '../../lib/scenes'
import { ParallaxLayer } from './ParallaxLayer'

/**
 * Three depth layers of lightweight CSS/SVG geometry: background (slowest), midground, and
 * small decorative objects. Colours follow the scene tone. No images, no video.
 */
export function SceneBackdrop({ tone, variant = 'a' }: { tone: SceneTone; variant?: 'a' | 'b' }) {
  const dark = tone === 'dark' || tone === 'deep'
  const big = dark ? 'bg-burgundy' : tone === 'peach' ? 'bg-peach-soft' : 'bg-peach'
  const ring = dark ? 'border-peach/25' : 'border-burgundy/15'
  const obj = dark ? 'bg-peach' : 'bg-burgundy'
  const flip = variant === 'b'
  return (
    <>
      <ParallaxLayer depth={30} className={`absolute ${flip ? '-left-40 -top-32' : '-right-40 -top-32'} size-[34rem]`}>
        <div className={`size-full rounded-full ${big} ${dark ? 'opacity-50' : 'opacity-40'} blur-3xl`} />
      </ParallaxLayer>
      <ParallaxLayer
        depth={60}
        rotate={6}
        className={`absolute ${flip ? 'left-[6%]' : 'right-[6%]'} bottom-[8%] size-72 max-md:hidden`}
      >
        <div className={`size-full rounded-full border ${ring}`} />
        <div className={`absolute inset-10 rounded-full border ${ring}`} />
      </ParallaxLayer>
      <ParallaxLayer depth={90} rotate={8} className={`absolute ${flip ? 'right-[12%]' : 'left-[10%]'} top-[22%] max-md:hidden`}>
        <div className={`size-3 rotate-45 ${obj} opacity-70`} />
      </ParallaxLayer>
      <ParallaxLayer depth={70} rotate={-5} className={`absolute ${flip ? 'left-[22%]' : 'right-[24%]'} bottom-[18%] max-md:hidden`}>
        <div className={`size-2 rounded-full ${obj} opacity-60`} />
      </ParallaxLayer>
    </>
  )
}
