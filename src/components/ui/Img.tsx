import { useState, type ImgHTMLAttributes } from 'react'

const FALLBACK_SRC = '/images/illustrations/image-fallback.svg'

interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string
  alt: string
  priority?: boolean
}

// Lazy by default; the hero image opts in to eager + high fetch priority.
// If the configured file is missing, swap to a neutral on-brand fallback once.
export function Img({ src, alt, priority = false, onError, ...rest }: ImgProps) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed ? FALLBACK_SRC : src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      data-fallback={failed || undefined}
      onError={(e) => {
        if (!failed) setFailed(true)
        onError?.(e)
      }}
      {...rest}
    />
  )
}
