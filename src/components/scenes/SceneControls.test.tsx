import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { scenes } from '../../lib/scenes'
import { renderWithApp } from '../../test/render'
import { SceneControls } from './SceneControls'

describe('SceneControls', () => {
  afterEach(() => {
    window.location.hash = ''
    document.body.innerHTML = ''
  })

  it('has one progress link per scene with the current one marked', () => {
    renderWithApp(<SceneControls />)
    const rail = screen.getByRole('navigation', { name: 'Scene progress' })
    expect(within(rail).getAllByRole('link')).toHaveLength(scenes.length)
    expect(within(rail).getByRole('link', { name: /Scene 1 of 12: Home/ })).toHaveAttribute('aria-current', 'location')
  })

  it('offers only Next on the first scene', () => {
    renderWithApp(<SceneControls />)
    expect(screen.queryByRole('link', { name: /Previous scene/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next scene: About' })).toHaveAttribute('href', '#about')
  })

  it('next and previous target the correct neighbouring scenes', async () => {
    const user = userEvent.setup()
    document.body.insertAdjacentHTML('beforeend', scenes.map((s) => `<section id="${s.id}"></section>`).join(''))
    document.querySelectorAll('section').forEach((s) => (s.scrollIntoView = () => {}))
    renderWithApp(<SceneControls />)
    await user.click(screen.getByRole('link', { name: 'Next scene: About' }))
    expect(window.location.hash).toBe('#about')
    expect(screen.getByRole('link', { name: 'Previous scene: Home' })).toHaveAttribute('href', '#home')
    expect(screen.getByRole('link', { name: 'Next scene: Expertise' })).toHaveAttribute('href', '#expertise')
  })
})
