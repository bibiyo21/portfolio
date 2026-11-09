import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import {
  faArrowsSpin,
  faBagShopping,
  faBoxesStacked,
  faBrain,
  faBug,
  faCakeCandles,
  faChartColumn,
  faChartLine,
  faCircleNodes,
  faCubes,
  faCubesStacked,
  faFire,
  faInfinity,
  faMemory,
  faNetworkWired,
  faPlug,
  faPuzzlePiece,
  faTerminal,
  faVial,
  faCartShopping,
  faCircle,
  faCloud,
  faCode,
  faDatabase,
  faDiagramProject,
  faDisplay,
  faGaugeHigh,
  faGears,
  faLayerGroup,
  faRobot,
  faServer,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import {
  faAws,
  faDocker,
  faGitAlt,
  faGithub,
  faGitlab,
  faGoogle,
  faJs,
  faLaravel,
  faLinux,
  faNodeJs,
  faOpenai,
  faPhp,
  faPostgresql,
  faPython,
  faReact,
  faTypescript,
  faWordpress,
} from '@fortawesome/free-brands-svg-icons'
import type { SVGProps } from 'react'

/**
 * Renders a Font Awesome icon definition as a plain inline SVG. Only the path data is imported, so each
 * icon costs about a kilobyte and there is no runtime library or injected stylesheet.
 */
export function FaIcon({ icon, ...rest }: { icon: IconDefinition } & SVGProps<SVGSVGElement>) {
  const [w, h, , , path] = icon.icon
  return (
    <svg viewBox={`0 0 ${w} ${h}`} fill="currentColor" aria-hidden focusable="false" {...rest}>
      {(Array.isArray(path) ? path : [path]).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

// Skill categories name their icon in skills.yaml.
const skillIcons: Record<string, IconDefinition> = {
  code: faCode,
  server: faServer,
  database: faDatabase,
  cloud: faCloud,
  cart: faCartShopping,
  gauge: faGaugeHigh,
  sparkles: faWandMagicSparkles,
  network: faDiagramProject,
}
export const skillIcon = (key: string): IconDefinition => skillIcons[key] ?? faCircle

// Architecture layers, by node id in philosophy.yaml.
const layerIcons: Record<string, IconDefinition> = {
  users: faDisplay,
  frontend: faLayerGroup,
  backend: faServer,
  logic: faGears,
  data: faDatabase,
  ai: faRobot,
}
export const layerIcon = (id: string): IconDefinition => layerIcons[id] ?? faCircle

// CI/CD platforms, by platform id in cicd.yaml.
const platformIcons: Record<string, IconDefinition> = {
  'github-actions': faGithub,
  'gitlab-ci': faGitlab,
}
export const platformIcon = (id: string): IconDefinition => platformIcons[id] ?? faCode

// Individual skills, by their name in skills.yaml. Brand marks where Font Awesome has one,
// otherwise a glyph for what the tool does. Unknown names fall back to a code glyph.
const skillNameIcons: Record<string, IconDefinition> = {
  'JavaScript / Vanilla JavaScript': faJs,
  TypeScript: faTypescript,
  'React.js': faReact,
  'Single-SPA': faPuzzlePiece,
  'Micro-frontends': faCubes,
  'Webpack 4 and 5': faBoxesStacked,
  TurboRepo: faLayerGroup,
  PHP: faPhp,
  'Node.js': faNodeJs,
  Laravel: faLaravel,
  CakePHP: faCakeCandles,
  CodeIgniter: faFire,
  'Zend Framework': faCode,
  Python: faPython,
  Microservices: faCubesStacked,
  WebSockets: faPlug,
  MySQL: faDatabase,
  MariaDB: faDatabase,
  PostgreSQL: faPostgresql,
  Redis: faMemory,
  Docker: faDocker,
  AWS: faAws,
  'Linux / Ubuntu': faLinux,
  Git: faGitAlt,
  GitHub: faGithub,
  GitLab: faGitlab,
  'CI/CD': faInfinity,
  WordPress: faWordpress,
  WooCommerce: faBagShopping,
  PHPUnit: faVial,
  'Locust load testing': faChartLine,
  Sentry: faBug,
  Kibana: faChartColumn,
  'Generative AI': faWandMagicSparkles,
  'Prompt engineering': faTerminal,
  GPT: faOpenai,
  Gemini: faGoogle,
  DeepSeek: faBrain,
  'AI integration': faCircleNodes,
  'Model Context Protocol (MCP)': faNetworkWired,
  'Workflow automation': faArrowsSpin,
}
export const skillNameIcon = (name: string): IconDefinition => skillNameIcons[name] ?? faCode
