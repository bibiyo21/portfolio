# DESIGN.md: Ibrahem Sotejo Portfolio Design System

Single source of truth for the visual identity. Every React component reads its colours, type, spacing, radii, motion, and behaviour from this file (implemented as tokens in `src/styles/globals.css` and `src/lib/animations.ts`). If a value is not defined here, add it here first, then use it.

**Identity:** a cinematic, scene-by-scene personal presentation for a Solutions Architect. Burgundy ink on warm ivory paper, peach as the warm highlight. Serif-led type, generous whitespace, slow eased motion. Premium and editorial, grounded and credible, never agency-generic.

**Experience model:** the page is a sequence of near-full-viewport *scenes* on native scroll with CSS Scroll Snap, plus a sticky tab navigation. Visitors either scroll through the scenes or jump directly. Both use the same native anchor navigation and the same active-scene state. Nothing hijacks the wheel or touch.

**Reference and sources reviewed**
- Visual/interaction reference `ssaway.com/website-design`: only the page text was inspectable in this environment (no CSS, images or script). Observed patterns taken as inspiration only: small eyebrow labels above headings, numbered items, a closing FAQ followed by a strong CTA, a prominent primary CTA, work shown with real screens. No code, layout, copy, brand or assets are copied.
- Installed `awesome-design-md` references `claude` and `notion` (warm paper canvas, serif/sans split, whisper hairlines, tracking that tightens with size) adapted into an original system.

## 1. Color Tokens

### Core palette (fixed brand values)
| Token | Hex | Name | Role |
|---|---|---|---|
| `--color-burgundy` | `#581C35` | Burgundy | Primary brand, primary button, links, key emphasis |
| `--color-burgundy-dark` | `#3D1426` | Dark Burgundy | Dark sections, button pressed, text on peach |
| `--color-peach` | `#F5C6AD` | Peach | Highlights, accents on dark, marker underline, selected states |
| `--color-peach-soft` | `#FBE5D9` | Soft Peach | Tinted sections, card fills, tag fills, hover fills |
| `--color-ivory` | `#FFF8F2` | Warm Ivory | Page canvas, text on dark |
| `--color-charcoal` | `#252126` | Charcoal | Primary text on light |

### Derived tokens (only these may be derived from the core palette)
| Token | Hex | Role |
|---|---|---|
| `--color-burgundy-hover` | `#6E2542` | Primary hover, focus ring |
| `--color-burgundy-deep` | `#2A0D1A` | Footer base, deepest overlay scrim |
| `--color-ink-soft` | `#5A4F56` | Secondary text |
| `--color-ink-mute` | `#6B6067` | Captions, metadata (4.5:1+ on ivory) |
| `--color-line` | `#EBD9CE` | Default hairline border |
| `--color-line-strong` | `#DCC3B5` | Input borders, emphasised dividers |
| `--color-on-dark-soft` | `#DCC5BA` | Secondary text on dark |
| `--color-on-dark-mute` | `#A58C86` | Metadata on dark |
| `--color-success` | `#4F6B4A` | Success feedback (always with icon) |
| `--color-danger` | `#B3261E` | Error feedback (always with icon and message) |

### Usage rules
- Canvas is `ivory`. Alternate with `peach-soft` sections. One `burgundy-dark` section for contrast.
- Text on light: `charcoal`, `ink-soft`, `ink-mute`. Text on dark: `ivory`, `on-dark-soft`, `on-dark-mute`.
- One burgundy primary action per viewport. Other actions are outline or text links.
- Peach is never used for small text on light backgrounds. Use it for fills, and for text/accents on dark.
- Pure white and pure black are not used, except white for input fields.
- Gradients are subtle: radial peach wash behind the hero (<= 55% opacity), burgundy to dark-burgundy linear on dark sections and the diagram. Never multi-hue.
- Contrast: `charcoal` on `ivory` 15:1+, `burgundy` on `ivory` 11:1+, `ivory` on `burgundy` 11:1+, `burgundy-dark` on `peach` 9:1+.

---

## 2. Typography

