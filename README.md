# Ibrahem Sotejo: Portfolio

A single-page, scene-by-scene portfolio built with React 19, Vite, TypeScript (strict), Tailwind CSS 4 and Framer Motion. All content lives in YAML files. The contact form posts to a Vercel serverless function that sends email through Resend. The repository ships with GitHub Actions and GitLab CI/CD pipelines.

- Design system: [`DESIGN.md`](./DESIGN.md) (tokens, scenes, navigation, motion, accessibility)
- Build specification: [`PORTFOLIO_MASTER_PROMPT.md`](./PORTFOLIO_MASTER_PROMPT.md)
- Repository: https://github.com/bibiyo21/portfolio (production branch `main`)

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # validates content, type-checks, builds to dist/
npm run preview      # serves the production build
```

Node 20.19 or newer is required (`.nvmrc` pins 22).

## How the page works

The page is twelve near-full-viewport **scenes** on native scrolling with CSS Scroll Snap: Home, About, Expertise, Work, GTI Main, GTI North, Experience, Architecture, CI/CD, Recognition, FAQ, Contact. Visitors scroll through them or jump directly.

- Native wheel, trackpad, touch and keyboard scrolling are untouched. Nothing intercepts the wheel.
- Snap is `mandatory` only on large fine-pointer screens (1024px and wider) and `proximity` elsewhere. Scenes use `min-height: 100svh` and grow with their content.
- One IntersectionObserver-driven active-scene state feeds the desktop tabs, the mobile label, the drawer, the progress rail and the animations. Tab clicks use native hash navigation, so back/forward and direct links work.
- From 1080px up the header is a sticky tab bar. Below that it is a compact header with the live scene label and a right-aligned burger that opens a full-height, ~70%-wide drawer from the right.
- Parallax uses Framer scroll motion values (no per-pixel React renders). It is halved on tablets and removed on phones and under `prefers-reduced-motion`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `preview` | Vite dev server, production build, preview |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run content:validate` | Parses and validates every `src/content/*.yaml` with Zod. `build` runs it first |
| `npm run test:unit` | Vitest and React Testing Library (also covers `api/contact.ts`) |
| `npm run test:coverage` | Unit tests with a coverage report in `coverage/` |
| `npm run test:e2e` | Playwright. Starts the dev server, or the preview server when `E2E_PREVIEW=1` |
| `npm run test:mobile` | Only the responsive spec on Chromium |
| `npm run test:ui` / `test:headed` | Playwright UI mode / headed Chromium |
| `npm run test:report` | Open the last Playwright HTML report |

First run of Playwright needs browsers: `npx playwright install` (or `npx playwright install chromium` and add `--project=chromium`).

## Editing content (YAML)

All content is in `src/content/`. No component edits are needed. Invalid YAML fails the build with a message like `Invalid content in src/content/profile.yaml - email: Invalid email address`.

| File | Controls |
|---|---|
| `profile.yaml` | Name, headline, intro, contact details and links, SEO, About copy, capability pillars, Contact copy, optional `portrait`, optional `availability` |
| `experience.yaml` | Career timeline grouped by company. Optional `summary`, `responsibilities`, `achievements`, `technologies` per role. `internalNote` is never displayed |
| `affiliations.yaml` | Leadership items. One with `parentCompany: gameloft` is nested under that company in the timeline |
| `education.yaml`, `certifications.yaml`, `awards.yaml` | The Recognition scene |
| `skills.yaml` | Skill categories. `kind: exploration` marks interests that are not résumé-confirmed |
| `projects.yaml` | Featured work and case studies |
| `philosophy.yaml` | Architecture diagram layers and principles |
| `cicd.yaml` | The CI/CD showcase. `repositoryUrl` controls the workflow-file links |
| `faq.yaml` | FAQ. `{email}`, `{phone}`, `{linkedin}`, `{github}`, `{whatsapp}` tokens are filled from `profile.yaml` |

Push the change to GitHub and the pipeline redeploys the site.

Rules baked into the model: no proficiency percentages, no availability claim unless `availability` is set, no portrait unless `portrait` is set, case-study `outcome` and links appear only when you provide them, the résumé full name is stored but never shown.

### Adding a project or case study

Append to `items` in `src/content/projects.yaml`:

