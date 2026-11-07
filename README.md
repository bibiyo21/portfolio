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

**Brand and type:** the IS monogram logo and favicon set are in `public/` (see `DESIGN.md` section 2b). Fonts are self-hosted: Space Grotesk for the logo, headings and navigation, Inter for body and UI, JetBrains Mono for technical labels.

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
| `npm run dev` / `build` / `preview` | Vite dev server, production build (validate, type-check, build, then prerender the page into `dist/index.html`), preview |
| `npm run lint` | oxlint (TypeScript, React hooks, jsx-a11y, Vitest rules; config in `.oxlintrc.json`). typescript-eslint does not support TypeScript 7 yet, so oxlint is used |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run content:validate` | Parses and validates every `src/content/*.yaml` with Zod. `build` runs it first. The build also parses the YAML through `scripts/vite-content-plugin.ts`, so the browser receives plain JSON and never ships the YAML parser |
| `npm run test:unit` | Vitest and React Testing Library (also covers the `api/contact.ts` handler) |
| `npm run test:coverage` | Unit tests with a coverage report in `coverage/` |
| `npm run test:e2e` | Playwright. Starts the dev server, or the preview server when `E2E_PREVIEW=1`. `E2E_PORT` picks another port so a dev server you already run is not reused |
| `npm run test:mobile` | Only the responsive spec on Chromium |
| `npm run test:ui` / `test:headed` | Playwright UI mode / headed Chromium |
| `npm run test:report` | Open the last Playwright HTML report |

Playwright is not run in CI for now (it slowed deploys); run `npm run test:e2e` locally before releases. First run needs browsers: `npx playwright install` (or `npx playwright install chromium` and add `--project=chromium`).

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

### Project types and the Venue Seat Planner

`projects.yaml` supports `type: client` (default), `technical` or `personal`. Client and technical items appear under the GTI heading; personal items appear in their own "Side projects and proofs of concept" block with a status label (`statusLabel`), extra tags, and a live-link button labelled by `ctaLabel`. Personal projects also support `motivation`, `intendedUsers`, `features`, `decisions`, `limitations`, `learned`, `technologies` and `role`. **Any empty field is hidden**, so only verified details appear.

The **Venue Seat Planner** is included as a "Personal PoC" and hobby project with the demo link `https://venue-seat-planner.vercel.app/`. The live demo opens on an administrator login page, so its details come from the project's local source code and README, and the screenshots come from a local copy run with fictional sample data (no real guest or event data). The card shows a floor-plan screenshot and the detail dialog adds a features list, a grouped technical specification (Next.js 16, React 19, Express 5, SQLite/MongoDB, xlsx, qrcode, signed-cookie auth, Vercel), five captioned screenshots and honest limitations. Screenshots are `public/images/projects/venue-seat-planner-*.webp`; the YAML fields `gallery` and `techSpec` drive them. Motivation, role, what you learned and outcomes stay empty (hidden) until you supply them.

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
| `public/images/projects/gti-{main,north}-{desktop,desktop-720,mobile,desktop-full,mobile-full}.webp` | Real screenshots of the live GTI homepages, captured 6 November 2026 | Re-capture with `npm run capture:gti`, then `node scripts/optimize-gti-images.mjs`, then update `capturedOn` in `projects.yaml`. Confirm you are cleared to publish them |
| `public/images/profile/` | Owner photos, byte-identical copies of the originals: the professional portrait (About scene) and three "Beyond the build" photos | Replace a file only with another original; update `width`/`height`/`position` in `profile.yaml` and the SHA-256 lists in `src/lib/content-parse.test.ts` and `tests/e2e/images.spec.ts` |
| `portfolio-photo-originals/` (project root, git-ignored) | All six original uploads, unchanged. Not deployed and not committed, because the repository is public and two photos are not used on the site | Keep as the source copy |
| `public/images/affiliations/kora-design-solutions-logo.png` | **Missing on purpose.** No official logo has been supplied | Add the Facebook profile picture or an original logo file from the owner, then set `logo` and `logoAlt` in `affiliations.yaml` |
| `public/images/illustrations/og-image.png` | Social preview, 1200 x 630, generated by `node scripts/build-og-image.mjs`. Brand only: adding the portrait would mean making an edited derivative of the photo, which the photo rules forbid | The build writes its absolute URL from `seo.siteUrl` |
| `public/images/illustrations/image-fallback.svg` | Fallback for missing images | Keep |
| `public/images/brand/*.svg`, `public/favicon.*`, `public/apple-touch-icon.png`, `public/icon-*.png` | IS monogram logo and favicon set | Regenerate with `npm run build:brand`, then copy from `docs/brand-preview/` (see `DESIGN.md` section 2b) |
| `public/images/stock/`, `public/images/affiliations/` | Empty | Stock photos (record credits in `public/images/stock/CREDITS.md`) and logos only with permission or a verified public source |

No stock photography is bundled, and no portrait or likeness was generated.

## Personal photography

The six photos supplied by the owner are used exactly as uploaded: no resizing, recompression, cropping, filters, colour changes, retouching or AI processing. Only CSS frames them (`object-fit: cover` with an `object-position` chosen to keep the face in view). Two automated checks fail if a served photo's bytes ever differ from the original (SHA-256 in `src/lib/content-parse.test.ts` and `tests/e2e/images.spec.ts`).

| Photo | Used | Where |
|---|---|---|
| `ibrahem-professional-portrait.jpg` | Yes | About scene, framed portrait with a peach offset block. Not in the hero, so the hero text stays the first and fastest paint |
| `ibrahem-iron-man-exhibit.jpg` | Yes | "Beyond the build", Technology interests |
| `ibrahem-interactive-art-exhibit.jpg` | Yes | "Beyond the build", Curiosity |
| `ibrahem-spartan-race.jpg` | Yes | "Beyond the build", Personal interests (no athletic claim) |
| `ibrahem-wedding-portrait.jpg` | No | Personal; not needed for the professional story |
| `ibrahem-travel-premiere.jpg` | No | Several identifiable bystanders; the brief caps secondary photos at three |

Captions describe only what is visible. They add no event names, dates or places. The Iron Man and Spartan photos show third-party marks (Stark Expo / Marvel, Spartan Race and its photographer's watermark); confirm you are comfortable showing them.

Trade-off: because the photos may not be recompressed, the four files total about 2.1 MB. All four are below the first screen and lazy-loaded, so they do not affect the first paint. If you later approve web-sized copies, they can be added beside the originals.

## Affiliations (Kora Design Solutions)

The Recognition scene has an Affiliations block driven by `src/content/affiliations.yaml`. Kora Design Solutions is entered with `published: false`, `relationship: "CONFIRM_WITH_OWNER"`, `verificationStatus: pending-owner-confirmation` and no logo. The schema refuses to publish an entry that is unconfirmed, still carries the placeholder, or has a logo without alt text. Production HTML does not contain the entry; `npm run dev` shows it as a labelled draft so you can preview it.

To publish: set the approved `relationship` wording, confirm the `description`, optionally add the official logo (see the asset inventory), then set `verificationStatus: confirmed` and `published: true`.

## SEO

- **Initial HTML.** `npm run build` prerenders the whole page (`src/entry-server.tsx`, `scripts/prerender.ts`) into `dist/index.html`, and React hydrates it in the browser. Crawlers and link previews get the content without running JavaScript.
- **Head.** Title, description, robots, canonical, Open Graph, Twitter card and Person JSON-LD are generated at build time from `profile.yaml` and `skills.yaml` by `src/lib/seo.ts` (through `scripts/vite-content-plugin.ts`). JSON-LD uses only verified facts: name, job title, URL, portrait, LinkedIn, GitHub, country and the résumé-confirmed skills (not the "current interests").
- **robots.txt and sitemap.xml** are generated into `dist/`. The sitemap lists only the canonical root URL.
- **Canonical address.** `seo.siteUrl` in `profile.yaml`, currently `https://portfolio-flow-stack-digital.vercel.app` (the live production alias). `SITE_URL` at build time overrides it.
- **Previews.** When Vercel builds anything other than production (`VERCEL_ENV` is not `production`), the build emits `noindex, nofollow` and a disallow-all `robots.txt`.
- No web manifest: the site is not an installable app, so the old `site.webmanifest` was removed.

## Custom domain: ibrahemsotejo.com

Do not switch the canonical address until the domain is purchased, added to this Vercel project and serving HTTPS.

Note: the Vercel team that owns this project already lists **`ibrahemsotejo.app`** (`.app`, not `.com`) as a domain. It did not resolve when checked on 7 November 2026. Confirm which domain you intend to use.

1. Buy `ibrahemsotejo.com` from a registrar. Domain purchase is separate from Vercel.
2. In Vercel, open the `portfolio` project, then Settings → Domains, and add both `ibrahemsotejo.com` and `www.ibrahemsotejo.com`.
3. Add the exact DNS records that Vercel shows for this project at your DNS provider. Do not copy generic values from tutorials. Do not delete existing records (keep MX, SPF, DKIM and DMARC if the domain will send or receive email), and do not change nameservers unless you mean to move DNS to Vercel after copying every record.
4. If Vercel asks for ownership verification (the domain is used by another account), complete it.
5. Wait until Vercel shows the domain as valid and the certificate as issued.
6. Set `www.ibrahemsotejo.com` to redirect permanently to `ibrahemsotejo.com` in the Domains page.
7. Change `seo.siteUrl` in `src/content/profile.yaml` to `https://ibrahemsotejo.com` (or set `SITE_URL` for production builds), push, and let the pipeline deploy. Canonical, `og:url`, `og:image`, JSON-LD, `robots.txt` and the sitemap all follow.
8. Add `ibrahemsotejo.com,www.ibrahemsotejo.com` to `RECAPTCHA_ALLOWED_HOSTNAMES` in Vercel and to the reCAPTCHA key's domain list, then redeploy.
9. Test both hosts, HTTP to HTTPS, www to apex, `/robots.txt`, `/sitemap.xml`, a share preview, and a real inquiry.

Optional CLI checks, only after purchase and with the CLI linked to this project: `vercel domains ls`, `vercel domains add ibrahemsotejo.com portfolio`, `vercel domains add www.ibrahemsotejo.com portfolio`, `vercel domains inspect ibrahemsotejo.com`. Guide: https://vercel.com/docs/domains/set-up-custom-domain

## Contact form, reCAPTCHA and Resend

`POST /api/contact` (`api/contact.ts`) runs these checks in order and stops at the first failure. Resend is only reached after all of them pass:

1. Method is POST, content type is JSON, body is under 20 kB.
2. Per-IP rate limit (5 requests per 10 minutes).
3. Field validation with Zod, including the server-checked honeypot.
4. A reCAPTCHA v3 token is present, then verified with Google using the secret key: Google accepts it (this also rejects expired and already-used tokens), the `action` matches `contact_submit`, the `hostname` is on your allowlist, and the score is at least `RECAPTCHA_MIN_SCORE`.
5. The email is sent through Resend with escaped HTML and a header-safe subject.

The browser loads Google's script only when the form is opened, asks for a fresh single-use token on every submit, and never submits without one. The floating reCAPTCHA badge is hidden, and the form shows Google's required text notice with links to the Privacy Policy and Terms, which Google permits as the alternative. The secret key never reaches the browser.

The form reports success only when the API returns `{ "ok": true }`. Every failure, including a missing token, a rejected token, a low score, Google being unreachable, or missing configuration, ends with "your message was not sent" and a prefilled `mailto:` link. Rejections return a generic message. The server log records only a short reason code (such as `low_score`), never the message, the token or the secret.

**It fails closed.** If `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_ALLOWED_HOSTNAMES` or `VITE_RECAPTCHA_SITE_KEY` is missing, the form cannot send and shows the mailto fallback. This is deliberate. Until the keys are configured in Vercel, visitors only get the mailto link.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | server | Email delivery (see Resend below) |
| `VITE_RECAPTCHA_SITE_KEY` | public, built into the bundle | reCAPTCHA v3 site key. It is not a secret |
| `RECAPTCHA_SECRET_KEY` | **server only** | reCAPTCHA v3 secret key. Never give it a `VITE_` prefix |
| `RECAPTCHA_MIN_SCORE` | server | Lowest accepted score, default `0.5`. Tune it from real traffic: raise it if spam gets through, lower it if real people are rejected |
| `RECAPTCHA_EXPECTED_ACTION` | server | Default `contact_submit`. Must match the action the browser sends |
| `RECAPTCHA_ALLOWED_HOSTNAMES` | server | Exact hostnames allowed to submit, comma separated, no scheme or path. Example: `yourdomain.com,www.yourdomain.com,your-project.vercel.app,localhost` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | server | Shared rate limiting. Without them the limiter is a best-effort counter per serverless instance, which a determined bot can sidestep |

`.env.example` lists them with empty values. Copy it to `.env` for local use. `.env` is git-ignored and **`.env.example` is committed, so never put real values in it.**

### Set up reCAPTCHA

1. Open the reCAPTCHA admin console (google.com/recaptcha/admin) and create a site.
2. Choose **reCAPTCHA v3**.
3. Add your domains: the production domain, your `*.vercel.app` hostname, and `localhost` for local testing.
4. Copy the **site key** and the **secret key**.
5. Local: put them in `.env` as `VITE_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`, and set `RECAPTCHA_ALLOWED_HOSTNAMES` (include `localhost`).
6. Vercel: Project, Settings, Environment Variables. Add all the variables above for Production and Preview. The site key is read at build time, so **redeploy** after adding or changing any variable.
7. Verify: submit the form on the live site and confirm the email arrives (check Resend's Logs tab). Then confirm a bad request is rejected without any Resend log entry, for example from a terminal: `curl -i -X POST https://yourdomain.com/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"a@b.co","subject":"Hello","message":"Long enough message.","recaptchaToken":"fake"}'` should return `403` with `captcha_failed`.

reCAPTCHA v3 has no official test keys that exercise scoring, so automated tests mock Google and never contact it.

### Resend

1. Create a Resend account and an API key.
2. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` in Vercel (Production and Preview).

   **No domain of your own?** Resend only sends from a verified domain you own, and `*.vercel.app` cannot be verified. The no-domain setup is Resend's built-in sender: `CONTACT_FROM_EMAIL=Portfolio <onboarding@resend.dev>` with `CONTACT_TO_EMAIL` set to the email address of your Resend account (Resend rejects any other recipient with a 403). Every inquiry then lands in that one mailbox, with the visitor's address as Reply-To, so you can reply directly. Forward that mailbox in your mail settings if you want it elsewhere.

`npm run dev` does not run serverless functions, so the form shows the mailto fallback locally. Use `npx vercel dev` to exercise the API with your `.env`. Automated tests mock both Google and Resend and never send real email.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| Form always says "not sent" with a mailto link | A reCAPTCHA or Resend variable is missing, or `VITE_RECAPTCHA_SITE_KEY` was added after the last build. Set it and redeploy |
| Log shows `wrong_hostname` | The site's hostname is not in `RECAPTCHA_ALLOWED_HOSTNAMES` (check preview URLs and the `www` variant) |
| Log shows `wrong_action` | `RECAPTCHA_EXPECTED_ACTION` was changed. It must be `contact_submit` unless the code is changed too |
| Log shows `low_score` for real people | Lower `RECAPTCHA_MIN_SCORE` a little. Real traffic often scores 0.7 to 0.9, bots 0.1 to 0.3 |
| Log shows `google_rejected:timeout-or-duplicate` | The token expired (about 2 minutes) or was reused. The visitor just retries |
| Log shows `google_rejected:invalid-input-response` | The token is malformed, or the site key and secret key belong to different reCAPTCHA sites |
| Log shows `bad_secret` | `RECAPTCHA_SECRET_KEY` is wrong, or is the site key by mistake |
| Log shows `google_unreachable` | Google could not be reached within 5 seconds. The form fails closed and offers the mailto link |
| Resend 403 about an unverified domain | `CONTACT_FROM_EMAIL` is a gmail.com or other domain you do not own. Use the built-in sender above or verify a domain |

## Deployment

**Deployment owner: GitHub Actions.** It deploys with the Vercel CLI, and `vercel.json` sets `git.deploymentEnabled: false` so Vercel's own Git integration never deploys a second time. Vercel settings: framework Vite, build `npm run build`, output `dist`. `/api/contact` is picked up from `api/`. No SPA rewrite is needed because the site is one page with hash anchors.

1. Push this project to https://github.com/bibiyo21/portfolio (`main`).
2. Create the Vercel project and run `npx vercel link` locally. Read `.vercel/project.json` for the org and project IDs.
3. Add three **repository** secrets in GitHub (Settings, Secrets and variables, Actions, "New repository secret"). Names must match exactly:
   - `VERCEL_TOKEN`: create it at vercel.com/account/tokens (scope it to your account, set an expiry you are comfortable with) and paste the value once.
   - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: the `orgId` and `projectId` in `.vercel/project.json` after `npx vercel link`.

   The deploy jobs read the token from the environment and start with a "Check Vercel secrets" step. If a secret is missing the job fails immediately and names the missing secret, instead of the Vercel CLI's `--token is missing a value` error.
4. Add the Resend and reCAPTCHA variables in the Vercel project settings (see "Contact form, reCAPTCHA and Resend"), then redeploy.
5. Create GitHub environments `preview` and `production`. Add required reviewers to `production` for manual approval if you want it.
6. In branch protection for `main`, require the checks `Validate`, `Build` and `Unit Testing`.

Git: the repository identity should be your personal one (`git config user.name` / `user.email` inside this repo). Nothing in this project changes global Git configuration.

## CI/CD

| File | Purpose |
|---|---|
| `.github/workflows/ci-cd.yml` | Primary pipeline. Jobs: `validate`, `build`, `unit-test`, `preview-deploy` (pull requests), `production-deploy` (`main`) |
| `.gitlab-ci.yml` | Parallel implementation. Stages: `validate`, `build`, `unit-test`, `deploy`, with manual production approval |

GitHub: actions are pinned to commit SHAs, permissions default to `contents: read`, concurrency cancels superseded runs (never on `main`), deploy jobs need every earlier job, fork pull requests skip deployment because secrets are unavailable. GitLab: npm cache keyed on `package-lock.json`, artifacts with expiry, JUnit report, protected variables `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, deploy jobs only when those exist.

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
| `npm run lint` | no errors or warnings |
| `npm run test:unit` | 218 tests passed (coverage: 87% lines) |
| `npm run build` | succeeded, page prerendered into `dist/index.html` (main JS 577 kB, 180 kB gzip; the inquiry form is a separate 87 kB chunk loaded on demand) |
| Playwright, Chromium, against a production build (built with a fake site key, Google stubbed) | 317 passed, 5 skipped (touch-target checks that only apply below 1024px) |
| Playwright, Firefox and WebKit | **not run**. Firefox fails to launch and WebKit blocks localhost in the sandbox used for development. Playwright is not run in CI at the moment |
| Lighthouse 12, local production preview | Desktop: performance 99, accessibility 100, best practices 100, SEO 100. Mobile with applied (devtools) throttling: 97 / 100 / 100 / 100 (LCP 1.6 s). Mobile with Lighthouse's default simulated throttling: 79 / 100 / 100 / 100; the simulation counts the JavaScript download before the first paint, while the measured throttled load paints the prerendered content at about 0.6 s |
| GitHub Actions, GitLab CI/CD | **not run** remotely |

## Content that still needs the owner

- Kora Design Solutions: the exact relationship wording, confirmation of the description, the official logo file (or permission to use the Facebook profile picture), and confirmation that https://www.facebook.com/koradesignsolutions is the official page. The entry stays unpublished until then.
- Custom domain: purchase and connect `ibrahemsotejo.com` (or confirm whether `ibrahemsotejo.app`, already listed in the Vercel team, is the intended domain), then switch `seo.siteUrl`.
- Photos: confirm the third-party marks visible in the Iron Man and Spartan race photos are fine to show, and the choice to leave out the wedding and travel photos.
- Real GTI screenshots and permission to publish them, and public GTI URLs if they may be linked.
- Venue Seat Planner: which name to use publicly (the brief says "Venue Seat Planner", but the app UI is titled "Wedding Seating Planner"), confirmation that the live Vercel URL is built from the repository the details were taken from, whether you are happy to publish the stack and sample-data screenshots, and your motivation, role and lessons learned. The repo's `PROJECT_SUMMARY.md` is out of date (it describes a vanilla JS app) and was not used.
- Which GTI Main and GTI North architecture details were delivered. They are currently shown as "Proposed / designed", and `outcome` is empty.
- Leaptel and Eastvantage role details and achievements (the fields exist and stay hidden until filled).
- Whether to state availability for freelance or consulting work (`availability` in `profile.yaml`).
- Any additional projects and verified outcomes.
- Confirmation of the display name preference (the résumé full name is stored but not shown).
- A Viber deep link only if you verify it. For now the number is shown as text and WhatsApp is the click-to-chat link.

## Review previews (not part of the deployed site)

| Command | Opens | What it is |
|---|---|---|
| `npm run preview:gti` | http://localhost:4175/ | Gallery of real desktop and mobile screenshots of the live GTI Main and GTI North sites, with a comparison report in `docs/gti-site-previews/REPORT.md`. `npm run capture:gti` re-captures them |
| `npm run preview:brand` | http://localhost:4176/ | Three logo concepts, favicon candidates, typography proposal and in-context mocks. `npm run build:brand` regenerates the assets in `docs/brand-preview/`. Nothing here is applied to the site until a concept is chosen |

## Project structure

```
api/contact.ts              Vercel function (Resend)
src/content/*.yaml          All content (11 files)
src/lib/                    scenes, content-schemas, content-parse, content-loader, animations, contact, icons
src/hooks/                  useScene, useMediaQuery, useParallaxScale, useContactModal
src/components/
  layout/                   Navbar, Footer, Container
  scenes/                   Scene, ParallaxLayer, SceneBackdrop, SceneControls, HeroSystem
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
