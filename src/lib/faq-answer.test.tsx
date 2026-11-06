import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAnswer } from '../components/faq/faq-answer'
import { profile } from './content-loader'

describe('renderAnswer', () => {
  it('fills contact tokens with real links and the formatted phone number', () => {
    const { container } = render(<p>{renderAnswer('Email {email}, call {phone}, see {linkedin} and {github}.', profile)}</p>)
    expect(container.querySelector('a[href="mailto:ibrahem.sotejo.dev@gmail.com"]')).not.toBeNull()
    expect(container.textContent).toContain('+63 917 491 2048')
    expect(container.querySelector('a[href="https://github.com/bibiyo21"]')?.getAttribute('rel')).toContain('noopener')
  })

  it('leaves unknown tokens and plain text untouched', () => {
    const { container } = render(<p>{renderAnswer('Plain {unknown} text', profile)}</p>)
    expect(container.textContent).toBe('Plain {unknown} text')
  })
})
