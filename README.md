# Personal Portfolio

A single-page, YAML-driven portfolio built with React 19, Vite, TypeScript, Tailwind CSS 4 and Framer Motion. Content lives in YAML files, the contact form posts to a Vercel serverless function that sends email through Resend, and the repository ships with GitHub Actions and GitLab CI/CD pipelines.

The visual system is documented in [`DESIGN.md`](./DESIGN.md). Components read their colours, type, spacing and motion from the tokens defined there (`src/styles/globals.css` and `src/lib/animations.ts`).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # validates content, type-checks, builds to dist/
npm run preview      # serves the production build
```

Node 20.19+ is required (`.nvmrc` pins 22).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `preview` | Vite dev server, production build, preview |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run content:validate` | Parses every `src/content/*.yaml` and validates it with Zod. `build` runs this first |
| `npm run test:unit` | Vitest + React Testing Library (also covers the `/api/contact` handler) |
| `npm run test:coverage` | Unit tests with a coverage report in `coverage/` |
| `npm run test:e2e` | Playwright (starts the dev server, or the preview server when `E2E_PREVIEW=1`) |
| `npm run test:mobile` | Only the responsive spec (desktop, tablet and mobile viewports) on Chromium |
| `npm run test:ui` / `test:headed` | Playwright UI mode / headed Chromium |
| `npm run test:report` | Opens the last Playwright HTML report |

First run of Playwright needs browsers: `npx playwright install` (or `npx playwright install chromium` for just Chromium, then run with `--project=chromium`).

## Editing content (YAML)

Everything you see is configured in `src/content/`. No component edits are needed.

| File | Controls |
|---|---|
| `profile.yaml` | Name, wordmark, hero copy, availability, email, portraits, SEO, About text, contact modal copy |
| `experience.yaml` | Career timeline. Add `description`, `responsibilities`, `achievements`, `technologies` per role |
| `affiliations.yaml` | Affiliation cards. The section hides itself when `items` is empty |
| `projects.yaml` | Projects, categories and case-study fields |
| `skills.yaml` | Skill categories and tags. Mark non-confirmed skills `status: interest` |
| `social-links.yaml` | Footer links (`github`, `linkedin`, `mail`, `globe`) |
| `philosophy.yaml` | Principles and the architecture diagram layers |
| `cicd.yaml` | The CI/CD showcase: stages, tools, commands, quality gates, and `repositoryUrl` |

Items with `[PLACEHOLDER]` text or `placeholder: true` are sample content. Replace them. The page labels sample projects and placeholder roles so they are never mistaken for real work.

Invalid YAML fails the build with a message such as:

```
Invalid content in src/content/profile.yaml
  - email: Invalid email address
```

Push the change to GitHub and the pipeline redeploys the site.

### Replacing images

Images live in `public/images/{portraits,projects,stock,affiliations,illustrations}` and are referenced from YAML by path (for example `/images/projects/my-project.webp`). Replace the file or change the path, and keep `alt` text meaningful. Use WebP or AVIF for photographs, and set `width` and `height` so the layout does not shift. A missing file falls back to a neutral placeholder.

The portraits and project images that ship are **clearly labelled placeholders**. Add your own reference photographs. No AI portrait was generated, and no stock photos were bundled (see "Photography" below).

### Photography

The brief asks for AI portraits of you and Unsplash/Pexels stock imagery. Those need your reference photos and a licence-aware download, so they are not included. To add stock images, download them from Unsplash or Pexels into `public/images/stock/`, convert to WebP, record the credit in `public/images/stock/CREDITS.md`, and reference them from YAML.

## Contact form and Resend

`POST /api/contact` (`api/contact.ts`) validates input with Zod, rejects a filled honeypot, rate limits per IP, escapes HTML, strips line breaks from the subject, then sends through the Resend REST API. The browser reports success only when the API returns `{ "ok": true }`.

