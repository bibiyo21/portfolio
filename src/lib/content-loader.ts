// Content is parsed and validated at build time by scripts/vite-content-plugin.ts, so this module only
// re-exports plain data. To change what the site says, edit the YAML files in src/content.
import raw from 'virtual:content'
import type { ContentData } from './content-schemas'

const content = raw as ContentData

export const profile = content.profile
export const experience = content.experience
export const education = content.education
export const certifications = content.certifications
export const awards = content.awards
export const skills = content.skills
export const projects = content.projects
export const affiliations = content.affiliations
export const philosophy = content.philosophy
export const cicd = content.cicd.cicd
export const faq = content.faq
