import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Root from '../../Root'
import { projects } from '../../lib/content-loader'

const legacy = projects.items.filter((p) => p.caseStudy)

describe('case-study pages', () => {
  it('exist for the two legacy projects and not for the GTI projects', () => {
    expect(legacy.map((p) => p.caseStudy!.slug)).toEqual(['nutridense-inventory', 'sconnect-integration'])
    for (const p of projects.items.filter((i) => i.scene)) expect(p.caseStudy).toBeUndefined()
  })

  it.each(legacy.map((p) => [p.name, p.caseStudy!.slug] as const))('%s renders every evaluation section', (name, slug) => {
    render(<Root path={`/case-studies/${slug}`} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(name)
    for (const h of ['What the system does', 'How it is built', 'What holds up', 'What I would fix', 'How I would modernise it', 'Overall'])
      expect(screen.getByRole('heading', { level: 2, name: h }), h).toBeInTheDocument()
    expect(screen.getByLabelText('Screenshots').querySelectorAll('img')).toHaveLength(5)
    expect(screen.getAllByRole('link', { name: /Discuss a similar project|Get in touch/ })[0]).toHaveAttribute('href', '/#contact')
  })

  it('the Samsung page lists the Sanctum API surface', () => {
    render(<Root path="/case-studies/sconnect-integration" />)
    const section = screen.getByRole('region', { name: 'The interfaces it exposes and calls' })
    expect(within(section).getByText('POST /api/login')).toBeInTheDocument()
    expect(within(section).getByText('POST /api/request')).toBeInTheDocument()
  })

  it('the index links the GTI scenes on the home page and each legacy review', () => {
    render(<Root path="/case-studies" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(projects.caseStudiesPage!.title)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(expect.arrayContaining(['/#gti-main', '/#gti-north', '/case-studies/nutridense-inventory', '/case-studies/sconnect-integration']))
  })

  it('never publishes credentials or secrets', () => {
    const text = JSON.stringify(projects)
    expect(text).not.toMatch(/password\s*[:=]\s*["'][^"']+["']|glpat-|api[_-]?key\s*[:=]/i)
  })
})
