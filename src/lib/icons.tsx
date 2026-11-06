import {
  Bot,
  Briefcase,
  CreditCard,
  Database,
  Gauge,
  Globe,
  Cloud,
  Code2,
  GitBranch,
  Layers,
  Mail,
  Network,
  Plug,
  Server,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Wrench,
} from 'lucide-react'
import type { ComponentType } from 'react'

type IconProps = { className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }
type IconComponent = ComponentType<IconProps>

// lucide-react v1 dropped brand icons, so these two are inline.
export const GithubIcon: IconComponent = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)
export const LinkedinIcon: IconComponent = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)

const registry: Record<string, IconComponent> = {
  bot: Bot,
  briefcase: Briefcase,
  card: CreditCard,
  cart: ShoppingCart,
  cloud: Cloud,
  code: Code2,
  database: Database,
  gauge: Gauge,
  git: GitBranch,
  github: GithubIcon,
  globe: Globe,
  js: Code2,
  layers: Layers,
  linkedin: LinkedinIcon,
  mail: Mail,
  network: Network,
  php: Code2,
  plug: Plug,
  react: Code2,
  server: Server,
  shield: ShieldCheck,
  sparkles: Sparkles,
  wrench: Wrench,
}

export function getIcon(name: string): IconComponent {
  return registry[name] ?? Sparkles
}
