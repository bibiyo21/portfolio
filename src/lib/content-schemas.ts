import { z } from 'zod'

const imageRef = z.object({
  src: z.string().min(1),
  alt: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})
export type ImageRef = z.infer<typeof imageRef>

const nonEmpty = z.string().min(1)
const url = z.string().url()

export const profileSchema = z.object({
  name: nonEmpty,
  // Source data from the résumé. Never displayed.
  fullName: z.string().optional(),
  wordmark: nonEmpty,
  title: nonEmpty,
  descriptors: z.array(nonEmpty).default([]),
  location: nonEmpty,
  headline: z.array(nonEmpty).min(1),
  supportingLine: nonEmpty,
  intro: nonEmpty,
  email: z.string().email(),
  phone: z.string().regex(/^\+\d{8,15}$/, 'Use international format, e.g. +639174912048'),
  phoneDisplay: nonEmpty,
  links: z.object({ linkedin: url, github: url, whatsapp: url }),
  viber: z.string().optional(),
  seo: z.object({ title: nonEmpty, description: nonEmpty }),
  // Shown only when the owner confirms availability. Empty hides the indicator.
  availability: z.string().default(''),
  heroVisual: imageRef,
  // Only an approved real photo belongs here. No portrait means none is displayed.
  portrait: imageRef.optional(),
  about: z.object({
    eyebrow: nonEmpty,
    title: nonEmpty,
    lede: nonEmpty,
    paragraphs: z.array(nonEmpty).min(1),
    strengths: z.array(z.object({ title: nonEmpty, text: nonEmpty })).min(1),
    attributes: z.array(nonEmpty).default([]),
  }),
  capabilities: z.object({
    eyebrow: nonEmpty,
    title: nonEmpty,
    intro: nonEmpty,
    items: z
      .array(
        z.object({
          id: nonEmpty,
          title: nonEmpty,
          text: nonEmpty,
          technologies: z.array(nonEmpty).default([]),
          link: z.object({ label: nonEmpty, href: nonEmpty }).optional(),
        }),
      )
      .min(1),
  }),
  contact: z.object({
    eyebrow: nonEmpty,
    heading: nonEmpty,
    text: nonEmpty,
    modalTitle: nonEmpty,
    modalDescription: nonEmpty,
  }),
})
export type Profile = z.infer<typeof profileSchema>

