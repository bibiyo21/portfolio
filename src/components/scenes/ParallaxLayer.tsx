import { motion, useScroll, useTransform } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { useParallaxScale } from '../../hooks/useParallaxScale'
import { useSceneRef } from './Scene'

/**
 * A decorative layer that drifts at its own speed while its scene crosses the viewport.
 * Values are Framer motion values applied as transforms, so scrolling does not re-render React.
 * `depth` is the travel in px at full scale (keep it small), `rotate` is the total rotation in degrees.
 */
export function ParallaxLayer({
  depth = 40,
  rotate = 0,
  className,
  style,
  children,
}: {
  depth?: number
  rotate?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const sceneRef = useSceneRef()
  const scale = useParallaxScale()
  const { scrollYProgress } = useScroll({ target: sceneRef ?? undefined, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [depth * scale, -depth * scale])
  const r = useTransform(scrollYProgress, [0, 1], [(-rotate / 2) * scale, (rotate / 2) * scale])
  return (
    <motion.div className={className} style={{ ...style, y, rotate: r }}>
      {children}
    </motion.div>
  )
}
