import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { projects } from '../../lib/content-loader'
import type { ProjectItem } from '../../lib/content-schemas'
import { renderWithApp } from '../../test/render'
import { PersonalProjectCard } from './PersonalProjectCard'
import { ProjectDetail } from './ProjectDetail'

const venue = projects.items.find((p) => p.id === 'venue-seat-planner')!

describe('Venue Seat Planner content', () => {
  it('is a personal project with the supplied name, URL and framing', () => {
    expect(venue.type).toBe('personal')
    expect(venue.name).toBe('Venue Seat Planner')
    expect(venue.liveUrl).toBe('https://venue-seat-planner.vercel.app/')
    expect(venue.category).toBe('Personal Projects / Proof of Concept')
    expect(venue.statusLabel).toBe('Personal PoC')
    expect(venue.tags).toContain('Hobby project')
    expect(venue.ctaLabel).toBe('Open Demo')
  })

  it('publishes only verified specifics and leaves unconfirmed fields empty', () => {
    expect(venue.features.length).toBeGreaterThan(0)
    expect(venue.techSpec.map((g) => g.group)).toEqual(
      expect.arrayContaining(['Frontend', 'Backend API', 'Data storage', 'Authentication', 'Testing', 'Hosting']),
    )
    expect(venue.role).toEqual([])
    expect(venue.outcome).toEqual([])
    expect(venue.learned).toEqual([])
    expect(venue.motivation).toBe('')
    expect(venue.preview).toBeUndefined()
  })

  it('labels every screenshot as sample data and gives each one alt text', () => {
    expect(venue.thumbnail?.alt).toBeTruthy()
    expect(venue.gallery.length).toBeGreaterThanOrEqual(4)
    for (const g of venue.gallery) {
      expect(g.alt.length, g.src).toBeGreaterThan(10)
      expect(g.caption, g.src).toMatch(/sample data/i)
    }
  })

  it('never describes itself as client work, a product or a maintained service', () => {
    // Public wording only: the visible string values, not field names such as `intendedUsers`.
    const text = [venue.name, venue.siteLabel, venue.statusLabel, venue.summary, venue.overview, venue.ctaLabel, ...venue.tags, ...venue.limitations]
      .join(' ')
      .toLowerCase()
    for (const word of ['client', 'commercial', 'saas', 'enterprise', 'production-ready', 'customers', 'users', 'maintained']) {
      expect(text.includes(word), word).toBe(false)
    }
  })
})

describe('PersonalProjectCard', () => {
  it('shows the status label, the hobby tag, the name and the supplied summary', () => {
    renderWithApp(<PersonalProjectCard project={venue} onOpen={() => {}} />)
    const card = screen.getByTestId('personal-card')
    expect(within(card).getByText('Personal PoC')).toBeInTheDocument()
    expect(within(card).getByText('Hobby project')).toBeInTheDocument()
    expect(within(card).getByRole('heading', { level: 4, name: 'Venue Seat Planner' })).toBeInTheDocument()
    expect(card).toHaveTextContent('A personal proof of concept exploring how venue seating plans can be organized')
  })

  it('opens the live demo safely in a new tab with the Open Demo label', () => {
    renderWithApp(<PersonalProjectCard project={venue} onOpen={() => {}} />)
    const link = screen.getByRole('link', { name: /Open Demo/ })
    expect(link).toHaveAttribute('href', 'https://venue-seat-planner.vercel.app/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toMatch(/noopener/)
    expect(link.getAttribute('rel')).toMatch(/noreferrer/)
    expect(link).toHaveTextContent('(opens in a new tab)')
  })

  it('calls onOpen from View details', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    renderWithApp(<PersonalProjectCard project={venue} onOpen={onOpen} />)
    await user.click(screen.getByRole('button', { name: 'View details' }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('has no live link when none is supplied', () => {
    const noLink: ProjectItem = { ...venue, liveUrl: undefined }
    renderWithApp(<PersonalProjectCard project={noLink} onOpen={() => {}} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows the sample-data thumbnail when present and no image otherwise', () => {
    const { container, rerender } = renderWithApp(<PersonalProjectCard project={venue} onOpen={() => {}} />)
    expect(container.querySelector('img')).toHaveAttribute('src', venue.thumbnail!.src)
    rerender(<PersonalProjectCard project={{ ...venue, thumbnail: undefined }} onOpen={() => {}} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('ProjectDetail for a personal project', () => {
  it('shows verified features, the grouped technical specification, screenshots and limitations', () => {
    renderWithApp(<ProjectDetail project={venue} />)
    expect(screen.getByLabelText('Project status')).toHaveTextContent('Personal PoC')
    expect(screen.getByLabelText('Project status')).toHaveTextContent('Hobby project')
    expect(screen.getByText('Technical specification')).toBeInTheDocument()
    expect(screen.getByText('Next.js 16 (pages router) · React 19')).toBeInTheDocument()
    expect(screen.getByText('Features visible in the demo')).toBeInTheDocument()
    expect(screen.getByLabelText('Screenshots').querySelectorAll('img')).toHaveLength(venue.gallery.length)
    expect(screen.getByText('Status and limitations')).toBeInTheDocument()
    for (const hidden of ['Motivation', 'Role and contribution', 'What I learned', 'Outcome']) {
      expect(screen.queryByText(hidden), hidden).not.toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /Open Demo/ })).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('shows each section as soon as the owner supplies verified content for it', () => {
    const detailed: ProjectItem = {
      ...venue,
      motivation: 'Why it was built.',
      intendedUsers: 'Who it is for.',
      features: ['A confirmed feature'],
      decisions: [{ title: 'A decision', text: 'Why.' }],
      learned: ['A lesson'],
      technologies: ['Some tech'],
    }
    renderWithApp(<ProjectDetail project={detailed} />)
    for (const shown of ['Motivation', 'Intended users', 'Features visible in the demo', 'Design and engineering decisions', 'What I learned']) {
      expect(screen.getByText(shown), shown).toBeInTheDocument()
    }
    expect(screen.getByText('A confirmed feature')).toBeInTheDocument()
    expect(screen.getByText('Some tech')).toBeInTheDocument()
  })
})