| Role | Family | Fallback |
|---|---|---|
| Display / Headings | **Fraunces** (variable, `opsz`) | `Georgia, serif` |
| UI / Body | **Inter** (variable) | `system-ui, sans-serif` |
| Labels / Index | Inter, uppercase, tracked (no third family) | n/a |

Fonts are self-hosted through `@fontsource-variable/*`, `font-display: swap`.

| Style | Font | Size (fluid) | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Display XL (hero) | Fraunces | `clamp(2.15rem, 4.6vw, 4rem)` | 400 | 0.98 | -0.03em |
| Display L (section title) | Fraunces | `clamp(2.25rem, 5vw, 4.25rem)` | 400 | 1.05 | -0.02em |
| Heading M (project/role) | Fraunces | `clamp(1.5rem, 2.8vw, 2.5rem)` | 400 | 1.1 | -0.015em |
| Heading S (card) | Fraunces | `1.5rem` | 450 | 1.2 | -0.01em |
| Lede | Fraunces italic | `clamp(1.2rem, 1.8vw, 1.5rem)` | 300 | 1.4 | -0.005em |
| Body L | Inter | `1.125rem` | 400 | 1.65 | 0 |
| Body | Inter | `1rem` | 400 | 1.65 | 0 |
| UI (buttons, nav) | Inter | `0.9375rem` | 500 | 1.2 | 0.005em |
| Caption | Inter | `0.8125rem` | 400 | 1.5 | 0.01em |
| Eyebrow | Inter uppercase | `0.75rem` | 500 | 1.3 | 0.14em |

Principles: serif speaks, sans serves. Headlines stay at 400-450 weight. Emphasis uses italic, burgundy colour, or a peach marker underline, at most one accent per headline. Reading measure 62-68ch. Tabular numerals for dates and counters. `text-wrap: balance` on headings.

---

## 3. Spacing

