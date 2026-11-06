import { Img } from './Img'

export type LogoVariant = 'light' | 'dark'

// The horizontal logo is 237.7 x 64 and the symbol is 64 x 64 (see public/images/brand).
const HORIZONTAL_RATIO = 237.7 / 64

/**
 * Brand assets. `light` is for light backgrounds (burgundy mark, charcoal name) and `dark` for dark ones
 * (peach mark, ivory name). Header and hero logos are above the fold, so they load eagerly.
 */
export function Logo({
  variant,
  height = 36,
  alt = 'Ibrahem Sotejo, Solutions Architect',
  className,
}: {
  variant: LogoVariant
  height?: number
  alt?: string
  className?: string
}) {
  return (
    <Img
      src={`/images/brand/logo-horizontal-${variant}.svg`}
      alt={alt}
      width={Math.round(height * HORIZONTAL_RATIO)}
      height={height}
      priority
      className={className}
    />
  )
}

export function LogoMark({
  variant,
  size = 40,
  alt = '',
  className,
}: {
  variant: LogoVariant
  size?: number
  alt?: string
  className?: string
}) {
  return (
    <Img
      src={`/images/brand/logo-symbol-${variant}.svg`}
      alt={alt}
      width={size}
      height={size}
      priority
      className={className}
    />
  )
}
