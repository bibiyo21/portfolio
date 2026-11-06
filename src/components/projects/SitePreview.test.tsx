import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { projects } from '../../lib/content-loader'
import { renderWithApp } from '../../test/render'
import { SitePreview } from './SitePreview'

const main = projects.items.find((p) => p.id === 'gti-main')!
const north = projects.items.find((p) => p.id === 'gti-north')!

describe('SitePreview', () => {
  it('shows the desktop frame with the site host and a phone preview, both with descriptive alt text', () => {
    renderWithApp(<SitePreview project={main} dark />)
    const desktop = screen.getByTestId('desktop-preview')
    expect(within(desktop).getByText('goalietraininginstitute.ca')).toBeInTheDocument()
    const desktopImg = within(desktop).getByRole('img')
    expect(desktopImg).toHaveAttribute('src', '/images/projects/gti-main-desktop.webp')
    expect(desktopImg.getAttribute('alt')).toMatch(/Screenshot of the GTI Main homepage on desktop/)
    expect(desktopImg).toHaveAttribute('srcset', expect.stringContaining('720w'))
    const phoneImg = within(screen.getByTestId('mobile-preview')).getByRole('img')
    expect(phoneImg).toHaveAttribute('src', '/images/projects/gti-main-mobile.webp')
    expect(phoneImg.getAttribute('alt')).toMatch(/on a phone/)
  })

  it('uses different screenshots for GTI Main and GTI North', () => {
    expect(main.preview!.desktop.src).not.toBe(north.preview!.desktop.src)
    expect(main.preview!.mobile.src).not.toBe(north.preview!.mobile.src)
    expect(north.preview!.desktop.src).toContain('gti-north')
  })

  it('states when and how the screenshots were captured', () => {
    renderWithApp(<SitePreview project={north} dark={false} />)
    expect(screen.getByText(/captured 6 November 2026/)).toBeInTheDocument()
    expect(screen.getByText(/Desktop 1440 × 900, phone 390 × 844/)).toBeInTheDocument()
  })

  it('does not load the full-page images until the dialog is opened', () => {
    renderWithApp(<SitePreview project={main} dark />)
    expect(document.querySelector('img[src*="-full.webp"]')).toBeNull()
  })

  it('opens a dialog with the full desktop page, switches to mobile, and closes on Escape', async () => {
    const user = userEvent.setup()
    renderWithApp(<SitePreview project={main} dark />)
    await user.click(screen.getByRole('button', { name: /View full homepage/ }))
    const dialog = await screen.findByRole('dialog', { name: 'GTI Main homepage' })
    expect(within(dialog).getByRole('tab', { name: 'Desktop' })).toHaveAttribute('aria-selected', 'true')
    expect(within(dialog).getByRole('region', { name: /desktop homepage, scrollable/ })).toHaveAttribute('tabindex', '0')
    expect(dialog.querySelector('img[src*="gti-main-desktop-full.webp"]')).not.toBeNull()
    await user.click(within(dialog).getByRole('tab', { name: 'Mobile' }))
    expect(within(dialog).getByRole('region', { name: /mobile homepage, scrollable/ })).toBeInTheDocument()
    expect(dialog.querySelector('img[src*="gti-main-mobile-full.webp"]')).not.toBeNull()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
