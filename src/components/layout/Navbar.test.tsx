import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('exposes the required navigation items', () => {
    renderWithApp(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const name of ['Home', 'About', 'Experience', 'Projects', 'Expertise']) {
      expect(within(nav).getByRole('link', { name })).toHaveAttribute('href', `#${name.toLowerCase()}`)
    }
    expect(within(nav).getByRole('button', { name: 'Contact' })).toBeInTheDocument()
  })

  it('opens the contact modal from the Contact item', async () => {
    const user = userEvent.setup()
    renderWithApp(<Navbar />)
    await user.click(screen.getByRole('button', { name: 'Contact' }))
    expect(await screen.findByRole('dialog', { name: "Let's Start a Conversation" })).toBeInTheDocument()
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()
    renderWithApp(<Navbar />)
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const menu = await screen.findByRole('dialog', { name: 'Site navigation' })
    expect(within(menu).getByRole('button', { name: 'Projects' })).toBeInTheDocument()
    await user.click(within(menu).getByRole('button', { name: 'Close menu' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Site navigation' })).not.toBeInTheDocument())
  })
})