export const experienceSchema = z.object({
  groups: z
    .array(
      z.object({
        id: nonEmpty,
        company: nonEmpty,
        roles: z
          .array(
            z.object({
              id: nonEmpty,
              title: nonEmpty,
              period: nonEmpty,
              summary: z.string().default(''),
              responsibilities: z.array(nonEmpty).default([]),
              achievements: z.array(nonEmpty).default([]),
              technologies: z.array(nonEmpty).default([]),
              // Editor-only note. Never displayed.
              internalNote: z.string().optional(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
})
export type ExperienceContent = z.infer<typeof experienceSchema>
export type ExperienceGroup = ExperienceContent['groups'][number]
export type ExperienceRole = ExperienceGroup['roles'][number]

export const affiliationsSchema = z.object({
  items: z.array(
    z.object({
      id: nonEmpty,
      name: nonEmpty,
      // Matches a group id in experience.yaml to nest the item under that company.
      parentCompany: z.string().optional(),
      role: nonEmpty,
      period: z.string().default(''),
      description: z.string().default(''),
      responsibilities: z.array(nonEmpty).default([]),
      logo: z.string().optional(),
      url: url.optional(),
    }),
  ),
})
export type AffiliationsContent = z.infer<typeof affiliationsSchema>
export type AffiliationItem = AffiliationsContent['items'][number]

export const educationSchema = z.object({
  items: z.array(
    z.object({ id: nonEmpty, institution: nonEmpty, program: nonEmpty, period: nonEmpty, note: z.string().optional() }),
  ),
})
export type EducationContent = z.infer<typeof educationSchema>

export const certificationsSchema = z.object({
  items: z.array(z.object({ id: nonEmpty, name: nonEmpty, issuer: z.string().optional() })),
})
export type CertificationsContent = z.infer<typeof certificationsSchema>

export const awardsSchema = z.object({
  items: z.array(
    z.object({ id: nonEmpty, title: nonEmpty, context: z.string().optional(), when: z.array(nonEmpty).min(1) }),
  ),
})
export type AwardsContent = z.infer<typeof awardsSchema>

export const projectStatus = z.enum(['implemented', 'in-progress', 'proposed', 'planned'])
export type ProjectStatus = z.infer<typeof projectStatus>

export const projectsSchema = z.object({
  family: z
    .object({ eyebrow: nonEmpty, title: nonEmpty, intro: nonEmpty, relationship: z.string().default('') })
    .optional(),
  categories: z.array(nonEmpty).min(1),
  items: z.array(
    z.object({
      id: nonEmpty,
      // id of the dedicated case-study scene, when the project has one.
      scene: z.string().optional(),
      theme: z.enum(['main', 'north', 'default']).default('default'),
      name: nonEmpty,
      siteLabel: z.string().default(''),
      category: nonEmpty,
      summary: nonEmpty,
      overview: z.string().default(''),
      context: z.string().default(''),
      role: z.array(nonEmpty).default([]),
      approach: z
        .array(z.object({ title: nonEmpty, text: nonEmpty, status: projectStatus }))
        .default([]),
      technologies: z.array(nonEmpty).default([]),
      challenges: z.array(z.object({ title: nonEmpty, text: nonEmpty })).default([]),
      // Verified results only. Empty hides the section.
      outcome: z.array(nonEmpty).default([]),
      thumbnail: imageRef,
      liveUrl: url.optional(),
      repoUrl: url.optional(),
    }),
  ),
})
export type ProjectsContent = z.infer<typeof projectsSchema>
export type ProjectItem = ProjectsContent['items'][number]

export const skillsSchema = z.object({
  intro: nonEmpty,
  categories: z
    .array(
      z.object({
        id: nonEmpty,
        title: nonEmpty,
        // `exploration` is shown separately and is not résumé-confirmed delivery experience.
        kind: z.enum(['confirmed', 'exploration']).default('confirmed'),
        icon: nonEmpty,
        description: nonEmpty,
        relation: nonEmpty,
        skills: z.array(z.object({ name: nonEmpty })).min(1),
      }),
    )
    .min(1),
})
export type SkillsContent = z.infer<typeof skillsSchema>
export type SkillCategory = SkillsContent['categories'][number]

export const philosophySchema = z.object({
  heading: nonEmpty,
  intro: nonEmpty,
  representativeNote: nonEmpty,
  principles: z.array(z.object({ title: nonEmpty, text: nonEmpty })).default([]),
  diagram: z.object({
    nodes: z
      .array(
        z.object({
          id: nonEmpty,
          lane: z.enum(['main', 'ai']),
          label: nonEmpty,
          purpose: nonEmpty,
          responsibilities: z.array(nonEmpty).default([]),
          technologies: z.array(nonEmpty).default([]),
          // Project examples, only when supported.
          examples: z.array(nonEmpty).default([]),
        }),
      )
      .min(2),
  }),
})
export type PhilosophyContent = z.infer<typeof philosophySchema>
export type DiagramNode = PhilosophyContent['diagram']['nodes'][number]

export const faqSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  intro: nonEmpty,
  closing: z.object({ title: nonEmpty, text: nonEmpty, label: nonEmpty }),
  items: z.array(z.object({ id: nonEmpty, question: nonEmpty, answer: nonEmpty })),
})
export type FaqContent = z.infer<typeof faqSchema>

export const cicdSchema = z.object({
  cicd: z.object({
    title: nonEmpty,
    description: nonEmpty,
    focus: z.array(nonEmpty).default([]),
    repositoryUrl: url.or(z.literal('')).default(''),
    legend: z.string().default(''),
    platforms: z
      .array(
        z.object({
          id: nonEmpty,
          name: nonEmpty,
          workflow: nonEmpty,
          branchPath: z.string().default(''),
          architecture: nonEmpty,
          deployment: nonEmpty,
          jobs: z.array(z.object({ name: nonEmpty, description: nonEmpty })).default([]),
          qualityGates: z.array(nonEmpty).default([]),
          stages: z
            .array(
              z.object({
                id: nonEmpty,
                name: nonEmpty,
                description: z.string().default(''),
                tools: z.array(z.string()).default([]),
                commands: z.array(z.string()).default([]),
                output: z.string().default(''),
              }),
            )
            .min(2),
        }),
      )
      .min(1),
  }),
})
export type CicdContent = z.infer<typeof cicdSchema>['cicd']
export type CicdPlatform = CicdContent['platforms'][number]
export type CicdStage = CicdPlatform['stages'][number]

export const contentSchemas = {
  profile: profileSchema,
  experience: experienceSchema,
  education: educationSchema,
  certifications: certificationsSchema,
  awards: awardsSchema,
  skills: skillsSchema,
  projects: projectsSchema,
  affiliations: affiliationsSchema,
  philosophy: philosophySchema,
  cicd: cicdSchema,
  faq: faqSchema,
} as const

export type ContentName = keyof typeof contentSchemas

export function formatZodError(name: string, error: z.ZodError): string {
  const lines = error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
  return `Invalid content in src/content/${name}.yaml\n${lines.join('\n')}`
}
