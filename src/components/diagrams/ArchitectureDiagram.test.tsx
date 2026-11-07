import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { philosophy } from '../../lib/content-loader'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { renderWithApp } from '../../test/render'

const wrap = () => renderWithApp(<ArchitectureDiagram />)

describe('ArchitectureDiagram', () => {
  it('renders a pressable node for every layer including the optional AI lane', () => {
    wrap()
    const nodes = screen.getAllByRole('button', { pressed: false }).concat(screen.getAllByRole('button', { pressed: true }))
    expect(nodes).toHaveLength(philosophy.diagram.nodes.length)
    expect(philosophy.diagram.nodes.some((n) => n.lane === 'ai')).toBe(true)
  })

  it('starts on the first layer and explains it', () => {
    wrap()
    const detail = screen.getByTestId('architecture-detail')
    expect(detail).toHaveTextContent('User Interfaces')
    expect(within(detail).getByText('Typical responsibilities')).toBeInTheDocument()
  })

  it('shows purpose, responsibilities and technologies when a node is clicked', async () => {
    const user = userEvent.setup()
    wrap()
    const node = philosophy.diagram.nodes.find((n) => n.id === 'data')!
    await user.click(screen.getByRole('button', { name: new RegExp(`^${node.label.replace(/[/]/g, '\\/')}`) }))
    const detail = screen.getByTestId('architecture-detail')
    expect(detail).toHaveTextContent(node.purpose)
    for (const t of node.technologies) expect(within(detail).getByText(t)).toBeInTheDocument()
    for (const r of node.responsibilities) expect(within(detail).getByText(r)).toBeInTheDocument()
  })

  it('names only documented work as examples, each linking to the scene that documents it', async () => {
    const user = userEvent.setup()
    wrap()
    const scenes = ['#work', '#gti-main', '#experience']
    for (const n of philosophy.diagram.nodes) {
      await user.click(screen.getByRole('button', { name: new RegExp(`^${n.label.replace(/[/]/g, '\\/')}`) }))
      const detail = screen.getByTestId('architecture-detail')
      expect(within(detail).queryAllByText('Where I have worked at this layer')).toHaveLength(n.examples.length > 0 ? 1 : 0)
      const linked = n.examples.filter((x) => typeof x !== 'string')
      for (const x of linked) {
        expect(scenes).toContain(x.href)
        expect(within(detail).getByRole('link', { name: x.text })).toHaveAttribute('href', x.href)
      }
    }
    // The optional AI lane has no delivery example, so it shows none.
    expect(philosophy.diagram.nodes.find((n) => n.lane === 'ai')!.examples).toEqual([])
  })

  it('labels the diagram as representative and supports keyboard selection', async () => {
    const user = userEvent.setup()
    wrap()
    expect(screen.getByText(/Representative architecture\. This is a general pattern/)).toBeInTheDocument()
    const ai = screen.getByRole('button', { name: /^AI Models/ })
    ai.focus()
    await user.keyboard('{Enter}')
    expect(ai).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('architecture-detail')).toHaveTextContent('Optional AI and automation lane')
  })

  it('offers a text alternative listing every layer', () => {
    const { container } = wrap()
    expect(container.querySelectorAll('ol.sr-only li')).toHaveLength(philosophy.diagram.nodes.length)
  })
})
