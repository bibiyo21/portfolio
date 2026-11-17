import App from './App'
import { CaseStudiesIndex } from './components/pages/CaseStudiesIndex'
import { CaseStudyPage } from './components/pages/CaseStudyPage'
import { projects } from './lib/content-loader'
import { parseRoute } from './lib/routes'

/** Picks the page for a URL path. Browser and prerender both go through here so the markup always matches. */
export default function Root({ path }: { path: string }) {
  const route = parseRoute(path)
  if (route.kind === 'case-studies' && projects.caseStudiesPage) return <CaseStudiesIndex />
  if (route.kind === 'case-study') {
    const project = projects.items.find((p) => p.caseStudy?.slug === route.slug)
    if (project) return <CaseStudyPage project={project} />
  }
  return <App />
}
