import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button, ButtonLink } from './Button'
import { Img } from './Img'
import { SkillTag } from './SkillTag'
import { Tag } from './Tag'
import { YamlCode } from './YamlCode'

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(<Button loading>Send</Button>)
    const b = screen.getByRole('button', { name: 'Send' })
    expect(b).toBeDisabled()
    expect(b).toHaveAttribute('aria-busy', 'true')
  })

  it('renders a link variant with its href', () => {
    render(<ButtonLink href="#projects">Go</ButtonLink>)
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '#projects')
  })
})

describe('Img', () => {
  it('is lazy by default and eager with priority', () => {
    const { rerender } = render(<Img src="/a.svg" alt="A" />)
    expect(screen.getByAltText('A')).toHaveAttribute('loading', 'lazy')
    rerender(<Img src="/a.svg" alt="A" priority />)
    expect(screen.getByAltText('A')).toHaveAttribute('loading', 'eager')
  })
})

describe('Tag and SkillTag', () => {
  it('renders children', () => {
    render(<Tag>React</Tag>)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('marks areas of interest for assistive tech', () => {
    render(
      <ul>
        <SkillTag name="Rust" interest />
        <SkillTag name="PHP" interest={false} />
      </ul>,
    )
    expect(screen.getByText('(area of interest)')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('YamlCode', () => {
  const code = '# a comment\nname: "CI"\non:\n  push:\n    branches: [main]\nsteps:\n  - run: npm ci\n'

  it('renders every line and is keyboard focusable for scrolling', () => {
    render(<YamlCode code={code} label="workflow" />)
    const region = screen.getByRole('region', { name: 'workflow' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region.querySelectorAll('code > span')).toHaveLength(7)
  })

  it('highlights comments, keys and quoted strings differently', () => {
    render(<YamlCode code={code} label="workflow" />)
    expect(screen.getByText('# a comment')).toHaveClass('text-on-dark-mute')
    expect(screen.getByText('name')).toHaveClass('text-peach')
    expect(screen.getByText('"CI"')).toHaveClass('text-peach')
  })
})
