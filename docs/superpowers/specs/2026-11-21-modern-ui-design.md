# Modern card-based UI and theme switch: design

**Status:** draft for Wes's approval · **Date:** 2026-11-21 · **Spec:** `docs/SPEC.md` (this design changes §5.5 and implements FR-8)

## Intent

Wes finds the live site "too plain" and wants it "more polished": it should feel like a modern web app and work equally well on desktop and phone browsers. Readers can switch between light and dark themes; the default follows the device setting.

From the mockups (`direction.html`), Wes picked **direction B, the card-based app look**: a top bar with pill-style nav, a hero card with buttons, posts and projects as rounded cards in a grid. He picked the **system font** over a self-hosted Inter.

## Goals

- Every page uses the new look: sticky top bar, light grey page, white rounded cards, one accent colour, pill nav. Dark theme is the same layout with dark cards.
- Light/dark switch in the top bar on every page. First visit follows the device; a click overrides it and is remembered on that device.
- Works and looks intentional from 360 px phones to wide desktops.
- Keeps the site's fundamentals: fast pages (Lighthouse mobile ≥ 95, §3), WCAG 2.2 AA in both themes, no third-party requests, near-zero JS.

## Non-goals

- No tag pages (Phase 2); tags on cards are labels, not links.
- No search, comments, newsletter, analytics.
- No web font, CSS framework, icon library or UI kit.
- No hamburger menu.
- No third "auto" theme state (decided: two states).
- No change to the share image (`og-default.png`), RSS, sitemap, URLs or content.
- No per-post OG images, table of contents (Phase 2).

## Anti-goals (fails even if it "works")

- A white flash before dark mode applies, or the page shifting when the switch initialises.
- Any colour pair below AA in either theme (text 4.5:1, large text and UI parts 3:1).
- Pages getting noticeably heavier or slower; Lighthouse mobile dropping below 95 on home or a post.
- Post text in a grid or wide column; reading width on posts must stay ~65–75 characters.
- Breaking the CV tabs on `/about/`, or an employer name appearing outside the CV (FR-0a).
- The switch doing nothing, or being a dead button, when JS is off.

## Constraints

- Plain CSS with custom properties (CLAUDE.md stack). System font stack only.
- Client JS allowed: the theme switch (CLAUDE.md rule 2, FR-8) and the existing CV tabs on `/about/`. Nothing else.
- Identity only from `src/site.config.ts` (rule 4). The brand text "geltech.dev" is derived from `site.url`, not hard-coded.
- Images via `astro:assets` with width and height.
- `npm run verify` must keep passing; it currently allows scripts only on `/about/`, so it must be taught about the theme script (see below).

## Approaches considered

1. **Rewrite the stylesheet and update the existing components in plain CSS** *(chosen)*. Fits the stack rule, adds no dependencies, keeps pages light.
2. **Tailwind or another CSS framework.** Ruled out by CLAUDE.md ("no Tailwind, no CSS framework") and adds build tooling to a mostly-text site.
3. **A UI kit or site template.** Brings its own scripts and fonts: breaks the no-third-party and near-zero-JS rules.

Visual direction options (mockups): A refined single column, **B card-based app look (chosen)**, C dashboard with sidebar.

## Design

### Visual system

Tokens on `:root`, overridden for dark. Values below are the starting point; the builder must verify every text/background pair meets AA and adjust if not.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f4f4f5` | `#09090b` | page background |
| `--surface` | `#ffffff` | `#18181b` | cards, top bar |
| `--border` | `#e4e4e7` | `#27272a` | card and divider lines |
| `--fg` | `#18181b` | `#fafafa` | body text |
| `--muted` | `#52525b` | `#a1a1aa` | dates, secondary text (must pass AA on both `--bg` and `--surface`) |
| `--accent` | `#2563eb` | `#60a5fa` | links, primary button, active states |
| `--accent-fg` | `#ffffff` | `#09090b` | text on accent fills |
| `--chip-bg` / `--chip-fg` | `#eef2ff` / `#3730a3` | indigo at low alpha / `#c7d2fe` | tag labels |
| status badges | live green, beta amber, archived grey | dark equivalents | project status |

- Radius: 12 px cards, 999 px pills, 8 px buttons. Soft shadow on cards in light (`0 1px 2px` range); border only in dark.
- Type: system font stack (existing `--font`), tighter letter-spacing on large headings, clear scale (hero name ~2rem, card titles ~1.1rem, body 1.0625rem).
- Motion: cards lift slightly on hover (1–2 px, shadow); all transitions off under `prefers-reduced-motion: reduce`.
- `color-scheme` set per theme on `:root` so scrollbars and form controls match.
- Layout widths: page container ~1100 px max for grids; reading width ~70ch for post bodies.

### Top bar (all pages)

- Sticky, `--surface` with slight transparency and backdrop blur where supported (solid fallback), bottom border.
- Left: brand = small logo mark (CSS gradient square, decorative) + "geltech.dev" (host of `site.url`), linking home.
- Centre/right: pill nav (Home · Blog · Projects · About) as a segmented control; the current page is the raised white pill (`aria-current="page"` stays).
- Right: theme switch button (sun/moon inline SVG icon).
- **Phones (< ~640 px):** two rows: brand + switch on the first row, the four pills full-width on the second. No menu to open.
- Skip link stays.

