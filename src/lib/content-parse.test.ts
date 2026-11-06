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

  it('has a content file for every schema', () => {
    for (const name of Object.keys(contentSchemas)) expect(() => read(name)).not.toThrow()
  })
})

describe('parseContent errors', () => {
  it('reports YAML syntax errors with the file name', () => {
    expect(() => parseContent('faq', 'eyebrow: "unterminated\n  - [')).toThrow(/YAML syntax error in src\/content\/faq\.yaml/)
  })

  it('reports missing required fields with their path', () => {
    const broken = read('profile').replace(/^email:.*$/m, '')
    expect(() => parseContent('profile', broken)).toThrow(/Invalid content in src\/content\/profile\.yaml[\s\S]*email/)
  })

  it('rejects a malformed phone number', () => {
    const broken = read('profile').replace('phone: "+639174912048"', 'phone: "0917 491 2048"')
    expect(() => parseContent('profile', broken)).toThrow(/phone/)
  })

  it('rejects an invalid project status', () => {
    const broken = read('projects').replace('status: proposed', 'status: finished')
    expect(() => parseContent('projects', broken)).toThrow(/status/)
  })

  it('rejects invalid URLs in optional fields', () => {
    const yaml = `
categories: ["Web Platforms"]
items:
  - id: a
    name: A
    category: "Web Platforms"
    summary: s
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
      'groups:\n  - id: acme\n    company: Acme\n    roles:\n      - { id: a, title: Dev, period: "2020 – 2021" }\n',
    )
    const role = data.groups[0]!.roles[0]!
    expect(role.responsibilities).toEqual([])
    expect(role.achievements).toEqual([])
    expect(role.technologies).toEqual([])
    expect(role.summary).toBe('')
  })

  it('accepts an empty project collection and no family', () => {
    const data = parseContent('projects', 'categories: ["Web Platforms"]\nitems: []\n')
    expect(data.items).toEqual([])
    expect(data.family).toBeUndefined()
  })

  it('accepts empty affiliations, education, certifications and awards', () => {
    expect(parseContent('affiliations', 'items: []\n').items).toEqual([])
    expect(parseContent('education', 'items: []\n').items).toEqual([])
    expect(parseContent('certifications', 'items: []\n').items).toEqual([])
    expect(parseContent('awards', 'items: []\n').items).toEqual([])
  })

  it('defaults availability to empty and keeps the portrait optional', () => {
    const profile = parseContent('profile', read('profile'))
    expect(profile.availability).toBe('')
    expect(profile.portrait).toBeUndefined()
  })

  it('defaults skill category kind to confirmed', () => {
    const data = parseContent(
      'skills',
      `
intro: hi
categories:
  - id: c
    title: C
    icon: code
    description: d
    relation: r
    skills:
      - name: One
`,
    )
    expect(data.categories[0]!.kind).toBe('confirmed')
  })
})

describe('content can be extended without code changes', () => {
  it('defaults a project to client work and every optional case-study field to empty', () => {
    const data = parseContent('projects', `
categories: ["Web Platforms"]
items:
  - id: a
    name: A
    category: "Web Platforms"
    summary: s
`)
    const p = data.items[0]!
    expect(p.type).toBe('client')
    expect(p.statusLabel).toBe('')
    expect(p.features).toEqual([])
    expect(p.limitations).toEqual([])
    expect(p.thumbnail).toBeUndefined()
  })

  it('supports client, technical and personal project types and rejects any other', () => {
    const base = (type: string) => `categories: ["X"]\nitems:\n  - { id: a, name: A, category: X, summary: s, type: ${type} }\n`
    for (const type of ['client', 'technical', 'personal']) expect(parseContent('projects', base(type)).items[0]!.type).toBe(type)
    expect(() => parseContent('projects', base('commercial'))).toThrow(/type/)
  })

  it('parses an added project', () => {
    const added =
      read('projects') +
      `  - id: new-one
    name: "New Project"
    category: "Web Platforms"
    summary: "Added from YAML"
    thumbnail: { src: "/images/projects/x.svg", alt: "alt" }
`
    const data = parseContent('projects', added)
    expect(data.items.at(-1)?.name).toBe('New Project')
    expect(data.items.at(-1)?.theme).toBe('default')
  })

  it('parses an added skill category and an added FAQ entry', () => {
    const skills = parseContent(
      'skills',
      read('skills') +
        `  - id: extra
    title: "Extra"
    icon: "code"
    description: "d"
    relation: "r"
    skills:
      - name: "Thing"
`,
    )
    expect(skills.categories.at(-1)?.title).toBe('Extra')
    const faq = parseContent('faq', read('faq') + '  - { id: q, question: "Q?", answer: "A." }\n')
    expect(faq.items.at(-1)?.id).toBe('q')
  })

  it('parses an updated experience entry', () => {
    const data = parseContent('experience', read('experience').replace('title: "Solutions Architect"\n        period: "June 2026', 'title: "Principal Solutions Architect"\n        period: "June 2026'))
    expect(data.groups[0]!.roles[0]!.title).toBe('Principal Solutions Architect')
  })
})

describe('owner-supplied facts', () => {
  const roles = () =>
    parseContent('experience', read('experience')).groups.flatMap((g) => g.roles.map((r) => `${g.company}|${r.title}|${r.period}`))

  it('keeps every role and its period, preserving the overlaps', () => {
    expect(roles()).toEqual([
      'Leaptel|Solutions Architect|June 2026 – Present',
      'Leaptel|Senior Developer|December 2025 – June 2026',
      'Solutions30 Group SA|Solutions Architect|March 2019 – November 2025',
      'Eastvantage|Technical Lead|June 2021 – November 2023',
      'Eastvantage|PHP Developer|March 2019 – June 2021',
      'Gameloft Philippines Inc.|Web Developer (Intermediate)|October 2017 – April 2019',
      'Gameloft Philippines Inc.|Web Developer (Junior)|June 2016 – October 2017',
    ])
  })

  it('nests the Innovators Club chairmanship under Gameloft, not as a separate employer', () => {
    const aff = parseContent('affiliations', read('affiliations')).items[0]!
    expect(aff.parentCompany).toBe('gameloft')
    expect(aff.role).toBe('Chairman')
    expect(aff.period).toBe('November 2016 – April 2019')
    const ids = parseContent('experience', read('experience')).groups.map((g) => g.id)
    expect(ids).toContain(aff.parentCompany)
  })

  it('uses the latest contact details', () => {
    const p = parseContent('profile', read('profile'))
    expect(p.email).toBe('ibrahem.sotejo.dev@gmail.com')
    expect(p.phone).toBe('+639174912048')
    expect(p.links.whatsapp).toBe('https://wa.me/639174912048')
    expect(p.links.linkedin).toBe('https://www.linkedin.com/in/ibrahem-sotejo-511789103/')
    expect(p.links.github).toBe('https://github.com/bibiyo21')
    expect(p.location).toBe('Philippines')
  })

  it('lists the three certifications exactly as written and seven award entries', () => {
    expect(parseContent('certifications', read('certifications')).items.map((c) => c.name)).toEqual([
      'Certified SAFe 5 Agilist',
      'Certified SAFe 5 Architect',
      'Certified Lean Six Sigma White Belt',
    ])
    expect(parseContent('awards', read('awards')).items).toHaveLength(7)
  })

  it('includes the Venue Seat Planner as a personal proof of concept with the supplied URL', () => {
    const p = parseContent('projects', read('projects')).items.find((i) => i.id === 'venue-seat-planner')!
    expect(p.type).toBe('personal')
    expect(p.liveUrl).toBe('https://venue-seat-planner.vercel.app/')
    expect(p.statusLabel).toBe('Personal PoC')
    expect(parseContent('projects', read('projects')).categories).toContain('Personal Projects / Proof of Concept')
  })

  it('does not publish a residential address or invent outcomes', () => {
    const all = Object.keys(contentSchemas).map(read).join('\n').toLowerCase()
    for (const word of ['barangay', 'street', 'purok']) expect(all).not.toContain(word)
    const projects = parseContent('projects', read('projects'))
    for (const p of projects.items) expect(p.outcome).toEqual([])
  })

  it('keeps the exploration category separate from confirmed skills', () => {
    const { categories } = parseContent('skills', read('skills'))
    const exploring = categories.filter((c) => c.kind === 'exploration')
    expect(exploring).toHaveLength(1)
    expect(exploring[0]!.skills.map((s) => s.name)).toContain('Model Context Protocol (MCP)')
    const confirmed = categories.filter((c) => c.kind === 'confirmed').flatMap((c) => c.skills.map((s) => s.name))
    expect(confirmed).not.toContain('Model Context Protocol (MCP)')
  })

  it('has twelve FAQ entries and a neutral availability answer', () => {
    const faq = parseContent('faq', read('faq'))
    expect(faq.items).toHaveLength(12)
    const availability = faq.items.find((q) => q.id === 'availability')!
    expect(availability.answer).toBe('For project, consulting, or collaboration inquiries, please get in touch.')
  })

  it('marks GTI architecture details as proposed, not implemented', () => {
    const { items } = parseContent('projects', read('projects'))
    expect(items.map((i) => i.id)).toEqual(['gti-main', 'gti-north', 'venue-seat-planner'])
    for (const i of items.filter((x) => x.type === 'client')) for (const a of i.approach) expect(a.status).toBe('proposed')
  })
})