```yaml
  - id: my-project
    name: "Project name"
    category: "Web Platforms"          # add new categories to `categories`
    summary: "One or two sentences."
    overview: "Longer description."
    context: "Problem and context."
    role: ["What you did."]
    approach:
      - { title: "Decision", text: "What and why.", status: implemented }   # implemented | in-progress | proposed | planned
    technologies: ["React.js"]
    challenges: [{ title: "Challenge", text: "How it was handled." }]
    outcome: []                         # only verified results
    liveUrl: "https://example.com"      # only a verified public URL
    thumbnail: { src: "/images/projects/my-project.webp", alt: "Describe the image", width: 1200, height: 900 }
```

A project without a `scene` opens in a detail dialog from the Work scene. The GTI pair has dedicated scenes (`scene: gti-main`, `scene: gti-north`, themes `main` and `north`). To give another project its own scene, add it to `src/lib/scenes.ts` and render a `CaseStudyScene` for it in `src/App.tsx`.

## Images and asset inventory

Images live in `public/images/` and are referenced from YAML by path. Use WebP or AVIF for photographs, set `width` and `height`, and write meaningful `alt` text. A missing file falls back to a neutral placeholder.

| Path | Status | To replace or add |
|---|---|---|
| `public/images/projects/gti-main.svg` | Illustrative artwork, labelled as such on the page | Real GTI Main screenshot (WebP) once cleared. Update `thumbnail` in `projects.yaml` |
| `public/images/projects/gti-north.svg` | Illustrative artwork, labelled as such | Real GTI North screenshot once cleared |
| `public/images/portraits/` | Empty. No portrait is shown | Approved portrait, then uncomment `portrait` in `profile.yaml` |
| `public/images/illustrations/og-image.svg` | Social preview | A 1200x630 PNG gives better previews on most platforms |
| `public/images/illustrations/image-fallback.svg` | Fallback for missing images | Keep |
| `public/favicon.svg` | Favicon | Optional |
| `public/images/stock/`, `public/images/affiliations/` | Empty | Stock photos (record credits in `public/images/stock/CREDITS.md`) and logos only with permission or a verified public source |

No stock photography is bundled, and no portrait or likeness was generated.

## Contact form and Resend

`POST /api/contact` (`api/contact.ts`) validates input with Zod, rejects a filled honeypot, rate limits per IP, escapes HTML, strips line breaks from the subject, and sends through the Resend REST API. The browser reports success only when the API returns `{ "ok": true }`. If the function is missing or not configured, the modal says the message was **not** sent and offers a prefilled `mailto:` link.

Setup:

1. Create a Resend account, verify a sending domain, create an API key.
2. In Vercel, add environment variables (Production and Preview):

   ```env
   RESEND_API_KEY=re_...
   CONTACT_TO_EMAIL=ibrahem.sotejo.dev@gmail.com
   CONTACT_FROM_EMAIL=Portfolio <contact@your-verified-domain>
   ```
3. Recommended: durable rate limiting with Upstash Redis REST (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). Without it the limiter is best effort per serverless instance.

`npm run dev` does not run serverless functions, so the form shows the mailto fallback locally. Use `npx vercel dev` to exercise the API. Automated tests mock the endpoint and never send real email. `.env` is git-ignored, and `.env.example` lists the variables.

## Deployment

**Deployment owner: GitHub Actions.** It deploys with the Vercel CLI, and `vercel.json` sets `git.deploymentEnabled: false` so Vercel's own Git integration never deploys a second time. Vercel settings: framework Vite, build `npm run build`, output `dist`. `/api/contact` is picked up from `api/`. No SPA rewrite is needed because the site is one page with hash anchors.

1. Push this project to https://github.com/bibiyo21/portfolio (`main`).
2. Create the Vercel project and run `npx vercel link` locally. Read `.vercel/project.json` for the org and project IDs.
3. Add GitHub repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
4. Add the Resend variables in the Vercel project settings.
5. Create GitHub environments `preview` and `production`. Add required reviewers to `production` for manual approval if you want it.
6. In branch protection for `main`, require the checks `Validate`, `Build`, `Unit Testing` and `Playwright Testing`.

Git: the repository identity should be your personal one (`git config user.name` / `user.email` inside this repo). Nothing in this project changes global Git configuration.

## CI/CD

| File | Purpose |
|---|---|
| `.github/workflows/ci-cd.yml` | Primary pipeline. Jobs: `validate`, `build`, `unit-test`, `e2e-test`, `preview-deploy` (pull requests), `production-deploy` (`main`) |
| `.gitlab-ci.yml` | Parallel implementation. Stages: `validate`, `build`, `unit-test`, `e2e-test`, `deploy`, with manual production approval |

