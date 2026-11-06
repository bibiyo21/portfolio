import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { projects } from '../../lib/content-loader'
import type { ProjectItem } from '../../lib/content-schemas'
import { renderWithApp } from '../../test/render'
import { CaseStudyScene } from './CaseStudyScene'

const main = projects.items.find((p) => p.id === 'gti-main')!
const north = projects.items.find((p) => p.id === 'gti-north')!

describe('CaseStudyScene', () => {
  it('renders the GTI Main case study with its site label and family eyebrow', () => {
    renderWithApp(<CaseStudyScene project={main} tone="dark" number="04" />)
    expect(screen.getByRole('heading', { level: 2, name: 'GTI Main' })).toBeInTheDocument()
    expect(screen.getByText('Primary platform')).toBeInTheDocument()
    expect(screen.getByText(/Case study 1 of 2/)).toBeInTheDocument()
  })

  it('renders GTI North as a distinct, related case study', () => {
    renderWithApp(<CaseStudyScene project={north} tone="peach" number="05" />)
    expect(screen.getByRole('heading', { level: 2, name: 'GTI North' })).toBeInTheDocument()
    expect(screen.getByText('Location implementation')).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: /GTI case studies/ })
    expect(within(nav).getByRole('link', { name: 'GTI Main' })).toHaveAttribute('href', '#gti-main')
    expect(within(nav).getByText('GTI North')).toHaveAttribute('aria-current', 'true')
  })

  it('exposes the case-study sections as an accessible accordion, role and approach open by default', async () => {
    const user = userEvent.setup()
    renderWithApp(<CaseStudyScene project={main} tone="dark" number="04" />)
    const role = screen.getByRole('button', { name: 'Role and contribution' })
    expect(role).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Worked on the GTI website redesign.')).toBeInTheDocument()
    const approach = screen.getByRole('button', { name: 'Architecture and approach' })
    expect(approach).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByText('Proposed / designed')).toHaveLength(main.approach.length)
    const tech = screen.getByRole('button', { name: 'Technology' })
    expect(tech).toHaveAttribute('aria-expanded', 'false')
    await user.click(tech)
    expect(tech).toHaveAttribute('aria-expanded', 'true')
  })

  it('omits the outcome section when no verified outcome is supplied, and links only to the supplied URL', () => {
    renderWithApp(<CaseStudyScene project={main} tone="dark" number="04" />)
    expect(screen.queryByRole('button', { name: 'Outcome' })).not.toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Visit the live site/ })
    expect(link).toHaveAttribute('href', 'https://goalietraininginstitute.ca/')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('shows outcome and links only when verified values exist', () => {
    const verified: ProjectItem = { ...main, outcome: ['Verified result'], liveUrl: 'https://example.com' }
    renderWithApp(<CaseStudyScene project={verified} tone="dark" number="04" />)
    expect(screen.getByRole('button', { name: 'Outcome' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit the live site/ })).toHaveAttribute('href', 'https://example.com')
  })

  it('shows real screenshots with a capture date instead of illustrative artwork', () => {
    renderWithApp(<CaseStudyScene project={main} tone="dark" number="04" />)
    expect(screen.getByText(/Screenshots of the live site, captured 6 November 2026/)).toBeInTheDocument()
    expect(screen.queryByText(/Illustrative artwork/)).not.toBeInTheDocument()
    expect(screen.getByTestId('desktop-preview')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-preview')).toBeInTheDocument()
  })

  it('falls back to a labelled illustration when a project has no real screenshots', () => {
    const noPreview: ProjectItem = { ...main, preview: undefined }
    renderWithApp(<CaseStudyScene project={noPreview} tone="dark" number="04" />)
    expect(screen.getByText(/Illustrative artwork/)).toBeInTheDocument()
    expect(screen.queryByTestId('desktop-preview')).not.toBeInTheDocument()
  })
})
