import { z } from 'zod'

const imageRef = z.object({
  src: z.string().min(1),
  alt: z.string(),
  // Optional responsive candidates, e.g. "/a-720.webp 720w, /a-1440.webp 1440w".
  srcSet: z.string().optional(),
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
  seo: z.object({
    title: nonEmpty,
    description: nonEmpty,
    siteUrl: z.string().regex(/^https:\/\/[a-z0-9.-]+$/, 'Use https://host with no trailing slash or path'),
    ogImage: z.string().startsWith('/'),
    ogImageAlt: nonEmpty,
  }),
  // Shown only when the owner confirms availability. Empty hides the indicator.
  availability: z.string().default(''),
  // Only an approved real photo belongs here. No portrait means none is displayed.
  portrait: imageRef.extend({ position: z.string().default('50% 50%') }).optional(),
  // Optional personal photos ("Beyond the build"). Hidden when absent.
  personalGallery: z
    .object({
      eyebrow: nonEmpty,
      title: nonEmpty,
      intro: z.string().default(''),
      items: z
        .array(
          imageRef.extend({
            alt: nonEmpty,
            width: z.number().int().positive(),
            height: z.number().int().positive(),
            category: nonEmpty,
            caption: nonEmpty,
            position: z.string().default('50% 50%'),
          }),
        )
        .max(3, 'Keep "Beyond the build" to three photos or fewer'),
    })
    .optional(),
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

const PLACEHOLDER = 'CONFIRM_WITH_OWNER'

export const affiliationsSchema = z.object({
  // Heading and intro of the Affiliations scene.
  section: z
    .object({ eyebrow: nonEmpty, title: nonEmpty, intro: z.string().default('') })
    .default({ eyebrow: 'Affiliations', title: 'Affiliations', intro: '' }),
  items: z.array(
    z
      .object({
        id: nonEmpty,
        name: nonEmpty,
        // Matches a group id in experience.yaml to nest the item under that company.
        parentCompany: z.string().optional(),
        role: z.string().default(''),
        // Optional owner-approved relationship wording, e.g. "Founder". Empty means no relationship is stated.
        relationship: z.string().default(''),
        period: z.string().default(''),
        // Short line the organisation uses about itself (e.g. the tagline in its own logo).
        tagline: z.string().default(''),
        location: z.string().default(''),
        description: z.string().default(''),
        responsibilities: z.array(nonEmpty).default([]),
        // Services the organisation itself publishes. Never inferred.
        services: z.array(nonEmpty).default([]),
        // The organisation's official logo file, unaltered. Never a redrawn or substitute mark.
        logo: z.string().optional(),
        logoAlt: z.string().optional(),
        logoWidth: z.number().int().positive().optional(),
        logoHeight: z.number().int().positive().optional(),
        url: url.optional(),
        links: z.object({ facebook: url.optional(), website: url.optional() }).default({}),
        verificationStatus: z.enum(['confirmed', 'pending-owner-confirmation']).default('confirmed'),
        // Unpublished items never appear on the production site.
        published: z.boolean().default(true),
      })
      .superRefine((a, ctx) => {
        if (!a.published) return
        if (a.verificationStatus !== 'confirmed')
          ctx.addIssue({ code: 'custom', path: ['published'], message: 'Only confirmed affiliations can be published' })
        if (!a.parentCompany && !a.description)
          ctx.addIssue({ code: 'custom', path: ['description'], message: 'A published affiliation needs a description' })
        if ([a.role, a.relationship, a.period, a.description].some((t) => t.includes(PLACEHOLDER)))
          ctx.addIssue({ code: 'custom', path: ['relationship'], message: `Replace ${PLACEHOLDER} before publishing` })
        if (a.logo && !a.logoAlt) ctx.addIssue({ code: 'custom', path: ['logoAlt'], message: 'A logo needs alt text' })
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

export const projectType = z.enum(['client', 'technical', 'personal'])
export type ProjectType = z.infer<typeof projectType>

export const projectsSchema = z.object({
  family: z
    .object({ eyebrow: nonEmpty, title: nonEmpty, intro: nonEmpty, relationship: z.string().default('') })
    .optional(),
  // Heading for personal side projects and proofs of concept, shown separately from client work.
  personal: z.object({ eyebrow: nonEmpty, title: nonEmpty, intro: nonEmpty }).optional(),
  categories: z.array(nonEmpty).min(1),
  items: z.array(
    z.object({
      id: nonEmpty,
      // id of the dedicated case-study scene, when the project has one.
      scene: z.string().optional(),
      // client = client work, technical = internal or technical initiative, personal = side project or proof of concept.
      type: projectType.default('client'),
      // Honest status label shown on the card and detail view, e.g. "Personal PoC". Empty hides it.
      statusLabel: z.string().default(''),
      // Extra framing chips, e.g. "Hobby project".
      tags: z.array(nonEmpty).default([]),
      // Label for the live-link button, e.g. "Open Demo".
      ctaLabel: z.string().default(''),
      theme: z.enum(['main', 'north', 'default']).default('default'),
      name: nonEmpty,
      siteLabel: z.string().default(''),
      category: nonEmpty,
      summary: nonEmpty,
      overview: z.string().default(''),
      context: z.string().default(''),
      // Case-study fields for personal projects. Anything empty is hidden, so only verified details ever show.
      motivation: z.string().default(''),
      intendedUsers: z.string().default(''),
      features: z.array(nonEmpty).default([]),
      decisions: z.array(z.object({ title: nonEmpty, text: nonEmpty })).default([]),
      limitations: z.array(nonEmpty).default([]),
      learned: z.array(nonEmpty).default([]),
      role: z.array(nonEmpty).default([]),
      approach: z
        .array(z.object({ title: nonEmpty, text: nonEmpty, status: projectStatus }))
        .default([]),
      technologies: z.array(nonEmpty).default([]),
      // Grouped technical specification (e.g. Frontend, Backend). Empty hides the section.
      techSpec: z.array(z.object({ group: nonEmpty, items: z.array(nonEmpty).min(1) })).default([]),
      // Extra screenshots with captions, shown in the detail dialog.
      gallery: z.array(imageRef.extend({ caption: z.string().default('') })).default([]),
      challenges: z.array(z.object({ title: nonEmpty, text: nonEmpty })).default([]),
      // Verified results only. Empty hides the section.
      outcome: z.array(nonEmpty).default([]),
      // Approved image. Optional: a project without one is shown as text.
      thumbnail: imageRef.optional(),
      // Real screenshots of the live site. When present they replace the illustrative artwork in the case-study scene.
      preview: z
        .object({
          capturedOn: nonEmpty,
          desktop: imageRef,
          mobile: imageRef,
          fullDesktop: imageRef,
          fullMobile: imageRef,
        })
        .optional(),
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
          // Examples of documented work. Plain text, or text with an in-page link to the scene that documents it.
          examples: z
            .array(z.union([nonEmpty, z.object({ text: nonEmpty, href: z.string().regex(/^#[a-z0-9-]+$/) })]))
            .default([]),
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

/** Every content file after parsing and validation, as served by the build-time content plugin. */
export type ContentData = { [N in ContentName]: z.output<(typeof contentSchemas)[N]> }
