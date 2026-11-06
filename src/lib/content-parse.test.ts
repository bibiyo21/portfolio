import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseContent } from './content-parse'
import { contentSchemas, type ContentName } from './content-schemas'

const read = (name: string) => readFileSync(join(process.cwd(), 'src/content', `${name}.yaml`), 'utf8')

describe('YAML content files', () => {
  it.each(Object.keys(contentSchemas) as ContentName[])('%s.yaml is valid against its schema', (name) => {
    expect(() => parseContent(name, read(name))).not.toThrow()
  })
})

describe('parseContent errors', () => {
  it('reports YAML syntax errors with the file name', () => {
    expect(() => parseContent('skills', 'intro: "unterminated\n  - [')).toThrow(/YAML syntax error in src\/content\/skills\.yaml/)
  })

  it('reports missing required fields with their path', () => {
    const broken = read('profile').replace(/^name:.*$/m, '')
    expect(() => parseContent('profile', broken)).toThrow(/Invalid content in src\/content\/profile\.yaml[\s\S]*name/)
  })

  it('rejects invalid URLs in optional fields', () => {
    const yaml = `
categories: ["Web Development"]
items:
  - id: a
    name: A
    category: "Web Development"
    summary: s
    role: r
    thumbnail: { src: "/x.svg", alt: "x" }
    liveUrl: "not a url"
`
    expect(() => parseContent('projects', yaml)).toThrow(/liveUrl/)
  })
})

describe('optional fields and empty collections', () => {
  it('defaults missing optional experience fields', () => {
    const data = parseContent(
      'experience',
      'items:\n  - { id: a, company: Acme, position: Dev, period: "2020 – 2021" }\n',
    )
    const item = data.items[0]!
    expect(item.responsibilities).toEqual([])
    expect(item.achievements).toEqual([])
    expect(item.technologies).toEqual([])
    expect(item.description).toBe('')
  })

  it('accepts an empty project collection', () => {
    const data = parseContent('projects', 'categories: ["Web Development"]\nitems: []\n')
    expect(data.items).toEqual([])
  })

  it('accepts an empty affiliations collection', () => {
    expect(parseContent('affiliations', 'items: []\n').items).toEqual([])
  })

  it('defaults skill status to expertise and keeps interest entries distinct', () => {
    const data = parseContent(
      'skills',
      `
intro: hi
categories:
  - id: c
    title: C
    description: d
    icon: code
    skills:
      - name: One
      - { name: Two, status: interest }
`,
    )
    expect(data.categories[0]!.skills.map((s) => s.status)).toEqual(['expertise', 'interest'])
    expect(data.categories[0]!.visibleCount).toBe(6)
  })
})

describe('content can be extended without code changes', () => {
  it('parses an added project', () => {
    const base = read('projects')
    const added =
      base +
      `  - id: new-one
    name: "New Project"
    category: "Automation"
    summary: "Added from YAML"
    role: "Lead"
    thumbnail: { src: "/images/projects/x.svg", alt: "alt" }
`
    const data = parseContent('projects', added)
    expect(data.items.at(-1)?.name).toBe('New Project')
  })

  it('parses an added skill category', () => {
    const base = read('skills')
    const added =
      base +
      `  - id: extra
    title: "Extra Category"
    description: "Added"
    icon: "code"
    skills:
      - name: "Thing"
`
    const data = parseContent('skills', added)
    expect(data.categories.at(-1)?.title).toBe('Extra Category')
  })

  it('parses an updated experience entry', () => {
    const data = parseContent(
      'experience',
      read('experience').replace('position: "Solutions Architect"', 'position: "Principal Solutions Architect"'),
    )
    expect(data.items[0]?.position).toBe('Principal Solutions Architect')
  })
})

describe('provided career data', () => {
  it('keeps all six roles and their overlapping periods as supplied', () => {
    const { items } = parseContent('experience', read('experience'))
    expect(items.map((i) => `${i.company}|${i.position}|${i.period}`)).toEqual([
      'Leaptel|Solutions Architect|June 2026 – Present',
      'Leaptel|Senior Developer|December 2025 – June 2026',
      'Solutions30 Group SA|Solutions Architect|March 2019 – November 2025',
      'Eastvantage|Technical Lead|June 2021 – November 2023',
      'Eastvantage|PHP Developer|March 2019 – June 2021',
      'Gameloft|Intermediate Web Developer|Earlier experience',
    ])
  })

  it('includes all eleven skill categories and the CI/CD project category', () => {
    expect(parseContent('skills', read('skills')).categories).toHaveLength(11)
    expect(parseContent('projects', read('projects')).categories).toContain('CI/CD Engineering')
  })
})
