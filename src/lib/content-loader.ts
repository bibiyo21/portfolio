import { parseContent } from './content-parse'
import profileRaw from '../content/profile.yaml?raw'
import experienceRaw from '../content/experience.yaml?raw'
import educationRaw from '../content/education.yaml?raw'
import certificationsRaw from '../content/certifications.yaml?raw'
import awardsRaw from '../content/awards.yaml?raw'
import skillsRaw from '../content/skills.yaml?raw'
import projectsRaw from '../content/projects.yaml?raw'
import affiliationsRaw from '../content/affiliations.yaml?raw'
import philosophyRaw from '../content/philosophy.yaml?raw'
import cicdRaw from '../content/cicd.yaml?raw'
import faqRaw from '../content/faq.yaml?raw'

export const profile = parseContent('profile', profileRaw)
export const experience = parseContent('experience', experienceRaw)
export const education = parseContent('education', educationRaw)
export const certifications = parseContent('certifications', certificationsRaw)
export const awards = parseContent('awards', awardsRaw)
export const skills = parseContent('skills', skillsRaw)
export const projects = parseContent('projects', projectsRaw)
export const affiliations = parseContent('affiliations', affiliationsRaw)
export const philosophy = parseContent('philosophy', philosophyRaw)
export const cicd = parseContent('cicd', cicdRaw).cicd
export const faq = parseContent('faq', faqRaw)
