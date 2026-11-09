import * as Tabs from '@radix-ui/react-tabs'
import { ExternalLink } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import {
  faArrowRightArrowLeft,
  faCubes,
  faFileCode,
  faListOl,
  faRocket,
  faScrewdriverWrench,
  faShieldHalved,
  faSitemap,
} from '@fortawesome/free-solid-svg-icons'
import { FaIcon, platformIcon } from '../../lib/fa-icons'
import { PipelineDiagram } from '../diagrams/PipelineDiagram'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Accordion, type AccordionItem } from '../ui/Accordion'
import { Tag } from '../ui/Tag'
import { YamlCode } from '../diagrams/YamlCode'
import { cicd } from '../../lib/content-loader'
import type { CicdPlatform } from '../../lib/content-schemas'
import githubWorkflow from '../../../.github/workflows/ci-cd.yml?raw'
import gitlabWorkflow from '../../../.gitlab-ci.yml?raw'

// The examples are the real workflow files, so what is shown is what actually runs.
const workflowSource: Record<string, string> = {
  'github-actions': githubWorkflow,
  'gitlab-ci': gitlabWorkflow,
}

function uniqueTools(platform: CicdPlatform): string[] {
  return [...new Set(platform.stages.flatMap((s) => s.tools))]
}

function repoLink(platform: CicdPlatform): string | null {
  if (!cicd.repositoryUrl || !platform.branchPath) return null
  return `${cicd.repositoryUrl.replace(/\/$/, '')}/${platform.branchPath}`
}

/** Accordion and summary headings get a small icon so each block reads at a glance. */
function IconTitle({ icon, children }: { icon: IconDefinition; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3">
      <FaIcon icon={icon} className="size-4 shrink-0 text-peach" />
      {children}
    </span>
  )
}

function PlatformPanel({ platform }: { platform: CicdPlatform }) {
  const link = repoLink(platform)
  const source = workflowSource[platform.id]
  // The diagram and the two summaries stay visible. Reference detail sits in an accordion so the scene stays short.
  const details: AccordionItem[] = [
    {
      id: 'stages',
      title: <IconTitle icon={faListOl}>Stages</IconTitle>,
      label: 'Stages',
      content: (
        <ol className="list-decimal space-y-2 pl-5 marker:text-peach">
          {platform.stages.map((s) => (
            <li key={s.id}>
              <span className="text-ivory">{s.name}.</span> {s.description}
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: 'jobs',
      title: <IconTitle icon={faCubes}>Jobs</IconTitle>,
      label: 'Jobs',
      content: (
        <ul className="space-y-2">
          {platform.jobs.map((j) => (
            <li key={j.name}>
              <code className="font-mono text-sm text-peach">{j.name}</code> <span>{j.description}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'gates',
      title: <IconTitle icon={faShieldHalved}>Quality gates</IconTitle>,
      label: 'Quality gates',
      content: (
        <ul className="list-disc space-y-2 pl-5 marker:text-peach">
          {platform.qualityGates.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'tools',
      title: <IconTitle icon={faScrewdriverWrench}>Tools</IconTitle>,
      label: 'Tools',
      content: (
        <div className="flex flex-wrap gap-2">
          {uniqueTools(platform).map((t) => (
            <Tag key={t} variant="dark">
              {t}
            </Tag>
          ))}
        </div>
      ),
    },
  ]
  if (source)
    details.push({
      id: 'workflow',
      title: <IconTitle icon={faFileCode}>Workflow example</IconTitle>,
      label: 'Workflow example',
      content: (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <code className="font-mono text-sm text-peach">{platform.workflow}</code>
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw inline-flex min-h-11 items-center gap-2 text-sm text-peach"
              >
                View on {platform.id === 'github-actions' ? 'GitHub' : 'GitLab'}
                <ExternalLink className="size-4" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
          <YamlCode code={source} label={`${platform.name} workflow file`} />
        </div>
      ),
    })

  return (
    <div className="space-y-10">
      <PipelineDiagram platform={platform} legend={cicd.legend} />

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div>
            <h3 className="t-heading-s text-ivory">
              <IconTitle icon={faSitemap}>Pipeline architecture</IconTitle>
            </h3>
            <p className="mt-2 text-on-dark-soft">{platform.architecture}</p>
          </div>
          <div>
            <h3 className="t-heading-s text-ivory">
              <IconTitle icon={faRocket}>Deployment strategy</IconTitle>
            </h3>
            <p className="mt-2 text-on-dark-soft">{platform.deployment}</p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <Accordion items={details} multiple tone="dark" headingLevel={3} />
        </div>
      </div>
    </div>
  )
}

export function CICDShowcase() {
  const [platformId, setPlatformId] = useState(cicd.platforms[0]?.id ?? '')
  // The panels are long (diagram, accordion, YAML), so they do not switch on their own. Until the
  // visitor switches once, the other platform carries a pulsing dot and the hint says there is more.
  const [switched, setSwitched] = useState(false)
  const choose = (id: string) => {
    setPlatformId(id)
    setSwitched(true)
  }
  return (
    <Scene id="cicd" tone="deep" backdrop={<SceneBackdrop tone="deep" />}>
      <SectionHeading
        layout="split"
        index="08"
        eyebrow="CI/CD Engineering"
        id="cicd-title"
        title={cicd.title}
        intro={cicd.description}
        tone="dark"
      />
      {cicd.focus.length > 0 ? (
        <Reveal>
          <ul className="mb-12 flex flex-wrap gap-2" aria-label="CI/CD focus areas">
            {cicd.focus.map((f) => (
              <li key={f}>
                <Tag variant="dark">{f}</Tag>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Tabs.Root value={platformId} onValueChange={choose}>
        <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Tabs.List aria-label="CI/CD platform" className="inline-flex gap-1 rounded-full border border-ivory/15 p-1">
            {cicd.platforms.map((p) => (
              <Tabs.Trigger
                key={p.id}
                value={p.id}
                className="relative inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-on-dark-soft transition-colors hover:text-ivory data-[state=active]:bg-peach data-[state=active]:text-burgundy-dark"
              >
                <FaIcon icon={platformIcon(p.id)} className="size-4 shrink-0" />
                {p.name}
                {!switched && p.id !== platformId ? (
                  <span aria-hidden className="absolute right-1.5 top-1.5 flex size-2" data-testid="tab-pulse">
                    <span className="absolute inline-flex size-full rounded-full bg-peach motion-safe:animate-[ping-soft_1.6s_ease-out_infinite]" />
                    <span className="relative inline-flex size-2 rounded-full bg-peach" />
                  </span>
                ) : null}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {cicd.platforms.length > 1 ? (
            <p className="inline-flex items-center gap-2 text-sm text-on-dark-soft">
              <FaIcon icon={faArrowRightArrowLeft} className="size-4 text-peach" />
              {cicd.platforms.length} pipelines. Switch to compare them.
            </p>
          ) : null}
        </div>
        {cicd.platforms.map((p) => (
          <Tabs.Content key={p.id} value={p.id} className="outline-none">
            <PlatformPanel platform={p} />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Scene>
  )
}
