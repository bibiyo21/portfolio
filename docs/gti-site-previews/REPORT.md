# GTI Main and GTI North: visual preview and responsive assessment

Captured with Playwright (Chromium) from the live sites. Nothing on either site was changed, and no form was submitted. Observations below describe only what is visible in the screenshots. Contrast and performance were **not** measured.

| | GTI Main | GTI North |
|---|---|---|
| URL | https://goalietraininginstitute.ca/ | https://north.goalietraininginstitute.ca/ |
| HTTP status | 200 | 200 |
| Page title | Goalie Training Institute \| Development Done Right | Goalie Training Institute - North \| Development Done Right |
| Blocks iframe embedding (headers) | No | No |
| Screenshots | desktop and mobile: first screen, full page, newsletter popup; mobile menu | same |

Capture details are in `capture-report.json`. Viewports: desktop 1440 × 900, mobile 390 × 844.

## Capture notes (read before trusting the files)

- **First mobile attempt was discarded.** It used a spoofed iPhone user agent and both sites answered with a "Confirm you are human" page. Those images showed no site content, so they were deleted. The capture was repeated with the browser's own user agent and a 390px viewport, and the sites loaded normally. The verification page was never clicked through.
- **Newsletter popup.** Both sites show a timed "Subscribe To Our Newsletter" popup after some scrolling (desktop and mobile). It is part of the live experience, so it is saved separately as `*-newsletter-popup.png`. It was then closed with the popup's own close button so it would not cover the full-page and menu captures. The first-screen captures were taken before it appeared.
- **Mobile menu.** The hamburger is a CSS-drawn control, so it was opened by tapping its on-screen position. In both captures the "Our Programs" group is already expanded.
- The network never became fully idle on either site (ongoing background requests), so captures were taken after the page `load` event plus a short wait.

## Desktop (1440 × 900)

**Layout and hierarchy.** Both sites share one structure: a full-bleed photographic hero, a coloured statistics band, dark navy content sections, a large photo panel with an overlaid "Get an exclusive blueprint" card, testimonials and a logo row on the photo, a newsletter tile and a shop tile side by side, then a footer. Section headings are large condensed uppercase type, with a short descriptor right-aligned opposite each heading.

**Navigation.** Logo at top left. A small utility row at top right holds the location label (Toronto on Main, Barrie on North) and Login. Below it: Home, About GTI (dropdown), Our Programs (dropdown), Be A GTInsider, Shop GTIstore, Get Support (dropdown), and a filled BOOK NOW button.

**Hero.** Full-bleed photo with a dark overlay (the hero image rotates between visits), a small spaced-out kicker ("DEVELOPMENT STARTS HERE!"), a two-line uppercase headline, a short paragraph and two buttons: a filled "Find your program" and an outlined "Be a GTInsider". The paragraph sits close under the headline with little space between them.

**Typography and spacing.** Heavy condensed display face for headings, a plain sans for body copy. Body text in the cards and testimonials is small relative to the headings. Spacing between sections is generous.

**Footer.** Logo with tagline on the left, three link columns (Get Started, Get Support, Connect), and a thin bottom row with copyright, Terms and Privacy Policy. The bottom row text is grey on dark navy and looks faint (not measured).

## Mobile (390 × 844)

**Layout.** Single column. Header shows the logo, a Book Now button and a hamburger. The hero stacks the kicker, headline, paragraph and two full-width buttons. The statistics become a 2 × 2 grid. Program and package cards become horizontal carousels: the next card peeks in at the right edge and dots sit below. Testimonials stack, and the logo row wraps over several lines. The newsletter and shop tiles stack. The footer becomes a two-column link grid.

**Navigation.** The hamburger opens a full-height dark panel with the location selector and Login at the top, then accordion rows (Home, About GTI, Our Programs). With "Our Programs" open it lists "Find Your Program", "Browse All Programs" and the programs grouped by season (Summer, Fall, Winter). The close icon replaces the hamburger in the same position.

**Hero.** The headline wraps to four lines and runs directly into the paragraph beneath it, with very little gap between them.

**Visible usability points.**
- The newsletter popup covers most of the screen on mobile when it appears.
- The headline and paragraph in the hero feel tight against each other.
- The carousels hide content off to the right, so the number of programs is only visible by swiping (dots indicate it).

## Main vs North

| Area | GTI Main | GTI North |
|---|---|---|
| Accent colour | Bright blue (buttons, stats band, links) | Teal / cyan (buttons, stats band, links) |
| Logo | GTI with "Powered by TRUE" mark | GTI with a "NORTH" mark above and "Powered by TRUE" |
| Location label | Toronto | Barrie |
| Hero photo | Rotates between visits. In the first captures Main showed a goalie in net; in the final captures both sites show the same close-up of a coach in a navy GTI cap | Rotates between visits. In the first captures North showed the coach close-up, as it does in the final captures |
| Hero paragraph | Wraps normally | Wraps with "personalized" alone on its own line on desktop |
| Statistics | 20+, 15+, 75+, 500+ | 20+, 15+, 75+, 1000+ |
| Ongoing programs | Pre-Season Program 2026 (Closed), Team Development Programs (Open), Mentorship Program | Pre-Season Program 2026 (Closed), In-Season Phase #1 (Open), In-Season Phase #2 (Closed) |
| Team packages | Team Development Programs, Mentorship Program, Video Analysis & Review (3 cards) | Team Development Programs (Open), Video Analysis & Review (Coming Soon) (2 cards) |
| Testimonials | Owen Loftus, Mari Pietersen, Aidan Spooner | Calli Hogarth, Rory Edwards, Tim Cushnaghan |
| Photo panel | Player in a Battalion jersey and a masked goalie | Goalie in a colour-splash treatment |
| Logo row | 7 logos | 7 logos plus a PJHL logo on a second row |
| Mobile menu | "About GTI" shows an expand chevron | "About GTI" shows no chevron in the capture |

Both sites otherwise use the same templates, section order, type and component styles, which matches the Main and North relationship described in the portfolio case studies.

## Run the preview

```bash
npm run preview:gti      # http://localhost:4175/
npm run capture:gti      # re-capture from the live sites (overwrites the images here)
```

The gallery offers GTI Main, GTI North and Compare, Desktop and Mobile, and views for first screen, full page, mobile menu, newsletter popup and a live iframe. The live iframe is optional: both sites' headers allow embedding, but a site may still restrict embedded or automated visits, in which case use the screenshots.

This gallery is kept under `docs/` and is not part of the deployed portfolio, so third-party screenshots are not published with it.
