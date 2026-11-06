import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo, LogoMark } from './Logo'

describe('Logo', () => {
  it('uses the variant that matches the background', () => {
    const { rerender } = render(<Logo variant="light" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/brand/logo-horizontal-light.svg')
    rerender(<Logo variant="dark" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/brand/logo-horizontal-dark.svg')
  })

  it('reserves its space with width and height so it cannot shift the layout', () => {
    render(<Logo variant="dark" height={46} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('height', '46')
    expect(Number(img.getAttribute('width'))).toBe(Math.round(46 * (237.7 / 64)))
  })

  it('is described for assistive tech by default and can be marked decorative', () => {
    const { rerender } = render(<Logo variant="light" />)
    expect(screen.getByRole('img', { name: 'Ibrahem Sotejo, Solutions Architect' })).toBeInTheDocument()
    rerender(<Logo variant="light" alt="" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('loads eagerly because it is above the fold', () => {
    render(<Logo variant="light" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
  })
})

describe('LogoMark', () => {
  it('is square, decorative by default and uses the symbol asset', () => {
    const { container } = render(<LogoMark variant="dark" size={40} />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('src', '/images/brand/logo-symbol-dark.svg')
    expect(img).toHaveAttribute('width', '40')
    expect(img).toHaveAttribute('height', '40')
    expect(img).toHaveAttribute('alt', '')
  })
})
