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
    expect(screen.getAllByTestId('project-card')).toHaveLength(projects.items.filter((p) => p.type !== 'personal').length)
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
    const personal = screen.getAllByTestId('personal-card')
    expect(personal.map((c) => within(c).getByRole('heading', { level: 4 }).textContent)).toEqual(['Venue Seat Planner'])
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
