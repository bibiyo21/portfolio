import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { experience } from '../../lib/content-loader'
import { Experience } from './Experience'

describe('Experience timeline', () => {
  it('renders each company with its roles and periods', () => {
    renderWithApp(<Experience />)
    const companies = screen.getAllByTestId('company')
    expect(companies).toHaveLength(experience.groups.length)
    experience.groups.forEach((g, i) => {
      expect(within(companies[i]!).getByRole('heading', { level: 3, name: g.company })).toBeInTheDocument()
      for (const r of g.roles) {
        expect(within(companies[i]!).getByText(r.title)).toBeInTheDocument()
        expect(within(companies[i]!).getByText(r.period)).toBeInTheDocument()
      }
    })
  })

  it('never displays internal notes or placeholder text', () => {
    const { container } = renderWithApp(<Experience />)
    expect(container.textContent).not.toMatch(/to be added|placeholder|\[/i)
  })

  it('shows an expand control only for roles that have details', () => {
    renderWithApp(<Experience />)
    expect(screen.getAllByRole('button', { name: /details for/i })).toHaveLength(
      experience.groups.flatMap((g) => g.roles).filter((r) => r.responsibilities.length || r.achievements.length || r.technologies.length).length,
    )
  })

  it('expands Solutions30 contributions using the supported verbs', async () => {
    const user = userEvent.setup()
    renderWithApp(<Experience />)
    await user.click(screen.getByRole('button', { name: /show details for solutions architect/i }))
    expect(await screen.findByText(/Initiated migration from older frameworks/)).toBeInTheDocument()
    expect(screen.getByText(/Wrote PHPUnit unit tests/)).toBeInTheDocument()
  })

  it('nests the Innovators Club chairmanship under Gameloft', () => {
    renderWithApp(<Experience />)
    const gameloft = screen.getAllByTestId('company').find((c) => within(c).queryByRole('heading', { name: 'Gameloft Philippines Inc.' }))!
    const lead = within(gameloft).getByTestId('leadership')
    expect(lead).toHaveTextContent("Chairman, Gameloft Innovators' Club")
    expect(lead).toHaveTextContent('November 2016 – April 2019')
  })
})
