import { describe, expect, it } from 'vitest'
import { caseStudyPath, parseRoute } from './routes'

describe('parseRoute', () => {
  it('maps the home page and anything unknown to home', () => {
    expect(parseRoute('/')).toEqual({ kind: 'home' })
    expect(parseRoute('/nope')).toEqual({ kind: 'home' })
    expect(parseRoute('/case-studies/a/b')).toEqual({ kind: 'home' })
  })

  it('maps the case-studies index with or without a trailing slash', () => {
    expect(parseRoute('/case-studies')).toEqual({ kind: 'case-studies' })
    expect(parseRoute('/case-studies/')).toEqual({ kind: 'case-studies' })
  })

  it('maps a case-study path to its slug', () => {
    expect(parseRoute('/case-studies/nutridense-inventory')).toEqual({ kind: 'case-study', slug: 'nutridense-inventory' })
    expect(parseRoute(caseStudyPath('x-1/'))).toEqual({ kind: 'case-study', slug: 'x-1' })
  })
})