### Theme switch

- One small inline script in `<head>` on every page, before CSS paints:
  1. Reads the saved choice (`localStorage` key `theme`, wrapped in try/catch).
  2. If saved, sets `data-theme="light|dark"` on `<html>`; if not, sets nothing and the CSS follows `prefers-color-scheme` live.
  3. Marks `<html>` as JS-capable so the switch becomes visible.
  4. Handles clicks on the switch (event delegation): works out the current effective theme (attribute, else media query), flips it, sets the attribute and saves it.
- CSS: light tokens on `:root`; dark tokens under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` **and** under `:root[data-theme="dark"]` (the current stylesheet already uses the first guard). Shiki code colours follow the same two selectors.
- Button: real `<button>`, accessible name that states the action ("Switch to dark theme" / "Switch to light theme", updated on click), visible focus. Hidden when JS is off, so there is never a dead button.
- Two states only. Once someone clicks, their choice wins on that device; clearing site data returns to the device setting.
- No layout shift: the button's space is reserved even before the script marks the page (or the button is hidden with `visibility`, not `display`).

### Home (`/`)

1. **Hero card**: headshot (existing `src/assets/headshot.png`, ~96 px, `astro:assets`, eager), name (h1), tagline, bio (D-3 kept: bio leads the page), buttons "Read the blog" (primary, `/blog/`) and "About me" (secondary, `/about/`). Subtle accent gradient background.
2. **Latest writing**: up to 4 post cards in a responsive grid (`auto-fill`, min ~280 px; one column on phones). "All posts →" link below.
3. **Projects**: project cards (same component as `/projects/`).
- **Empty state**: there are no published posts yet. Show one card: "First post coming soon" with a link to the RSS feed. It must look deliberate, not broken.

### Post card (home, `/blog/`)

- Tag labels (first 2 tags, not links), title (link to the post, whole card clickable via the title link's stretched hit area, not a wrapping `<a>`), description (clamped to 2 lines), date · "N min read".
- **Reading time** is new: words in the post body ÷ 225, rounded up, minimum 1. Computed at build. Pure helper in `src/lib/posts.ts` with a unit test.

### Blog index (`/blog/`)

- Page title + one-line intro, then all published posts as cards in the grid. Empty state as on home.

### Post page (`/blog/<slug>/`)

- Same top bar. The article sits on one `--surface` card, content width ~70ch, generous padding (reduced on phones, where the card goes nearly edge-to-edge).
- Header: tag labels, title, date · updated date · reading time.
- Body typography tuned for reading (headings, lists, blockquotes, code blocks with Shiki colours, tables).
- Share: "Share on LinkedIn" and "Share on X" as pill buttons (still plain links, FR-15).
- Older / newer posts as two small cards below the article.

### Projects (`/projects/`, and home)

- Card per project: name (h2/h3 as today), status badge (Live/Beta/Archived), summary, "Open ↗" button to `url`, "Source" link if `repo`. Grid like posts.

### About (`/about/`)

- Header (photo, name, tagline, email, social icons) becomes a hero card in the same style as home.
- Bio below in a card.
- CV tabs restyled as a pill segmented control matching the nav; the active panel sits in a card. Skill chips use the chip tokens. Tab behaviour and markup contract unchanged (`.tab-panel` sections in `cv.md`).
- Return-to-top button restyled to match.

### 404

- Centred card with the message and buttons to Home and Blog.

### Footer

- Muted, small: © year name · RSS. Same on every page.

### Build check (`scripts/verify-dist.ts`)

- Currently flags any non-JSON-LD script outside `/about/`. Change: also allow the theme script, identified by a fixed attribute (e.g. `id="theme-init"`), on every page. Any other script outside `/about/` still fails. Add a test.

### Spec and docs updates (part of this work)

- `docs/SPEC.md` → v0.6: rewrite §5.5 for the card-based design (replacing "minimal, text-first", D-1…D-5) while keeping: AA contrast, reading width on posts, bio leads home, text-led project cards, content first on posts. Update §2 styling row and §7 (dark mode toggle and reading time move out of Phase 2 as done).
- README if commands or structure change. Add `.superpowers/` to `.gitignore`.

## Testing

- Unit: reading time helper; verify-dist allows `id="theme-init"` everywhere and still rejects other scripts.
- `npm run check`, strict build, `npm run verify` pass.
- Manual (Wes, in a browser): each page at phone width and desktop, both themes, switch persists across pages and reloads, no flash on reload in dark mode, keyboard focus visible on nav pills, switch and tabs, CV tabs still work. Lighthouse mobile on home and a post (needs a published or preview post).

## Calls Claude made (Wes to check)

- Post pages keep a single reading column on one card; only list pages use the grid.
- Two theme states, no "auto"; no hamburger (two-row top bar on phones).
- Reading time shown; tags shown as non-clickable labels until tag pages exist.
- Home hero shows bio and two buttons; email and social icons stay on `/about/` only.
- The switch shows a moon in light theme and a sun in dark (the icon is the theme you'd switch to).
- Home shows 4 latest posts (was 5) to fill a 2-column grid evenly.

## Left to the builder

Exact spacing, shadows and breakpoints; the sun/moon SVGs; how components are split into files; the hero gradient; whether the post card's description clamp uses `line-clamp`. Keep to the tokens and constraints above.
