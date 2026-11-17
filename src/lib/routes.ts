// The site is a static, prerendered page set: the home page plus a case-studies index and one page per case study.
// There is no client router. Links to another page are plain anchors and the matching page is rendered from the path.

export const CASE_STUDIES_PATH = '/case-studies'

export type Route =
  | { kind: 'home' }
  | { kind: 'case-studies' }
  | { kind: 'case-study'; slug: string }

export const caseStudyPath = (slug: string) => `${CASE_STUDIES_PATH}/${slug}`

/** Maps a URL path to a page. Unknown paths fall back to the home page. */
export function parseRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === CASE_STUDIES_PATH) return { kind: 'case-studies' }
  const match = /^\/case-studies\/([a-z0-9-]+)$/.exec(path)
  if (match) return { kind: 'case-study', slug: match[1]! }
  return { kind: 'home' }
}