If the function is missing or not configured, the modal says the message was **not** sent and offers a prefilled `mailto:` link to the address in `profile.yaml`.

Setup:

1. Create a Resend account, verify a sending domain, and create an API key.
2. In Vercel, add environment variables (Production and Preview):

   ```env
   RESEND_API_KEY=re_...
   CONTACT_TO_EMAIL=you@yourdomain.com
   CONTACT_FROM_EMAIL=Portfolio <contact@yourdomain.com>
   ```
3. Optional but recommended: durable rate limiting with Upstash Redis REST (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). Without it the limiter is per serverless instance only (best effort).

Copy `.env.example` to `.env` for local reference. Never commit `.env`. `npm run dev` does not run serverless functions, so the form shows the mailto fallback locally. Use `npx vercel dev` to test the API.

## Deployment

**Deployment owner: GitHub Actions.** The workflow deploys with the Vercel CLI, and `vercel.json` sets `git.deploymentEnabled: false` so Vercel's own Git integration does not deploy a second time.

1. Create a GitHub repository and push this project.
2. Create a Vercel project (import the repo once, or `npx vercel link`). Run `npx vercel link` locally and read `.vercel/project.json` for the IDs.
3. Add GitHub repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
4. Add the Resend environment variables in the Vercel project settings.
5. Create GitHub environments `preview` and `production`. Add required reviewers to `production` if you want manual approval.
6. In branch protection for `main`, require the checks `Build and Validation`, `Unit Testing` and `Playwright Testing`.
7. Set `repositoryUrl` in `src/content/cicd.yaml` to show links to the workflow files in the showcase.

## CI/CD

| File | Purpose |
|---|---|
| `.github/workflows/ci-cd.yml` | Primary pipeline: build and validation, unit tests, Playwright, preview deploy (PRs), production deploy (`main`) |
| `.gitlab-ci.yml` | Parallel implementation: `validate`, `build`, `unit-test`, `e2e-test`, `deploy` with manual production approval |

GitHub details: actions are pinned to commit SHAs, permissions default to `contents: read`, concurrency cancels superseded runs (never on `main`), deploy jobs need every earlier job, and fork pull requests skip deployment because secrets are unavailable to them. GitLab details: npm cache keyed on `package-lock.json`, artifacts with expiry, JUnit report, the official Playwright image, protected variables (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

**Status:** both pipelines were written and YAML-checked locally. They have not been run on GitHub or GitLab, because no remote repository is connected.

## Testing

- **Unit** (`src/**/*.test.ts(x)`, `api/contact.test.ts`): content loader and Zod schemas, YAML edge cases (invalid YAML, missing optional fields, empty collections, added projects and skills), project filtering, skills, timeline, navigation, contact form and modal, pipeline diagram, API handler.
- **End-to-end** (`tests/e2e`): homepage, navigation, projects, skills, contact modal and form (API mocked, no real email is sent), CI/CD showcase, responsive checks across 4 desktop, 3 tablet and 5 mobile viewports, accessibility with axe-core, image fallback, and screenshot captures.
- `visual.spec.ts` attaches screenshots to the HTML report for human review. It does not pixel-diff against baselines.

## Project structure

```
api/contact.ts            Vercel function (Resend)
src/content/*.yaml        All content
src/lib/                  content-schemas, content-parse, content-loader, animations, contact
src/components/
  layout/                 Navbar, Footer, Container, Section
  sections/               Hero, About, Experience, Affiliations, Projects, Skills, Philosophy, CICDShowcase, Contact
  ui/                     Button, ProjectCard, ExperienceCard, SkillTag, ContactModal, PipelineDiagram, SectionHeading, ...
src/hooks/                useActiveSection, useScrolled, useMediaQuery, useContactModal
tests/                    Playwright specs and fixtures
.github/workflows/        GitHub Actions
.gitlab-ci.yml            GitLab CI/CD
DESIGN.md                 Design system
```
