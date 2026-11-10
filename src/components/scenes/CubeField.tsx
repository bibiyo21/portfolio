import { useEffect, useRef } from 'react'

// Hero backdrop: a wall of extruded blocks in the brand burgundy that breathes slowly and rises under the
// pointer. Plain 2D canvas, no library and no network request, so it costs a few kB instead of a 3D runtime.
// It starts after the page is idle, pauses when the hero is off screen or the tab is hidden, and draws a
// single still frame under reduced motion. Purely decorative: the parent hides it from assistive technology.

const LEVELS = 32
const DEEP = [36, 11, 22] as const
const BURGUNDY = [104, 36, 64] as const
const PEACH = '#f5c6ad'
const GAP_COLOUR = '#190710'

const mix = (a: readonly number[], b: readonly number[], t: number, shade = 1) =>
  `rgb(${a.map((v, i) => Math.round((v + (b[i]! - v) * t) * shade)).join(',')})`

// One colour set per height step, so the frame loop allocates no strings.
const palette = Array.from({ length: LEVELS }, (_, i) => {
  const t = i / (LEVELS - 1)
  return { face: mix(DEEP, BURGUNDY, t), right: mix(DEEP, BURGUNDY, t, 0.55), bottom: mix(DEEP, BURGUNDY, t, 0.38) }
})

/** Stable pseudo-random value per tile, so a resize does not reshuffle the wall. */
const seed = (c: number, r: number) => {
  const s = Math.sin(c * 127.1 + r * 311.7) * 43758.5453
  return s - Math.floor(s)
}

export function CubeField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let cell = 64
    let cols = 0
    let rows = 0
    let frame = 0
    let onScreen = true
    let started = false
    // Pointer position eases towards its target; strength fades the bump in and out.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, inside: false }

    const draw = (time: number) => {
      const t = time / 1000
      pointer.x += (pointer.tx - pointer.x) * 0.12
      pointer.y += (pointer.ty - pointer.y) * 0.12
      pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * 0.06
      const radius = cell * 3.2
      const maxLift = cell * 0.2
      const size = cell - 2

      ctx.globalAlpha = 1
      ctx.fillStyle = GAP_COLOUR
      ctx.fillRect(0, 0, width, height)

      // Row-major order: a raised block overlaps the ones above and to its left, which were drawn first.
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const s = seed(c, r)
          const wave = Math.sin(c * 0.55 + t * 0.4 + s * 6.28) * 0.5 + Math.sin(r * 0.7 - t * 0.3 + s * 3) * 0.5
          let z = (0.5 + 0.5 * wave) * 0.5 + s * 0.2
          const x = c * cell
          const y = r * cell
          let glow = 0
          if (pointer.strength > 0.01) {
            const dx = x + cell / 2 - pointer.x
            const dy = y + cell / 2 - pointer.y
            glow = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius)) * pointer.strength
            z += glow * 0.75
          }
          if (z > 1) z = 1
          const lift = z * maxLift
          const fx = x - lift
          const fy = y - lift
          const p = palette[Math.round(z * (LEVELS - 1))]!

          if (lift > 0.5) {
            ctx.fillStyle = p.right
            ctx.beginPath()
            ctx.moveTo(fx + size, fy)
            ctx.lineTo(x + size, y)
            ctx.lineTo(x + size, y + size)
            ctx.lineTo(fx + size, fy + size)
            ctx.fill()
            ctx.fillStyle = p.bottom
            ctx.beginPath()
            ctx.moveTo(fx, fy + size)
            ctx.lineTo(fx + size, fy + size)
            ctx.lineTo(x + size, y + size)
            ctx.lineTo(x, y + size)
            ctx.fill()
          }
          ctx.fillStyle = p.face
          ctx.fillRect(fx, fy, size, size)
          if (glow > 0.02) {
            ctx.globalAlpha = glow * 0.3
            ctx.fillStyle = PEACH
            ctx.fillRect(fx, fy, size, size)
            ctx.globalAlpha = 1
          }
        }
      }
    }

    const loop = (time: number) => {
      draw(time)
      frame = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }
    const sync = () => {
      const shouldRun = started && onScreen && !document.hidden && !reduce.matches
      if (shouldRun && !frame) frame = requestAnimationFrame(loop)
      else if (!shouldRun) {
        stop()
        if (started && reduce.matches) draw(0)
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (!width || !height) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = Math.min(84, Math.max(44, width / 22))
      cols = Math.ceil(width / cell) + 1
      rows = Math.ceil(height / cell) + 1
      if (started && !frame) draw(0)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const box = canvas.getBoundingClientRect()
      const x = e.clientX - box.left
      const y = e.clientY - box.top
      const inside = x >= 0 && y >= 0 && x <= box.width && y <= box.height
      if (inside && !pointer.inside && pointer.strength < 0.01) {
        pointer.x = x
        pointer.y = y
      }
      pointer.inside = inside
      pointer.tx = x
      pointer.ty = y
    }
    const onLeave = () => {
      pointer.inside = false
    }

    const start = () => {
      started = true
      resize()
      draw(0)
      canvas.style.opacity = '1'
      sync()
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
      sync()
    })
    observer.observe(canvas)
    const sizes = new ResizeObserver(resize)
    sizes.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', sync)
    reduce.addEventListener('change', sync)

    // Wait until the browser is idle so the first paint and hydration are never competing with the canvas.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1200 })
      : window.setTimeout(start, 300)

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      window.clearTimeout(idle)
      stop()
      observer.disconnect()
      sizes.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', sync)
      reduce.removeEventListener('change', sync)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      data-testid="hero-field"
      className={className}
      style={{ opacity: 0, transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
    />
  )
}