8px base scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192`.

| Token | Value | Use |
|---|---|---|
| `--section-y` | `clamp(5rem, 12vw, 10rem)` | Section vertical padding |
| `--gutter` | `clamp(1.25rem, 4vw, 3rem)` | Page side padding |
| Title to content | 48-64px | Below section headers |
| Card padding | 24px mobile / 32px desktop | Cards, modal body |
| Stack gaps | 8 / 16 / 24 / 32 | Within components |

Radius scale: `4px` marks · `12px` inputs, thumbnails · `20px` cards · `28px` feature plates, modals, portrait · `999px` buttons, chips.

---

## 4. Scene Presentation and Layout Grids

### Scenes
Each scene is a semantic `<section>` with a stable `id`, `data-scene`, `aria-labelledby`, `min-height: 100svh` (never a clipping fixed height) and `scroll-snap-align: start`. Content taller than the viewport simply grows the scene.

| # | id | Tab group | Tone | Content |
|---|---|---|---|---|
| 1 | `home` | Home | dark | Hero. Staggered headline, architectural geometry at depth |
| 2 | `about` | About | ivory | Biography, three strengths, layered shapes |
| 3 | `expertise` | Expertise | soft peach | Capability pillars and categorised skills |
| 4 | `work` | Work | ivory | Featured work, GTI family entry cards |
| 5 | `gti-main` | Work | dark | GTI Main case study |
| 6 | `gti-north` | Work | peach | GTI North case study, visually distinct |
| 7 | `experience` | Experience | ivory | Career timeline |
| 8 | `architecture` | Architecture | dark | Interactive SVG architecture diagram |
| 9 | `cicd` | CI/CD | deep | Pipeline showcase |
| 10 | `recognition` | Experience | soft peach | Education, certifications, awards |
| 11 | `faq` | FAQ | ivory | Accordion |
| 12 | `contact` | Contact | dark | Closing CTA and contact methods |

Scene rhythm alternates light and dark so each scene reads as its own room. Scenes may combine related content and must not repeat the same biography.

### Snap and scroll behaviour
- `html { scroll-snap-type: y mandatory }` only on fine-pointer, hover-capable screens at 1024px and wider. Elsewhere `y proximity`. The browser still lets users scroll freely inside a scene taller than the viewport.
- Native wheel, trackpad, touch, Page Up/Down, Space, Home/End and arrows are untouched. No wheel or touch interception.
- `scroll-behavior: smooth` (auto when reduced motion is requested). Header height is a token `--nav-h` (60px mobile, 72px desktop). Scenes pad their own top by `--nav-h` so headings never sit under the header.
- One IntersectionObserver-driven active-scene state feeds the tabs, the mobile label, the progress control and animation triggers. Tab clicks use native hash navigation with `history.pushState`, so back/forward and direct links work. A short lock after a click stops the observer from fighting the target during the scroll.

### Grid
- 12 columns, container `max-width: 1320px`, side padding `--gutter`, gap 24px (16px mobile). Prose max 68ch.
- Asymmetry by default (text 1-7 and media 8-12, mirrored later). No identical three-card rows repeated down the page.
- Scene controls (progress dots, prev/next) sit in the right gutter on desktop and must never overlap content or focus.

## 5. Components and Navigation

### Navigation (desktop tabs, 1080px and wider)
- Fixed header, `--nav-h` tall. Surface follows the active scene tone: on light scenes `ivory @ 88%` with blur and a hairline, on dark scenes `burgundy-dark @ 82%` with blur and ivory text. The colour transition takes 300ms so the active tab is always legible.
- Left: wordmark in Fraunces. Right: tabs Home, About, Expertise, Work, Experience, Architecture, CI/CD, FAQ, Contact. Below 1080px (tablets, portrait and landscape, and phones) the header uses the compact burger pattern instead, because nine tab labels do not fit comfortably; the choice is by available width, never by device.
- Active tab: a sliding pill (Framer `layoutId`, 350ms) plus `aria-current="location"`. The pill is not the only signal: the active label is also heavier (500 vs 400 weight) and has an underline dot.
- States: default, hover (colour shift), focus-visible (2px ring), active, pressed (`translateY(1px)`).
- Tabs are real links to scene ids. A tab group stays active across its scenes (Work covers GTI Main and GTI North).

### Navigation (compact, below 1080px)
- Compact header. Right edge: burger button (44x44 minimum). Immediately to its left: the live active-scene label (truncates with an ellipsis, never pushes the burger off screen). Wordmark at left.
- A 2px progress bar sits under the header.
- Burger opens a **right-side drawer**: `height: 100dvh` (100vh fallback), `width: clamp(260px, 70vw, 420px)`, anchored right, slides in from the right over 450ms `ease-out`. The remaining ~30% on the left is a dimmed backdrop (`burgundy-deep @ 55%`, light blur) through which the live scene stays visible. Safe-area insets are respected on all sides.
- Drawer content: close button at top-right, a prominent current-scene indicator, large links (min 52px tall) with an active marker, optional secondary links (email, LinkedIn, GitHub, WhatsApp). Internal scrolling when content overflows. Background scroll is locked while open.
- Closes on backdrop tap, close button, burger toggle, Escape, or selecting a destination. Focus moves into the drawer, is trapped while open, and returns to the burger on close.
- Reduced motion: drawer fades in place without sliding.

### Scene controls
- Desktop: slim vertical progress rail on the right with a dot per scene (tooltip-style label on hover and focus, `aria-current`), plus discreet previous/next buttons at the bottom right.
- Mobile: only the compact progress bar. Prev/next hidden.
- Both are links/buttons to the same scene ids as the tabs.

### Skip link and Contact
Skip-to-content link is the first tab stop. The Contact tab and the hero "Let's Connect" CTA are always one action away. The contact modal opens from every inquiry CTA.

### Section heading
Eyebrow (`03 — Expertise`, small tracked caps), hairline rule, Display L title. Numbers come from scene order.

### Tags and chips
Radius 999px, padding `4px 12px`, 12px uppercase tracked. Default `peach-soft` with `burgundy-dark` text. Outline: `1px line-strong`. Dark variant: `ivory @ 10%` with peach text. Status chips (below) reuse this shape.

### Status chips (case studies)
`Implemented`, `In progress`, `Proposed / designed`, `Planned`. Each has an icon plus text, never colour alone. Colours stay inside the palette (burgundy fill, peach fill, outline, dashed outline respectively).

### Inputs
White background, `1px line-strong`, radius 12px, padding `14px 16px`, 16px text. Labels above. Focus: border `burgundy-hover` plus `0 0 0 4px rgba(88,28,53,.14)`. Error: border `danger` with icon and message and `aria-describedby`.

### FAQ accordion
- Strong Display L heading, short intro, spacious list separated by hairlines (not boxed cards).
- Each row: a full-width semantic `<button>` (min height 64px, 72px on desktop) with `aria-expanded` and `aria-controls`, question in Heading S, plus/minus indicator that rotates 90 degrees on open. Hover tints the row `peach-soft`; focus-visible ring.
- Answer panel is a `role="region"` labelled by its button. It animates height and opacity (450ms `ease-out`), stays in the DOM semantics, and the scene grows naturally.
- Single-open by default, via a `multiple` prop on the component.
- Closing CTA: "Still have a question?" with a primary button to the Contact scene.

### Timeline (experience)
Vertical hairline with a burgundy node per role, drawn on scroll. Company groups contain role rows (title, period, optional detail). Roles without supplied details show only title and period, with no placeholder text. Overlapping periods are shown exactly as supplied. Gameloft shows Junior and Intermediate stages; the Innovators' Club chairmanship is a nested leadership item.

### Recognition scene
Three columns on desktop: Education (one card), Certifications (list), Awards (compact timeline by year). No logos or certificate imagery.

### Architecture diagram
Representative architecture, labelled as such. Flow: User Interfaces, Frontend Applications, Backend Services / APIs, Business Logic and Integrations, Data Stores / External Systems, with an AI Models / AI Services lane connected to Application Services / Tools. Nodes are buttons. Selecting one shows purpose, typical responsibilities, relevant technologies from the skills list, and project examples only when supported. Animated directional dashes on connectors; active node highlighted and connectors emphasised. Horizontal on wide screens, vertical on narrow.

### CI/CD pipeline
Six stage nodes (Source Control, Dependency Installation and Validation, Build, Automated Tests, Quality Gates, Deployment), GitHub Actions and GitLab CI/CD tabs, a detail panel with description, tools, example commands and expected output. Vertical flow below 1024px. The legend states that it is an illustrative passing run, not live build status.

## 6. Buttons

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| Primary | `burgundy` | `ivory` | none | The one main action per view |
| Secondary | transparent | `charcoal` | `1px line-strong` | Secondary action |
| Ghost / Link | none | `burgundy` | none | Inline actions, animated underline |
| On dark | `peach` | `burgundy-dark` | none | Primary inside dark sections |
| On dark outline | transparent | `ivory` | `1px ivory @ 35%` | Secondary inside dark sections |

Shape and size: radius 999px, min-height 48px, padding `14px 28px`, trailing icon gap 10px. Hover primary: fill to `burgundy-hover`, arrow moves 4px right. Hover secondary: fill `peach-soft`, border `charcoal`. Active: `translateY(1px)`, fill `burgundy-dark`. Focus-visible: `outline 2px burgundy-hover`, offset 3px (on dark: `peach`). Disabled: 45% opacity. Loading: spinner replaces icon, label stays, button disabled.

---

## 7. Cards

- **Project plate:** `peach-soft` fill, `1px line`, radius 28px for feature plates and 20px for standard. Media on top (aspect 4:3 or 3:2, clipped), then mono-style index (`01`), title (Heading M), one-line description, tag row. Hover: image scales to 1.04 (700ms), arrow chip appears top-right, title to `burgundy`. No lift, no heavy shadow.
- **Experience card:** ivory, 20px radius, role plus company plus period always visible, details expandable.
- **Affiliation card:** logo tile centred on `peach-soft`, name, relationship, hover border `burgundy` and logo tile to `peach`.
- **Philosophy principle:** on dark, `burgundy-dark` to slightly lighter fill, `1px ivory @ 12%` border, radius 20px.
- Card shadow (floating UI only): `0 1px 2px rgba(61,20,38,.05), 0 12px 32px rgba(61,20,38,.08)`.

---

### Case-study treatments
- **GTI Main:** `burgundy-dark` scene, ivory text, peach accents, large framed hero visual with a burgundy/peach interface motif, wide editorial layout (visual left, content right).
- **GTI North:** `peach` scene with `burgundy-dark` text, ivory cards, a cool-leaning geometric motif (contour lines suggesting a map), mirrored layout (content left, visual right). Shares the family header and a "Main to North" relationship strip so the two read as related but distinct.
- Both end with the same section order: Overview, Context, Role and contribution, Architecture and approach (with status chips), Technology, Challenges and decisions, Outcome (only when the owner supplies verified results), Links (only verified public URLs). Images are labelled illustrative until real screenshots are supplied.

## 8. Modal Styles

Used for Contact ("Let's Start a Conversation") and Project detail. Built on Radix Dialog for focus trap, `Esc`, labelled title and description.

- **Overlay:** `rgba(42,13,26,.62)` with `backdrop-blur(6px)`. Click outside closes. Body scroll locked while open.
- **Panel (desktop):** `ivory`, radius 28px, centred, `max-width` 560px (contact) or 960px (project), padding 40px, floating shadow, max height `90dvh` with internal scroll.
- **Panel (mobile < 768px):** bottom sheet, full width, radius 28px top corners only, padding 24px, max height `92dvh`, drag handle bar (40x4, `line-strong`) at top.
- **Header:** Heading M title, Body description in `ink-soft`, 44px circular close button top-right (`peach-soft` fill, hover `peach`).
- **Footer actions:** primary button (submit) plus ghost "Close".
- **Feedback:** inline success/error panel inside the modal, `role="status"` / `role="alert"`, icon plus text.
- **Motion:** overlay fade 250ms. Panel `opacity 0, y 24, scale .98` to `1` over 400ms `ease-out`. Mobile sheet slides from `y: 100%` over 450ms. Exit is 70% of the entrance time. Reduced motion: opacity only.

---

## 9. Image Treatments

- Warm grading: photos feel slightly warm, soft contrast. Cool/blue-heavy imagery is avoided or overlaid with a `burgundy @ 12%` multiply tint.
- All images sit inside a clipped container with a radius token and a fixed aspect ratio (no layout shift). `object-fit: cover`.
- Portrait (only when the owner supplies an approved photo): 4:5, radius 28px, an offset `peach` block behind. Until then the hero uses original SVG architectural geometry and no person image or silhouette.
- Project media: 4:3 or 3:2. Hover scale 1.04. Screenshots sit on a `peach-soft` backdrop with 20px inner padding when shown contained.
- Stock and architectural imagery: desaturate 10-15%, overlay `linear-gradient(to top, rgba(61,20,38,.55), transparent)` when text sits on it.
- Logos: 48px tile, radius 12px, `peach-soft` fill, `object-contain` with 8px padding. Missing logos use a monogram tile (Fraunces initial on `peach`).
- Delivery: WebP or AVIF for raster, SVG for illustrations. `loading="lazy"`, `decoding="async"`, explicit `width`/`height`, `srcset`/`sizes` where multiple widths exist. Above-the-fold hero image is eager with `fetchpriority="high"`.
- Alt text is required for meaningful images. Decorative visuals use `alt=""`.
- Illustrative visuals (no real screenshots yet) are original SVG, are described as illustrative in alt text, and live in YAML-configurable paths so real screenshots can replace them without touching components.
- Client logos are never used without permission or a verified public source.

---

## 10. Animation Guidelines

Library: **Framer Motion** (reduced motion via `MotionConfig reducedMotion="user"` plus CSS). Motion explains and polishes, it never gates content. Everything essential is in the DOM and usable before any animation completes. If animation fails to initialise, ordinary scrolling and content still work.

### Tokens
| Token | Value |
|---|---|
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` entrances |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` exits, overlays |
| `ease-soft` | `cubic-bezier(0.4, 0, 0.2, 1)` hover |
| `dur-fast` | 180ms (hover, underline) |
| `dur-tab` | 350ms (tab pill) |
| `dur-base` | 450ms (drawer, accordion, modal) |
| `dur-scene` | 750ms (scene content, within 550-850ms) |
| `dur-hero` | 1200ms (opening) |
| `stagger` | 80ms (60-120ms) |
| text travel | 16-36px; card travel 20-48px; decoration rotation 2-8 degrees |

### Parallax depth
Three layers per scene: background (large soft shapes, grids, geometry, slowest), midground (cards, diagrams, frames, moderate), foreground (headings, labels, CTAs, subtle). Decorative objects (rings, squares, nodes, connection lines) get small independent drift and rotation. Offsets come from Framer scroll motion values (`useScroll` + `useTransform`), applied as transforms, so scrolling does not re-render React. Desktop distances stay under 80px for the background. Tablet halves them. Mobile removes them.

### Scene choreography
- Headings fade and rise into place, cards rise with a stagger, image reveals use clip-path, SVG connection paths draw progressively (`pathLength`).
- Content below the fold reveals on entry once. Elements are never `pointer-events: none` or removed when inactive, so nothing invisible blocks clicks or focus.
- Tab click: native hash navigation drives the scroll. The target scene's reveal plays as it arrives, the tab pill glides (350ms), the mobile label updates immediately. No competing custom scroll code.
- Rapid repeated clicks resolve to the last target. After the scroll settles the observer is the source of truth.

### Rules
- Animate `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. Disclosure height uses Framer height animation. Never animate layout properties continuously.
- No bounce, elastic, flashing, fast spinning, scroll hijacking, or large blur. `will-change` only during active animation.
- Observers and listeners are cleaned up. No layout shift from animation.
- **Reduced motion:** parallax off, large translations off, decorative drift off, scene transitions become a 200ms opacity fade, `scroll-behavior: auto`, drawer fades in place.

