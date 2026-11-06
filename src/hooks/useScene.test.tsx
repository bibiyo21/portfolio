import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { scenes } from '../lib/scenes'
import { SceneProvider, useScene } from './useScene'

const wrapper = ({ children }: { children: ReactNode }) => <SceneProvider>{children}</SceneProvider>

describe('useScene', () => {
  afterEach(() => {
    window.location.hash = ''
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('starts on the first scene', () => {
    const { result } = renderHook(() => useScene(), { wrapper })
    expect(result.current.activeId).toBe(scenes[0]!.id)
    expect(result.current.activeIndex).toBe(0)
  })

  it('starts on the scene named in the URL hash (direct deep link)', () => {
    window.location.hash = '#architecture'
    const { result } = renderHook(() => useScene(), { wrapper })
    expect(result.current.activeId).toBe('architecture')
  })

  it('ignores a hash that is not a scene', () => {
    window.location.hash = '#nope'
    const { result } = renderHook(() => useScene(), { wrapper })
    expect(result.current.activeId).toBe('home')
  })

  it('goTo sets the active scene at once, pushes the hash and scrolls natively', () => {
    document.body.innerHTML = '<section id="faq"></section>'
    const el = document.getElementById('faq')!
    const scroll = vi.fn()
    el.scrollIntoView = scroll
    const { result } = renderHook(() => useScene(), { wrapper })
    act(() => result.current.goTo('faq'))
    expect(result.current.activeId).toBe('faq')
    expect(window.location.hash).toBe('#faq')
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }))
  })

  it('rapid clicks resolve to the last target', () => {
    document.body.innerHTML = '<section id="about"></section><section id="work"></section><section id="contact"></section>'
    document.querySelectorAll('section').forEach((s) => (s.scrollIntoView = vi.fn()))
    const { result } = renderHook(() => useScene(), { wrapper })
    act(() => {
      result.current.goTo('about')
      result.current.goTo('work')
      result.current.goTo('contact')
    })
    expect(result.current.activeId).toBe('contact')
    expect(window.location.hash).toBe('#contact')
  })

  it('does nothing for an unknown scene id', () => {
    const { result } = renderHook(() => useScene(), { wrapper })
    act(() => result.current.goTo('missing'))
    expect(result.current.activeId).toBe('home')
  })

  it('follows back/forward navigation through hashchange', () => {
    const { result } = renderHook(() => useScene(), { wrapper })
    act(() => {
      window.location.hash = '#recognition'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current.activeId).toBe('recognition')
  })
})
