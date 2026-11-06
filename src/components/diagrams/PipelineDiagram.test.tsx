import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionConfig } from 'framer-motion'
import { describe, expect, it } from 'vitest'
import { cicd } from '../../lib/content-loader'
import { CICDShowcase } from '../sections/CICDShowcase'
import { PipelineDiagram } from './PipelineDiagram'

const github = cicd.platforms[0]!
const gitlab = cicd.platforms[1]!

const wrap = (ui: React.ReactElement) => render(<MotionConfig reducedMotion="always">{ui}</MotionConfig>)

describe('PipelineDiagram', () => {
  it('renders one pressable node per stage, the first selected', () => {
    wrap(<PipelineDiagram platform={github} />)
    const nodes = screen.getAllByRole('button', { name: /^Stage \d+ of \d+/ })
    expect(nodes).toHaveLength(github.stages.length)
    expect(nodes[0]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('stage-detail')).toHaveTextContent(github.stages[0]!.name)
  })

  it('shows description, tools, commands and output when a stage is clicked', async () => {
    const user = userEvent.setup()
    wrap(<PipelineDiagram platform={github} />)
    const stage = github.stages.find((s) => s.id === 'build')!
    await user.click(screen.getByRole('button', { name: new RegExp(stage.name.replace('&', '&')) }))
    const detail = screen.getByTestId('stage-detail')
    expect(detail).toHaveTextContent(stage.description)
    for (const tool of stage.tools) expect(within(detail).getByText(tool)).toBeInTheDocument()
    for (const cmd of stage.commands) expect(within(detail).getByText(cmd)).toBeInTheDocument()
    expect(detail).toHaveTextContent(stage.output)
  })

  it('supports keyboard selection', async () => {
    const user = userEvent.setup()
    wrap(<PipelineDiagram platform={github} />)
    const second = screen.getAllByRole('button', { name: /^Stage/ })[1]!
    second.focus()
    await user.keyboard('{Enter}')
    expect(second).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('CICDShowcase', () => {
  it('uses the YAML title and description', () => {
    wrap(<CICDShowcase />)
    expect(screen.getByRole('heading', { name: cicd.title })).toBeInTheDocument()
    expect(screen.getByText(/I design and improve CI\/CD pipelines/)).toBeInTheDocument()
  })

  it('switches between GitHub Actions and GitLab CI/CD', async () => {
    const user = userEvent.setup()
    wrap(<CICDShowcase />)
    expect(screen.getByRole('tab', { name: 'GitHub Actions' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('region', { name: /GitHub Actions workflow file/ })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'GitLab CI/CD' }))
    expect(screen.getByRole('tab', { name: 'GitLab CI/CD' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('region', { name: /GitLab CI\/CD workflow file/ })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Stage/ })).toHaveLength(gitlab.stages.length)
  })

  it('does not invent repository links while repositoryUrl is empty', () => {
    wrap(<CICDShowcase />)
    expect(cicd.repositoryUrl).toBe('')
    expect(screen.queryByRole('link', { name: /view on github/i })).not.toBeInTheDocument()
    expect(screen.getByText(/repositoryUrl is set/i)).toBeInTheDocument()
  })
})
