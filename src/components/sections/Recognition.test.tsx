import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { Recognition } from './Recognition'

describe('Recognition', () => {
  it('shows the degree, institution and period', () => {
    renderWithApp(<Recognition />)
    expect(screen.getByText('Bachelor of Science in Information Technology')).toBeInTheDocument()
    expect(screen.getByText(/Polytechnic University of the Philippines/)).toBeInTheDocument()
    expect(screen.getByText('2011 – 2016')).toBeInTheDocument()
  })

  it('lists the three certifications without implying they are current', () => {
    const { container } = renderWithApp(<Recognition />)
    for (const c of ['Certified SAFe 5 Agilist', 'Certified SAFe 5 Architect', 'Certified Lean Six Sigma White Belt'])
      expect(screen.getByText(c)).toBeInTheDocument()
    expect(container.textContent?.toLowerCase()).not.toMatch(/active|current(ly)? (valid|certified)/)
  })

  it('lists all seven recognitions with their years', () => {
    renderWithApp(<Recognition />)
    const items = within(screen.getByTestId('awards')).getAllByRole('listitem')
    expect(items).toHaveLength(7)
    expect(items[0]).toHaveTextContent('EV Top Performer')
    expect(items[0]).toHaveTextContent('Q3 2019 · Q3 2021 · Q3 2022 · Q1 2023')
  })
})
