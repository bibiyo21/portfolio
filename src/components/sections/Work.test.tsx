import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { projects } from '../../lib/content-loader'
import { Work } from './Work'

describe('Work', () => {
  it('shows the GTI family heading and one card per client project', () => {
    renderWithApp(<Work />)
    expect(screen.getByRole('heading', { level: 2, name: projects.family!.title })).toBeInTheDocument()
    expect(screen.getAllByTestId('project-card')).toHaveLength(projects.items.filter((p) => p.type === 'client').length)
  })

  it('links each GTI card to its dedicated scene', () => {
    renderWithApp(<Work />)
    const main = screen.getByRole('link', { name: /GTI Main/ })
    const north = screen.getByRole('link', { name: /GTI North/ })
    expect(main).toHaveAttribute('href', '#gti-main')
    expect(north).toHaveAttribute('href', '#gti-north')
  })

  it('hides the category filter when there is only one category in use', () => {
    renderWithApp(<Work />)
    expect(screen.queryByRole('group', { name: /filter projects/i })).not.toBeInTheDocument()
  })

  it('states the relationship between Main and North', () => {
    renderWithApp(<Work />)
    expect(screen.getByText(/North is a location-specific implementation/)).toBeInTheDocument()
  })

  it('lists only the supplied projects: two GTI case studies and the personal Venue Seat Planner', () => {
    renderWithApp(<Work />)
    const cards = screen.getAllByTestId('project-card')
    expect(cards.map((c) => within(c).getByRole('heading', { level: 3 }).textContent)).toEqual(['GTI Main', 'GTI North'])
    const personal = within(screen.getByTestId('personal-projects')).getAllByTestId('personal-card')
    expect(personal.map((c) => within(c).getByRole('heading', { level: 4 }).textContent)).toEqual(['Venue Seat Planner'])
  })

  it('lists the two business applications in their own section with demo-data screenshots', () => {
    renderWithApp(<Work />)
    const section = screen.getByTestId('application-projects')
    expect(within(section).getByRole('heading', { level: 3, name: 'Internal tools and integrations' })).toBeInTheDocument()
    const cards = within(section).getAllByTestId('personal-card')
    expect(cards.map((c) => within(c).getByRole('heading', { level: 4 }).textContent)).toEqual([
      'Nutridense Inventory System',
      'Samsung S Connect Integration',
    ])
    for (const c of cards) {
      expect(within(c).getByText('Demo data')).toBeInTheDocument()
      expect(within(c).getByRole('img')).toHaveAttribute('alt', expect.stringMatching(/.{20,}/))
    }
  })

  it('links each legacy project card to its own case-study page, and the section to the index', () => {
    renderWithApp(<Work />)
    const section = screen.getByTestId('application-projects')
    const cards = within(section).getAllByTestId('personal-card')
    expect(within(cards[0]!).getByRole('link', { name: /Read the case study/ })).toHaveAttribute('href', '/case-studies/nutridense-inventory')
    expect(within(cards[1]!).getByRole('link', { name: /Read the case study/ })).toHaveAttribute('href', '/case-studies/sconnect-integration')
    expect(within(section).getByRole('link', { name: 'See all case studies' })).toHaveAttribute('href', '/case-studies')
    // The personal project has no case-study page, and GTI keeps its scenes.
    expect(within(screen.getByTestId('personal-projects')).queryByRole('link', { name: /case study/i })).not.toBeInTheDocument()
  })

  it('keeps the personal project in its own labelled section, separate from the client work', () => {
    renderWithApp(<Work />)
    const section = screen.getByTestId('personal-projects')
    expect(within(section).getByRole('heading', { level: 3, name: 'Side projects and proofs of concept' })).toBeInTheDocument()
    expect(within(section).getByTestId('personal-card')).toBeInTheDocument()
    expect(within(section).queryByTestId('project-card')).not.toBeInTheDocument()
  })

  it('clicking a card updates the URL hash through scene navigation', async () => {
    const user = userEvent.setup()
    renderWithApp(<Work />)
    document.body.insertAdjacentHTML('beforeend', '<section id="gti-main"></section>')
    await user.click(screen.getByRole('link', { name: /GTI Main/ }))
    expect(window.location.hash).toBe('#gti-main')
  })
})
