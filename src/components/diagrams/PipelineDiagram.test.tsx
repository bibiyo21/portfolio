import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
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
    expect(screen.getByRole('heading', { name: 'From Code Commit to Production Deployment' })).toBeInTheDocument()
    expect(screen.getByText(/I value delivery practices that make software changes easier to validate/)).toBeInTheDocument()
  })

  it('shows the six stages named in the brief', () => {
    wrap(<CICDShowcase />)
    const names = screen.getAllByRole('button', { name: /^Stage \d+ of 6/ }).map((b) => b.getAttribute('aria-label'))
    expect(names).toHaveLength(6)
    expect(names[0]).toMatch(/Source Control/)
    expect(names[1]).toMatch(/Install and Validate/)
    expect(names[2]).toMatch(/Build/)
    expect(names[3]).toMatch(/Automated Tests/)
    expect(names[4]).toMatch(/Quality Gates/)
    expect(names[5]).toMatch(/Deployment/)
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

  it('only links to workflow files that exist in this repository', () => {
    wrap(<CICDShowcase />)
    const link = screen.getByRole('link', { name: /View on GitHub/ })
    expect(link).toHaveAttribute('href', 'https://github.com/bibiyo21/portfolio/blob/main/.github/workflows/ci-cd.yml')
    expect(existsSync(join(process.cwd(), github.workflow))).toBe(true)
    expect(existsSync(join(process.cwd(), gitlab.workflow))).toBe(true)
  })

  // Playwright is paused in CI (it slowed deploys) but stays in the showcase. This is the one allowed difference.
  const PAUSED = ['e2e-test']

  it('keeps the CI/CD content consistent with the real workflow files', () => {
    const gh = readFileSync(join(process.cwd(), github.workflow), 'utf8')
    for (const job of ['validate:', 'build:', 'unit-test:', 'preview-deploy:', 'production-deploy:']) expect(gh).toContain(`  ${job}`)
    const gl = readFileSync(join(process.cwd(), gitlab.workflow), 'utf8')
    for (const stage of ['validate', 'build', 'unit-test', 'deploy']) expect(gl).toContain(`  - ${stage}`)
  })

  it('only shows jobs missing from the workflow files when they are the known paused ones', () => {
    const gh = readFileSync(join(process.cwd(), github.workflow), 'utf8')
    const missing = github.jobs.map((j) => j.name).filter((name) => !gh.includes(`  ${name}:`))
    expect(missing).toEqual(PAUSED)
    expect(gh).not.toContain('  e2e-test:')
    // The Playwright tests themselves are still in the repo and run locally.
    expect(existsSync(join(process.cwd(), 'tests/playwright.config.ts'))).toBe(true)
  })

  it('does not claim a live or successful pipeline', () => {
    wrap(<CICDShowcase />)
    expect(screen.getByText(/Illustrative passing run/)).toBeInTheDocument()
    expect(screen.getByText(/not a live build status/)).toBeInTheDocument()
  })
})
