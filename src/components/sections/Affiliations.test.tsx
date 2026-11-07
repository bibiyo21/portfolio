import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { affiliations } from '../../lib/content-loader'
import { affiliationsSchema } from '../../lib/content-schemas'
import { scenes, tabs } from '../../lib/scenes'
import { renderWithApp } from '../../test/render'
import { Affiliations, LogoTile, visibleAffiliations } from './Affiliations'

const kora = affiliations.items.find((a) => a.id === 'kora-design-solutions')!

// SHA-256 of the profile picture downloaded from https://www.facebook.com/koradesignsolutions on 7 November 2026.
const KORA_LOGO_SHA256 = '943766b8b7d66a1a3084eb4ff4511e6d69dc7c93f6c8363ed852ef5906cdb96f'

describe('Affiliations content', () => {
  it('publishes Kora Design Solutions with its official Facebook page and logo', () => {
    expect(kora.published).toBe(true)
    expect(kora.verificationStatus).toBe('confirmed')
    expect(kora.links.facebook).toBe('https://www.facebook.com/koradesignsolutions')
    expect(kora.logo).toBe('/images/affiliations/kora-design-solutions-logo.jpg')
    expect(kora.logoAlt).toMatch(/Kora Design Solutions logo/)
    expect(kora.services).toEqual(['Graphic design', 'Web solutions', 'Creative service retainers'])
  })

  it('does not state a role, relationship or dates the owner has not supplied', () => {
    expect(kora.relationship).toBe('')
    expect(kora.role).toBe('')
    expect(kora.period).toBe('')
    expect(JSON.stringify(kora)).not.toMatch(/founder|owner|ceo|employee|partner/i)
  })

  it('serves the logo exactly as downloaded, unaltered', () => {
    const file = resolve(import.meta.dirname, '../../../public', kora.logo!.slice(1))
    expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(KORA_LOGO_SHA256)
  })

  it('is its own scene with a navigation tab between Recognition and FAQ', () => {
    const ids = scenes.map((s) => s.id)
    expect(ids.indexOf('affiliations')).toBe(ids.indexOf('recognition') + 1)
    expect(ids.indexOf('faq')).toBe(ids.indexOf('affiliations') + 1)
    expect(tabs.find((t) => t.id === 'affiliations')).toEqual({ id: 'affiliations', label: 'Affiliations', target: 'affiliations' })
  })

  it('never lists employer-nested items such as the Innovators Club in this scene', () => {
    expect(visibleAffiliations(affiliations.items, true).some((a) => a.parentCompany)).toBe(false)
  })
})

describe('Affiliations section', () => {
  it('renders a titled scene with the Kora card, logo, services and an accessible Facebook link', () => {
    renderWithApp(<Affiliations showDrafts={false} />)
    const scene = document.getElementById('affiliations')!
    expect(scene).toHaveAttribute('aria-labelledby', 'affiliations-title')
    expect(screen.getByRole('heading', { level: 2, name: 'Affiliations' })).toBeInTheDocument()

    const card = screen.getByRole('article', { name: 'Kora Design Solutions' })
    expect(within(card).getByRole('heading', { level: 3, name: 'Kora Design Solutions' })).toBeInTheDocument()
    expect(within(card).getByRole('heading', { level: 4, name: 'Services' })).toBeInTheDocument()
    expect(card).toHaveTextContent('Design and Web Solutions')
    expect(card).toHaveTextContent('creative studio based in the Philippines')
    expect(within(card).getAllByRole('listitem').map((li) => li.textContent)).toEqual(kora.services)

    const logo = within(card).getByRole('img', { name: /Kora Design Solutions logo/ })
    expect(logo).toHaveAttribute('src', '/images/affiliations/kora-design-solutions-logo.jpg')
    expect(logo).toHaveAttribute('width', '718')
    expect(logo).toHaveAttribute('height', '720')

    const link = within(card).getByRole('link', { name: /Visit Kora Design Solutions on Facebook\s+\(opens in a new tab\)/ })
    expect(link).toHaveAttribute('href', 'https://www.facebook.com/koradesignsolutions')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(card).not.toHaveTextContent('Draft')
    expect(card).not.toHaveTextContent('CONFIRM_WITH_OWNER')
  })

  it('shows a labelled, square placeholder when no logo file is configured', () => {
    const { container } = renderWithApp(<LogoTile item={{ ...kora, logo: undefined }} />)
    const pending = screen.getByRole('img', { name: 'Kora Design Solutions logo pending' })
    expect(pending).toHaveTextContent('Logo pending')
    expect(pending.className).toMatch(/aspect-square/)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('Affiliations schema', () => {
  const base = { id: 'x', name: 'X', description: 'A studio.', verificationStatus: 'confirmed', published: true }

  it('allows publishing without a stated relationship, role or dates', () => {
    expect(affiliationsSchema.safeParse({ items: [base] }).success).toBe(true)
  })

  it('rejects an unconfirmed entry, a placeholder, a missing description or a logo without alt text', () => {
    expect(affiliationsSchema.safeParse({ items: [{ ...base, verificationStatus: 'pending-owner-confirmation' }] }).success).toBe(false)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, relationship: 'CONFIRM_WITH_OWNER' }] }).success).toBe(false)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, period: 'CONFIRM_WITH_OWNER' }] }).success).toBe(false)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, description: '' }] }).success).toBe(false)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, logo: '/x.png' }] }).success).toBe(false)
  })

  it('keeps unpublished drafts valid so they can be previewed in development', () => {
    const draft = { ...base, relationship: 'CONFIRM_WITH_OWNER', verificationStatus: 'pending-owner-confirmation', published: false }
    expect(affiliationsSchema.safeParse({ items: [draft] }).success).toBe(true)
    expect(visibleAffiliations(affiliationsSchema.parse({ items: [draft] }).items, false)).toEqual([])
  })
})
