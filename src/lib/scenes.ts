// Scene order, labels and tone. The single source of truth for the tabs,
// the mobile label, the drawer, the progress controls and the header surface.
export type SceneTone = 'dark' | 'deep' | 'ivory' | 'soft' | 'peach'

export interface SceneDef {
  id: string
  /** Short label used in the progress rail, the mobile label and the drawer. */
  label: string
  /** Desktop tab group this scene belongs to. */
  tab: string
  tone: SceneTone
}

export const scenes: readonly SceneDef[] = [
  { id: 'home', label: 'Home', tab: 'home', tone: 'dark' },
  { id: 'about', label: 'About', tab: 'about', tone: 'ivory' },
  { id: 'expertise', label: 'Expertise', tab: 'expertise', tone: 'soft' },
  { id: 'work', label: 'Work', tab: 'work', tone: 'ivory' },
  { id: 'gti-main', label: 'GTI Main', tab: 'work', tone: 'dark' },
  { id: 'gti-north', label: 'GTI North', tab: 'work', tone: 'peach' },
  { id: 'experience', label: 'Experience', tab: 'experience', tone: 'ivory' },
  { id: 'architecture', label: 'Architecture', tab: 'architecture', tone: 'dark' },
  { id: 'cicd', label: 'CI/CD', tab: 'cicd', tone: 'deep' },
  { id: 'recognition', label: 'Recognition', tab: 'experience', tone: 'soft' },
  { id: 'faq', label: 'FAQ', tab: 'faq', tone: 'ivory' },
  { id: 'contact', label: 'Contact', tab: 'contact', tone: 'dark' },
] as const

export interface TabDef {
  id: string
  label: string
  /** First scene of the group. The tab links here. */
  target: string
}

const tabLabels: Record<string, string> = {
  home: 'Home',
  about: 'About',
  expertise: 'Expertise',
  work: 'Work',
  experience: 'Experience',
  architecture: 'Architecture',
  cicd: 'CI/CD',
  faq: 'FAQ',
  contact: 'Contact',
}

export const tabs: readonly TabDef[] = Array.from(new Set(scenes.map((s) => s.tab))).map((id) => ({
  id,
  label: tabLabels[id] ?? id,
  target: scenes.find((s) => s.tab === id)!.id,
}))

export const isDarkTone = (tone: SceneTone): boolean => tone === 'dark' || tone === 'deep'

export const sceneIndex = (id: string): number => scenes.findIndex((s) => s.id === id)
