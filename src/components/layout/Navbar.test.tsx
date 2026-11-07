import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { scenes, tabs } from '../../lib/scenes'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('exposes the eleven desktop tabs as real links to scene ids', () => {
    renderWithApp(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getAllByRole('link')).toHaveLength(tabs.length)
    expect(tabs.map((t) => t.label)).toEqual(['Home', 'About', 'Expertise', 'Work', 'Experience', 'Architecture', 'CI/CD', 'Recognition', 'Affiliations', 'FAQ', 'Contact'])
    for (const t of tabs) expect(within(nav).getByRole('link', { name: t.label })).toHaveAttribute('href', `#${t.target}`)
  })

  it('marks the active tab with aria-current=location and updates when the hash changes', async () => {
    renderWithApp(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'location')
    window.location.hash = '#gti-north'
    fireEvent(window, new HashChangeEvent('hashchange'))
    await waitFor(() => expect(within(nav).getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'location'))
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
    window.location.hash = ''
  })

  it('shows the live scene label beside the burger (names the GTI scenes)', async () => {
    renderWithApp(<Navbar />)
    expect(screen.getByTestId('active-label')).toHaveTextContent('Home')
    window.location.hash = '#gti-main'
    fireEvent(window, new HashChangeEvent('hashchange'))
    await waitFor(() => expect(screen.getByTestId('active-label')).toHaveTextContent('GTI Main'))
    window.location.hash = ''
  })

  it('opens a right-anchored drawer with every scene, a close button and the current marker', async () => {
    const user = userEvent.setup()
    renderWithApp(<Navbar />)
    const burger = screen.getByRole('button', { name: 'Open navigation menu' })
    expect(burger).toHaveAttribute('aria-expanded', 'false')
    await user.click(burger)
    const drawer = await screen.findByRole('dialog')
    expect(drawer.className).toMatch(/right-0/)
    expect(drawer.className).toMatch(/h-dvh/)
    expect(drawer.className).toMatch(/70vw/)
    const mobile = within(drawer).getByRole('navigation', { name: 'Mobile' })
    const list = within(mobile).getAllByRole('list')[0]!
    expect(within(list).getAllByRole('link')).toHaveLength(scenes.length)
    expect(within(list).getByRole('link', { name: /Home/ })).toHaveAttribute('aria-current', 'location')
    expect(within(drawer).getByRole('button', { name: 'Close navigation menu' })).toBeInTheDocument()
  })

  it('closes the drawer with Escape and with the close button', async () => {
    const user = userEvent.setup()
    renderWithApp(<Navbar />)
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    await user.click(await screen.findByRole('button', { name: 'Close navigation menu' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('selecting a destination closes the drawer and updates the label immediately', async () => {
    const user = userEvent.setup()
    document.body.insertAdjacentHTML('beforeend', '<section id="faq"></section>')
    renderWithApp(<Navbar />)
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    const drawer = await screen.findByRole('dialog')
    await user.click(within(drawer).getByRole('link', { name: /FAQ/ }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByTestId('active-label')).toHaveTextContent('FAQ'))
    expect(window.location.hash).toBe('#faq')
    window.location.hash = ''
  })

  it('exposes a progress bar reflecting scene position', () => {
    renderWithApp(<Navbar />)
    const bar = screen.getByRole('progressbar', { name: 'Scene progress' })
    expect(bar).toHaveAttribute('aria-valuenow', '1')
    expect(bar).toHaveAttribute('aria-valuemax', String(scenes.length))
  })
})
