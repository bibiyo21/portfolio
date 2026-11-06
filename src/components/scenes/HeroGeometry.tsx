import { motion, useReducedMotion } from 'framer-motion'
import { ParallaxLayer } from './ParallaxLayer'

// Five stacked plates echo the system layers. Original geometry, no portrait, no images.
const plates = [
  { w: 'w-[78%]', left: '4%', top: '2%', depth: 18, rotate: 2 },
  { w: 'w-[70%]', left: '24%', top: '21%', depth: 32, rotate: -3 },
  { w: 'w-[74%]', left: '8%', top: '40%', depth: 46, rotate: 3 },
  { w: 'w-[66%]', left: '28%', top: '59%', depth: 60, rotate: -2 },
  { w: 'w-[72%]', left: '12%', top: '78%', depth: 74, rotate: 4 },
]

export function HeroGeometry() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className="relative mx-auto aspect-[4/5] w-full max-w-[26rem] lg:max-w-none">
      <svg viewBox="0 0 100 125" className="absolute inset-0 size-full" fill="none">
        {[22, 41, 60, 79].map((y, i) => (
          <motion.path
            key={y}
            d={`M ${i % 2 ? 62 : 38} ${y} V ${y + 9}`}
            stroke="#F5C6AD"
            strokeOpacity={0.6}
            strokeWidth={0.5}
            strokeDasharray="1.6 1.6"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.9 + i * 0.15 }}
          />
        ))}
      </svg>
      {plates.map((p, i) => (
        <ParallaxLayer
          key={i}
          depth={p.depth}
          rotate={p.rotate}
          className={`absolute ${p.w}`}
          style={{ left: p.left, top: p.top }}
        >
          <motion.div
            className="rounded-2xl border border-peach/35 bg-gradient-to-br from-burgundy to-burgundy-dark p-4 shadow-float"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-peach" />
              <span className="h-1.5 w-1/3 rounded-full bg-peach/70" />
            </div>
            <div className="mt-3 flex gap-2">
              <span className="h-1.5 w-1/2 rounded-full bg-ivory/25" />
              <span className="h-1.5 w-1/4 rounded-full bg-ivory/15" />
            </div>
          </motion.div>
        </ParallaxLayer>
      ))}
    </div>
  )
}
