import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { faq } from '../../lib/content-loader'
import { renderWithApp } from '../../test/render'
import { Faq } from '../sections/Faq'
import { FaqAccordion } from './FaqAccordion'

describe('FaqAccordion', () => {
  it('renders every question as a collapsed button with aria-expanded and aria-controls', () => {
    renderWithApp(<FaqAccordion />)
    const buttons = faq.items.map((q) => screen.getByRole('button', { name: q.question }))
    expect(buttons).toHaveLength(12)
    for (const b of buttons) {
      expect(b).toHaveAttribute('aria-expanded', 'false')
      expect(b).toHaveAttribute('aria-controls')
    }
  })

  it('wraps each question button in a heading so the outline stays navigable', () => {
    renderWithApp(<FaqAccordion />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(faq.items.length)
  })

  it('opens an answer as a labelled region', async () => {
    const user = userEvent.setup()
    renderWithApp(<FaqAccordion />)
    const q = screen.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })
    await user.click(q)
    expect(q).toHaveAttribute('aria-expanded', 'true')
    const region = await screen.findByRole('region', { name: 'Who is Ibrahem Sotejo?' })
    expect(region).toHaveTextContent('Solutions Architect and full-stack developer from the Philippines')
    expect(q.getAttribute('aria-controls')).toBe(region.id)
  })

  it('is single-open by default', async () => {
    const user = userEvent.setup()
    renderWithApp(<FaqAccordion />)
    const first = screen.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })
    const second = screen.getByRole('button', { name: 'Does Ibrahem work with AI?' })
    await user.click(first)
    await user.click(second)
    await waitFor(() => expect(first).toHaveAttribute('aria-expanded', 'false'))
    expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  it('allows several open rows when `multiple` is set', async () => {
    const user = userEvent.setup()
    renderWithApp(<FaqAccordion multiple />)
    const first = screen.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })
    const second = screen.getByRole('button', { name: 'Does Ibrahem work with AI?' })
    await user.click(first)
    await user.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes an open row when it is clicked again', async () => {
    const user = userEvent.setup()
    renderWithApp(<FaqAccordion />)
    const q = screen.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })
    await user.click(q)
    await user.click(q)
    await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument())
    expect(q).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles with the keyboard (Enter and Space)', async () => {
    const user = userEvent.setup()
    renderWithApp(<FaqAccordion />)
    const q = screen.getByRole('button', { name: 'Who is Ibrahem Sotejo?' })
    q.focus()
    await user.keyboard('{Enter}')
    expect(q).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard(' ')
    await waitFor(() => expect(q).toHaveAttribute('aria-expanded', 'false'))
  })

  it('fills the contact answer with real links', async () => {
    const user = userEvent.setup()
    renderWithApp(<FaqAccordion />)
    await user.click(screen.getByRole('button', { name: 'How can someone contact Ibrahem?' }))
    const region = await screen.findByRole('region', { name: 'How can someone contact Ibrahem?' })
    expect(region.querySelector('a[href="mailto:ibrahem.sotejo.dev@gmail.com"]')).not.toBeNull()
    expect(region).toHaveTextContent('+63 917 491 2048')
  })

  it('uses neutral wording for availability', async () => {
    const user = userEvent.setup()
    renderWithApp(<FaqAccordion />)
    await user.click(screen.getByRole('button', { name: 'Is Ibrahem available for freelance or consulting work?' }))
    expect(await screen.findByText('For project, consulting, or collaboration inquiries, please get in touch.')).toBeInTheDocument()
  })
})

describe('Faq scene', () => {
  it('ends with a Still have a question CTA', () => {
    renderWithApp(<Faq />)
    expect(screen.getByRole('heading', { name: 'Still have a question?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Get in touch/ })).toBeInTheDocument()
  })
})