GitHub: actions are pinned to commit SHAs, permissions default to `contents: read`, concurrency cancels superseded runs (never on `main`), deploy jobs need every earlier job, fork pull requests skip deployment because secrets are unavailable. GitLab: npm cache keyed on `package-lock.json`, artifacts with expiry, JUnit report, the official Playwright image, protected variables `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, deploy jobs only when those exist.

The CI/CD scene on the site is driven by `cicd.yaml` and shows the real workflow files. It links to them in the repository and is labelled as an illustration.

**Status:** both pipelines were written and their YAML parses. They have **not** been run on GitHub or GitLab from here. Do not treat them as verified until a remote run succeeds.

## Testing

- **Unit** (`src/**/*.test.ts(x)`, `api/contact.test.ts`): content parsing and Zod validation (invalid YAML, missing and optional fields, empty collections, added projects and skills, owner-supplied facts), scene state, navbar and drawer, scene controls, work and case-study scenes, expertise tabs, experience, recognition, FAQ accordion, contact form and modal, architecture diagram, CI/CD tabs and pipeline, the API handler.
- **End-to-end** (`tests/e2e`): homepage, navigation (tabs, sticky header, active tab on click and scroll, rapid clicks, back/forward, deep links, drawer geometry, scroll lock, focus trap), scenes (snap, wheel, keyboard, progress, prev/next, reduced motion, mobile no-trap), work and GTI scenes, expertise, experience, FAQ, architecture, CI/CD, contact modal and form (API mocked), image fallback, axe-core per scene, and a responsive matrix over 4 desktop, 3 tablet and 4 mobile viewports.
- `visual.spec.ts` attaches review screenshots to the report, including smooth-scroll mid-transition captures. They are for inspection, not pixel-diff baselines.

### Results from the last local run

| Check | Result |
|---|---|
| `npm run content:validate` | 11 of 11 files valid |
| `npm run typecheck` | no errors |
| `npm run test:unit` | 135 tests passed (coverage: 84% lines, 83% statements, 70% branches, 79% functions) |
| `npm run build` | succeeded (JS 694 kB, 214 kB gzip) |
| Playwright, Chromium, against the production preview build | 260 passed, 5 skipped (touch-target checks that only apply below 1024px) |
| Playwright, Firefox and WebKit | **not run**. Firefox fails to launch and WebKit blocks localhost in the sandbox used for development. The GitHub workflow installs all browsers and runs them |
| GitHub Actions, GitLab CI/CD | **not run** remotely |

## Content that still needs the owner

- Approved professional portrait.
- Real GTI screenshots and permission to publish them, and public GTI URLs if they may be linked.
- Which GTI Main and GTI North architecture details were delivered. They are currently shown as "Proposed / designed", and `outcome` is empty.
- Leaptel and Eastvantage role details and achievements (the fields exist and stay hidden until filled).
- Whether to state availability for freelance or consulting work (`availability` in `profile.yaml`).
- Any additional projects and verified outcomes.
- Confirmation of the display name preference (the résumé full name is stored but not shown).
- A Viber deep link only if you verify it. For now the number is shown as text and WhatsApp is the click-to-chat link.

## Project structure

```
api/contact.ts              Vercel function (Resend)
src/content/*.yaml          All content (11 files)
src/lib/                    scenes, content-schemas, content-parse, content-loader, animations, contact, icons
src/hooks/                  useScene, useMediaQuery, useParallaxScale, useContactModal
src/components/
  layout/                   Navbar, Footer, Container
  scenes/                   Scene, ParallaxLayer, SceneBackdrop, SceneControls, HeroGeometry
  sections/                 Hero, About, Expertise, Work, Experience, Architecture, CICDShowcase, Recognition, Faq, Contact
  projects/                 CaseStudyScene, ProjectCard, ProjectDetail, StatusChip
  diagrams/                 ArchitectureDiagram, PipelineDiagram, YamlCode
  faq/                      FaqAccordion, faq-answer
  contact/                  ContactModal
  ui/                       Button, Accordion, Modal, Tag, SkillTag, Img, ImageReveal, MaskedLines, Reveal, SectionHeading
tests/                      Playwright specs and fixtures
.github/workflows/          GitHub Actions
.gitlab-ci.yml              GitLab CI/CD
DESIGN.md                   Design system
```