## 11. Responsive Breakpoints

Mobile first. Tailwind v4 default breakpoints.

| Name | Min width | Changes |
|---|---|---|
| base | 0 | Single column, gutter 20px, compact header with live label plus right-aligned burger, right drawer, progress bar, no parallax, snap `proximity`, modals as bottom sheets |
| `sm` | 640px | Larger type, 2-up chips |
| `md` | 768px | Two-column compositions, half-distance parallax, modals centre. Header stays compact |
| `min-[1080px]` | 1080px | Desktop tab bar replaces the burger and label, scene header height 72px |
| `lg` | 1024px | Full asymmetric scenes, progress rail and prev/next (shown from here, so also on 1024px tablets that still use the burger header), snap `mandatory` on fine pointers, full parallax, diagrams horizontal |
| `xl` | 1280px | Container caps at 1320px |

Rules: no horizontal overflow from 320px up. Touch targets at least 44x44px. Inputs 16px. Visible focus everywhere. Use `dvh` with `vh` fallback and safe-area insets for fixed UI. Choose layout by available width, never user agent. Verified viewports: desktop 1920x1080, 1440x900, 1366x768, 1280x800. Tablet 768x1024, 820x1180, 1024x768. Mobile 360x800, 375x667, 390x844, 430x932.

## 12. Do's and Don'ts

