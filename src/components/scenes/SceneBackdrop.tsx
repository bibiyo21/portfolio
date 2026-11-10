import type { SceneTone } from '../../lib/scenes'
import { Atom, Molecule } from './Molecules'
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
  const lab = dark ? 'text-peach opacity-30' : 'text-burgundy opacity-20'
  return (
    <>
      <ParallaxLayer depth={30} className={`absolute ${flip ? '-left-40 -top-32' : '-right-40 -top-32'} size-[34rem]`}>
        <div className={`size-full rounded-full ${big} ${dark ? 'opacity-50' : 'opacity-40'} blur-3xl`} />
      </ParallaxLayer>
      <ParallaxLayer
        depth={60}
        rotate={6}
        className={`absolute ${flip ? '-left-16' : '-right-16'} -bottom-20 size-72 max-md:hidden`}
      >
        <div className={`size-full rounded-full border ${ring}`} />
        <div className={`absolute inset-10 rounded-full border ${ring}`} />
      </ParallaxLayer>
      <ParallaxLayer depth={90} rotate={8} className={`absolute ${flip ? 'right-[5%]' : 'left-[1.5%]'} top-[30%] max-lg:hidden`}>
        <div className={`size-3 rotate-45 ${obj} opacity-70`} />
      </ParallaxLayer>
      <ParallaxLayer depth={70} rotate={-5} className={`absolute ${flip ? 'left-[1.5%]' : 'right-[5%]'} bottom-[24%] max-lg:hidden`}>
        <div className={`size-2 rounded-full ${obj} opacity-60`} />
      </ParallaxLayer>
      {/* Lab motifs: a turning molecule near the top corner and an atom with circling electrons lower down. */}
      <ParallaxLayer depth={50} className={`absolute right-[5%] top-[calc(var(--nav-h)+1rem)] ${lab}`}>
        <Molecule className="size-24 md:size-36 xl:size-44" duration={flip ? '90s' : '70s'} />
      </ParallaxLayer>
      <ParallaxLayer depth={40} className={`absolute ${flip ? 'right-[7%]' : 'left-[2%]'} bottom-[9%] max-md:hidden ${lab}`}>
        <Atom />
      </ParallaxLayer>
    </>
  )
}
