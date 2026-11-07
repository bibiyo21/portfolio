import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { affiliations } from '../../lib/content-loader'
import { affiliationsSchema } from '../../lib/content-schemas'
import { renderWithApp } from '../../test/render'
import { Affiliations, visibleAffiliations } from './Affiliations'

const kora = affiliations.items.find((a) => a.id === 'kora-design-solutions')!

describe('Affiliations', () => {
  it('keeps Kora Design Solutions unpublished until the owner confirms it', () => {
    expect(kora.published).toBe(false)
    expect(kora.verificationStatus).toBe('pending-owner-confirmation')
    expect(kora.logo).toBeUndefined()
    expect(kora.links.facebook).toBe('https://www.facebook.com/koradesignsolutions')
  })

  it('renders nothing in production while no standalone affiliation is published', () => {
    const { container } = renderWithApp(<Affiliations showDrafts={false} />)
    expect(container).toBeEmptyDOMElement()
    expect(visibleAffiliations(affiliations.items, false)).toEqual([])
  })

  it('previews drafts in development, labelled, without the placeholder relationship or a logo', () => {
    renderWithApp(<Affiliations showDrafts />)
    const section = screen.getByTestId('affiliations')
    expect(section).toHaveTextContent('Kora Design Solutions')
    expect(section).toHaveTextContent('Draft · not published')
    expect(section).not.toHaveTextContent('CONFIRM_WITH_OWNER')
    expect(section.querySelector('img')).toBeNull()
    expect(screen.getByRole('link', { name: /Kora Design Solutions on Facebook/ })).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('never lists employer-nested items such as the Innovators Club here', () => {
    expect(visibleAffiliations(affiliations.items, true).some((a) => a.parentCompany)).toBe(false)
  })

  it('rejects publishing an unconfirmed entry, a placeholder relationship or a logo without alt text', () => {
    const base = { id: 'x', name: 'X', relationship: 'Affiliated with', verificationStatus: 'confirmed', published: true }
    expect(affiliationsSchema.safeParse({ items: [base] }).success).toBe(true)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, verificationStatus: 'pending-owner-confirmation' }] }).success).toBe(false)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, relationship: 'CONFIRM_WITH_OWNER' }] }).success).toBe(false)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, logo: '/x.png' }] }).success).toBe(false)
    expect(affiliationsSchema.safeParse({ items: [{ ...base, relationship: '' }] }).success).toBe(false)
  })
})