**Do:** keep burgundy for brand and the primary action. Let Fraunces carry headlines at regular weight. Use scenes with real content density and let tall content grow the scene. Keep every claim traceable to the supplied source. Label illustrative visuals. Use careful verbs (contributed, initiated, designed, supported).

**Don't:** add metrics, years of experience, client names, URLs, or outcomes that were not supplied. Show unresolved placeholders publicly. Show a fake portrait. Use percentage skill bars, stars, or "expert" labels. Publish a residential address. Hijack scroll. Hide content behind animation. Use hover-only interactions without a touch equivalent. Claim a pipeline is live or has passed until it has actually run.

## 13. Implementation Map

- Tokens: `src/styles/globals.css` (`@theme`), motion constants `src/lib/animations.ts`.
- Scene system: `src/lib/scenes.ts` (order, labels, tone), `src/hooks/useScene.tsx` (active-scene context), `src/components/scenes/*` (Scene, ParallaxLayer, SceneControls).
- Navigation: `src/components/layout/Navbar.tsx` (desktop tabs, mobile label and drawer).
- Sections: `src/components/sections/*`; FAQ: `src/components/faq/*`; case studies: `src/components/projects/*`; diagrams: `src/components/diagrams/*`.
- Content: `src/content/*.yaml`, validated by `src/lib/content-schemas.ts` at build.
