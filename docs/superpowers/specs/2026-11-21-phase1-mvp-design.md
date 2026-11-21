# geltech.dev Phase 1 (MVP) — Design

**Date:** 2026-11-21 · **Spec:** `docs/SPEC.md` v0.3 (amended below) · **Status:** draft for approval

## Intent

Build the first live version of geltech.dev: a fast, credible home for Wes's writing and projects, shared mainly via LinkedIn and X. Publishing is Markdown + `git push`. Phase 1 is the MVP in SPEC §7; anything the spec puts in Phase 2 stays out.

## Goals

- Every Phase 1 item in SPEC §7 and every §8 acceptance criterion that can be met without a real post.
- `/about/` carries Wes's full CV, moved from the `JHGelpi/cv` repo, which this site replaces as the place the CV is edited.
- Nothing placeholder or draft ever reaches production.

## Non-goals (deferred to Phase 2 per spec)

Per-post generated OG images, tag pages, reading time, table of contents, theme toggle, code copy button, Mermaid, JSON-LD beyond what's free in `BaseHead`, CI checks/link checker/Lighthouse budget, PR previews, security headers, Cloudflare Web Analytics, Dependabot.

Also out: print/PDF styling for the CV (Wes declined).

## Anti-goals

- Any employer name outside the CV section of `/about/` (including `/about/`'s own meta description, share card and JSON-LD).
- A placeholder name/link or the sample post going live.
- Any third-party request on page load; any client JS.
- Touching DNS, Cloudflare settings or the `cv` repo from this work.

## Decisions made in conversation

1. **`www` → apex redirect:** a Cloudflare **Redirect Rule** created by Wes in the dashboard (301, preserve path and query). The Worker stays assets-only; no redirect code in the repo.
2. **Employer-name exception:** the CV section of `/about/` names all employers (current and past). **Everywhere else FR-0a holds.** This is written into SPEC FR-0a and CLAUDE.md non-negotiable 5 as part of this work.
3. **CV source of truth:** moved into this repo, ported once from `WesGelpiResume.md`. Wes retires or redirects the GitHub Pages CV himself.
4. **No PDF/print styling.**
5. **No first post yet:** seed one sample post with `draft: true`. The §8 LinkedIn Post Inspector check is deferred to Wes's first real post.
6. **RTK tooling block** appended to `CLAUDE.md` is removed (it duplicates Wes's global `~/.claude/RTK.md` and the repo is public); `.rtk/` is git-ignored.
7. **Custom domain declared in `wrangler.jsonc`** (`routes: [{ pattern: "geltech.dev", custom_domain: true }]`) so every CI deploy keeps it attached. Consequence: the first CI deploy creates the apex DNS record. It touches only the apex (G-2), and Wes approved CI making this change.
8. **Dishkept stays as the seed project** on `/projects/`, per the original spec (FR-6a, §8). This repo only links to it; the Dishkept app itself is out of scope. Guardrails G-1…G-5 stay as written.
9. **`bio` field** added to `site.config.ts`, filled in by Wes later, covered by the placeholder guard.

## Approaches

The stack is fixed by SPEC §3 and CLAUDE.md, so there's one build approach. The open choice was the CV format:

| Option | Trade-off | Outcome |
|---|---|---|
| **Plain Markdown**, one `###` per role | Edited like a post; clean semantic HTML; layout consistency rests on a convention | **Chosen** (Claude's pick, Wes didn't object) |
| Structured YAML + Zod schema | Enforced layout; clumsy for paragraph text; a schema for one page | Rejected |
| Port the Docs-export tables as-is | Layout tables fail WCAG AA and break on mobile | Ruled out |

## Design

### Repo housekeeping (first PR)

- Add `.gitattributes` (`* text=auto eol=lf`) and renormalize. The current "modified" files differ only in CRLF line endings.
- Move `SPEC.md` → `docs/SPEC.md` (CLAUDE.md already points there).
- Remove the RTK block from `CLAUDE.md`; add `.rtk/` to `.gitignore`.
- Amend SPEC FR-0a and CLAUDE.md rule 5 with the CV exception; amend SPEC §4 to record the `www` redirect as a dashboard Redirect Rule and the custom domain as declared in `wrangler.jsonc`; bump SPEC to v0.4 with a changelog line.

### Site config

`src/site.config.ts` per FR-0 plus `bio`: `name: "Wes Gelpi"`, `tagline`, `bio` (2–3 generic sentences, used on `/` and `/about/`), `url`, `links`. Wes fills in tagline, bio, LinkedIn and X later; until then they hold `<…>` placeholders.

**Placeholder guard:** runs only when `SITE_STRICT=1` (set in the deploy workflow). The build then fails with a clear message if `tagline` or `bio` still contains `<…>` placeholder text or any `links` value is empty. A link Wes doesn't want shown is removed from the object, not left empty. Local and PR builds pass with placeholders.

### Content collections (`src/content.config.ts`)

- `blog`: FR-2 schema exactly (`description` max 160). Glob loader over `src/content/blog/**/*.{md,mdx}`; slug = file or folder name.
- `projects`: FR-6a (name, summary, url, status, optional repo, optional screenshot).
- `pages`: holds `cv.md`; schema just `{ title: string }`.
- One helper, `isPublished(post)` = `import.meta.env.PROD ? !post.data.draft : true`, used by every listing: home, blog index, post routes (`getStaticPaths`), prev/next, RSS. The sitemap is built from those routes, so drafts never get pages in production and never reach it.

### Routes

| Route | Content |
|---|---|
| `/` | `site.bio`, latest 5 posts as a dated list, featured projects if any (D-3). Empty state: "No posts yet." |
| `/blog/` | All published posts, newest first, same empty state. |
| `/blog/[slug]/` | Title, pubDate, updatedDate if set, tags as plain text (no tag pages yet), body, prev/next (FR-9), "Share on LinkedIn" and "Share on X" plain links (FR-15). `canonicalUrl` overrides canonical (FR-16). |
| `/about/` | Headshot + name + tagline + generic short bio + links, then the rendered `cv.md` (Experience, Speaking, Patents & education, Philanthropy, Tools). |
| `/projects/` | Text-led cards from the `projects` collection (D-4); Dishkept → `https://dishkept.geltech.dev`. Empty state ("Projects coming soon.") only if every entry is removed. |
| `404` | Site-styled. |

Nav on every page: Home · Blog · Projects · About (FR-10a), with `aria-current="page"`.

### About / CV specifics

- `src/content/pages/cv.md` is a cleanup port of `WesGelpiResume.md` (including the opening summary and Key Strengths): Wes's wording kept, tables turned into headings and paragraphs, "Insititute" typo fixed. The role convention is `### Title · Company · Mon YYYY – Mon YYYY` with a paragraph under it. Wes reviews the port in the PR.
- **Excluded from the port:** phone, email, street-level location.
- Headshot: `ProfessionalHeadshot360.png` copied to `src/assets/`, rendered with `astro:assets` `<Image>` (WebP, explicit width/height, meaningful `alt`).
- `/about/` meta description, OG/Twitter tags and `Person` JSON-LD (`name`, `jobTitle` = tagline, `url`, `sameAs` links; no `worksFor`) use only generic text from `site.config.ts`.

### BaseHead and share image

- One `BaseHead.astro`: title, description, canonical, OG, Twitter (`summary_large_image`), and `Person` JSON-LD when a page passes it (home and about). `BlogPosting` waits for Phase 2.
- Default share image `public/og-default.png`, 1200×630: "geltech.dev" + `site.name` + tagline on the site's neutral background. Generated in the deploy PR, after Wes's real values exist, by a small script using `sharp` (already installed by Astro) from an SVG template, and committed. Not regenerated per build. A post's `heroImage` overrides it.

### Styling

Plain CSS, one global stylesheet. System font stack. Custom properties for color and spacing; light/dark via `prefers-color-scheme` only (the toggle is Phase 2, but variables are structured so a `data-theme` override drops in). Single column `max-width: 70ch`. One accent color for links, AA contrast in both themes, visible `:focus-visible` outline. Tone reference: Simon Willison / Julia Evans (D-5).

### Feeds and SEO files

- `@astrojs/rss` at `/rss.xml`, full content (FR-14), published posts only.
- `@astrojs/sitemap` → `/sitemap-index.xml`.
- `public/robots.txt` allowing all, pointing at the sitemap.

### `new-post` script

`scripts/new-post.ts` (run through Node's built-in TS type stripping; no `tsx` dependency if the pinned Node supports it). `npm run new-post "Title" [-- --private]`:
- slugifies the title, writes `src/content/blog/<slug>.md` (or `drafts/<slug>.md` with `--private`) with FR-2 frontmatter, `pubDate` = today, `draft: true`;
- refuses to overwrite an existing file;
- prints the path and the `post/<slug>` branch name.
- `drafts/` is in `.gitignore`. A small self-check covers slugify.

### Deployment

- `wrangler.jsonc`: `name`, `compatibility_date`, `assets: { directory: "./dist", not_found_handling: "404-page" }`, `routes` with the `geltech.dev` custom domain, **`workers_dev: false`** (no indexable workers.dev route), no `main` script.
- `public/_headers`: `https://:version.:subdomain.workers.dev/*` → `X-Robots-Tag: noindex`. This is a safety net for when preview URLs arrive in Phase 2 (Cloudflare documents this pattern).
- `.github/workflows/deploy.yml`: on push to `main`: checkout, setup Node (pinned LTS), `npm ci`, `npm run check`, `SITE_STRICT=1 npm run build`, `cloudflare/wrangler-action` (newest major, pinned) `deploy`. Secrets: `CLOUDFLARE_API_TOKEN` (scoped to this Worker), `CLOUDFLARE_ACCOUNT_ID`.
- No local `wrangler deploy`. Ever.

### Seed content

- `src/content/blog/hello-world.md`: sample post, **`draft: true`**, exercising code block, table and footnote. Never ships.
- `src/content/projects/dishkept.md`: Dishkept entry, URL `https://dishkept.geltech.dev`, status live. Claude drafts the one-line summary; Wes approves it in the PR.

### README / license

README covers: what it is, commands, how to publish a post (SPEC §6), the public-drafts warning (FR-3a), the CV location. License: MIT for code (existing `LICENSE`), plus a line saying content © Wes Gelpi (FR-22).

## Wes's manual checklist (delivered as `docs/launch-checklist.md`)

1. Export a DNS snapshot (G-1).
2. Create a Cloudflare API token scoped to this Worker; add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets (FR-23).
3. Fill in tagline, bio, LinkedIn and X in `site.config.ts` (the deploy build fails until done); the default share image is generated from these.
4. Only then merge the deploy PR. Its first CI deploy creates the `geltech.dev` custom domain; confirm in DNS that only the apex record changed (G-2).
5. Add `www` DNS record (proxied) + Redirect Rule `www.geltech.dev/*` → `https://geltech.dev/${1}` 301, preserving the query string.
6. Confirm HSTS settings don't use `includeSubDomains` (G-3).
7. Smoke-test `https://dishkept.geltech.dev` still loads and works (G-5).
8. Retire or redirect the GitHub Pages CV.
9. On the first real post: LinkedIn Post Inspector + X card check (§8).

## Acceptance (Phase 1)

SPEC §8, with two adjustments: the LinkedIn Post Inspector item is deferred to the first real post; "no employer name anywhere" now reads "no employer name outside the CV section of `/about/`". Plus: `npm run check` and `npm run build` pass clean; the built `dist/` contains no `hello-world` page, RSS item or sitemap entry; `dist/` has no `<script>` tags apart from the JSON-LD block, which isn't executable.

## Calls Claude made (check these)

- Placeholder guard only in the deploy build (`SITE_STRICT=1`).
- Deploy PR held until checklist steps 1–3 are done.
- Share image generated in the deploy PR from final values.
- CV port keeps summary and Key Strengths.
- Dishkept summary drafted by Claude for Wes's approval.
- `workers_dev: false` plus a `_headers` noindex rule for workers.dev hosts.
- System font stack; OS-only theme in Phase 1.

## Left to the builder

Exact palette values (within AA), spacing scale, component file layout, slugify details, the OG image's typographic layout, the Node LTS version, PR boundaries (CLAUDE.md: small PRs, one step or so each).
