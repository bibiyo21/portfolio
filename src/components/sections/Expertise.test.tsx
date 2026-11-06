import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { profile, skills } from '../../lib/content-loader'
import { Expertise } from './Expertise'

describe('Expertise', () => {
  it('renders every capability pillar with its technologies', () => {
    renderWithApp(<Expertise />)
    const cards = screen.getAllByTestId('capability-card')
    expect(cards).toHaveLength(profile.capabilities.items.length)
    expect(within(cards[0]!).getByText('Docker')).toBeInTheDocument()
  })

  it('offers a tab per skill category and shows the first one', () => {
    renderWithApp(<Expertise />)
    expect(screen.getAllByRole('tab')).toHaveLength(skills.categories.length)
    expect(screen.getByRole('tab', { name: 'Frontend engineering' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('React.js')
  })

  it('switches category and explains how it relates to delivery', async () => {
    const user = userEvent.setup()
    renderWithApp(<Expertise />)
    await user.click(screen.getByRole('tab', { name: 'Data and caching' }))
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('PostgreSQL')
    expect(panel).toHaveTextContent('Why it matters')
  })

  it('separates exploration from confirmed skills and says so', async () => {
    const user = userEvent.setup()
    renderWithApp(<Expertise />)
    await user.click(screen.getByRole('tab', { name: 'Exploring' }))
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('Current interests, not delivery experience')
    expect(panel).toHaveTextContent('Model Context Protocol (MCP)')
    expect(screen.getAllByText('(area of interest)').length).toBeGreaterThan(0)
  })

  it('never renders proficiency percentages, stars or "expert" labels', () => {
    const { container } = renderWithApp(<Expertise />)
    expect(container.textContent).not.toMatch(/\d+\s?%/)
    expect(container.textContent?.toLowerCase()).not.toMatch(/\bexpert\b/)
    expect(container.textContent).not.toContain('★')
  })
})
