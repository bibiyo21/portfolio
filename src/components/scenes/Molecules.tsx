import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'

// Decorative "lab" motifs for the scene backdrops: a ring molecule that turns slowly while drifting on a small
// orbit, and an atom whose electrons circle the nucleus. Every animation is a CSS transform on an HTML element,
// so the browser runs it on the compositor without layout or JavaScript. Colour comes from `currentColor`.

const vars = (v: Record<string, string>) => v as CSSProperties

// Hexagon vertices (radius 46 around 100,100) and three branch atoms.
const ring: [number, number][] = [
  [139.8, 77],
  [139.8, 123],
  [100, 146],
  [60.2, 123],
  [60.2, 77],
  [100, 54],
]
const branches: [number, number, number, number][] = [
  [139.8, 77, 176, 56],
  [60.2, 123, 24, 144],
  [100, 146, 100, 188],
]
// Inner lines of the double bonds, on alternating edges.
const doubles: [number, number, number, number][] = [
  [132, 84, 132, 116],
  [96, 136.5, 68.5, 120.5],
  [68.5, 79.5, 96, 63.5],
]

export function Molecule({ className, duration = '70s' }: { className?: string; duration?: string }) {
  return (
    <div className={cn('orbit', className)} style={vars({ '--orbit-r': '10px', '--orbit-t': '18s' })}>
      <svg viewBox="0 0 200 200" className="spin-slow size-full" style={vars({ '--spin-t': duration })} fill="none">
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <polygon points={ring.map((p) => p.join(',')).join(' ')} />
          {[...branches, ...doubles].map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        {ring.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5.5" fill="currentColor" />
        ))}
        {branches.map(([, , cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="9" stroke="currentColor" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="4" fill="currentColor" />
          </g>
        ))}
      </svg>
    </div>
  )
}

const shells = [
  { tilt: 0, time: '7s' },
  { tilt: 60, time: '9s' },
  { tilt: -60, time: '11s' },
]

/** Fixed 160px atom: three tilted elliptical shells, one electron on each. */
export function Atom({ className }: { className?: string }) {
  return (
    <div className={cn('relative size-40', className)}>
      <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current [animation:ping-soft_3.2s_ease-out_infinite]" />
      {shells.map((s) => (
        <div key={s.tilt} className="absolute inset-0" style={{ transform: `rotate(${s.tilt}deg)` }}>
          <span className="absolute left-1/2 top-1/2 h-[56px] w-[152px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-current opacity-60" />
          {/* Two half-period sways a quarter turn apart trace the ellipse, and the electron stays round. */}
          <span
            className="electron-x absolute left-1/2 top-1/2 block size-0"
            style={vars({ '--rx': '76px', '--ry': '28px', '--t': s.time })}
          >
            <span className="electron-y block size-0">
              <span className="absolute -left-[3.5px] -top-[3.5px] block size-[7px] rounded-full bg-current" />
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}
