# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The source for **geltech.dev**: a personal site and blog that builds the author's professional profile in data engineering and data platform leadership. Readers mostly arrive from links shared on LinkedIn and X, so **fast pages and correct share cards matter more than features.**

**The source of truth is [`docs/SPEC.md`](docs/SPEC.md).** Read it before starting any task. Requirement IDs (FR-*, G-*, D-*) refer to it. If a request conflicts with the spec, say so and ask before proceeding; don't quietly diverge.

## Stack (decided, don't substitute)

- **Astro** (latest stable), `output: 'static'`. No SSR adapter, no server code.
- **Content collections** with Zod schemas for `blog` and `projects`.
- **Plain CSS** (no Tailwind, no CSS framework). System font stack or one self-hosted variable font.
- **Cloudflare Workers with Static Assets**, assets-only `wrangler.jsonc` pointing at `./dist`. Not Cloudflare Pages, and not the deprecated Workers Sites.
- **GitHub Actions** for CI and deploys via the official `cloudflare/wrangler-action` (pin the newest major version).
- Use `npm`. Pin exact versions of anything added.

Before adding any dependency, check whether Astro or the platform already does it. Prefer fewer dependencies.

## Commands

```bash
npm run dev        # dev server
npm run build      # static build to dist/
npm run preview    # serve dist/
npm run check      # astro check (types + content schemas)
npm run new-post "Title" [-- --private]
```

Run `npm run check` and `npm run build` before declaring any task done.

## Non-negotiables

These come from the spec and must hold in every change:

1. **No third-party requests on page load** except the Cloudflare Web Analytics beacon. No Google Fonts CDN, no embedded social widgets, no external scripts. Share buttons are plain links.
2. **Near-zero client JS.** Allowed: theme toggle, code-block copy button, Mermaid only on pages that use it, and the CV tabs on `/about/`. Anything else needs approval.
3. **Drafts never ship.** `draft: true` posts are excluded from production pages, tags, RSS, sitemap and OG images. They do render in `npm run dev` and in PR previews.
4. **Identity comes only from `src/site.config.ts`.** Never hard-code the author's name or links elsewhere.
5. **Never name an employer** outside the CV section of `/about/` (`src/content/pages/cv.md`). Not in other copy, not in `/about/`'s meta or share card, never in JSON-LD (`worksFor` is not used).
6. **Slugs are permanent.** Slug comes from the file name. Never change the slug of a published post without adding a redirect.
7. **Domain safety (G-1…G-5).** The site owns only the `geltech.dev` apex and `www`. Never create, change or delete any other DNS record, especially `dishkept`. HSTS must **not** use `includeSubDomains`. Cookies, if any, are scoped to `geltech.dev`, never `.geltech.dev`.
8. **Accessibility:** WCAG 2.2 AA. Semantic HTML, visible focus, AA contrast in both themes.
9. **Performance budget:** Lighthouse mobile ≥ 95 in all four categories on home and a sample post.

## Things you must not do without asking

- Run `wrangler deploy` (or any command that changes Cloudflare) from a local machine. Deploys happen through CI only.
- Touch DNS, custom domains or Cloudflare account settings.
- Commit secrets, `.env*`, `.dev.vars` or anything in `drafts/`.
- Edit or rewrite post content in `src/content/blog/`. That's the author's writing. You may fix frontmatter that fails validation, and you should point out typos rather than fix them silently.
- Add analytics, tracking, comments, newsletters or any third-party service.

## Conventions

- **Branches:** `feat/…`, `fix/…`, `chore/…` for code; `post/<slug>` for writing. Open a PR; never push directly to `main`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `content:`).
- **TypeScript** in strict mode for config, scripts and components.
- **CSS:** custom properties for colors and spacing; `prefers-color-scheme` plus a `data-theme` override; one readable column of about 65–75 characters.
- **Images:** use `astro:assets` for anything in `src/`; always set width and height.
- **Meta:** every page goes through one `BaseHead` component (title, description, canonical, OG, Twitter, JSON-LD). Don't scatter `<meta>` tags.

## Build order

Follow the phases in `docs/SPEC.md` §7. For Phase 1 (MVP), a sensible order:

1. Scaffold Astro (static), strict TS, `site.config.ts`, base layout and `BaseHead`.
2. Content collections and schemas for `blog` and `projects`; draft filtering helper used everywhere.
3. Routes: `/`, `/blog/`, `/blog/[slug]/`, `/about/`, `/projects/`, `404`.
4. RSS, sitemap, `robots.txt`; default share image.
5. `scripts/new-post` with `--private` support.
6. `wrangler.jsonc` (assets-only, `./dist`), `www` → apex redirect, `workers.dev` set to noindex.
7. GitHub Actions: build and deploy on push to `main`. (CI checks, link checker, Lighthouse budget and PR previews are Phase 2.)
8. Seed one sample post and the Dishkept project entry; verify against the acceptance criteria in §8.

The DNS steps in Phase 1 (snapshot, attaching the custom domain, the Dishkept smoke test) are done by the author in the Cloudflare dashboard. Prepare a checklist for them; don't do them yourself.

Work in small PRs, one step or so each. After each step, summarize what changed and which FR/G/D items it covers.

## Definition of done

- `npm run check` and `npm run build` pass with no warnings you introduced.
- The relevant acceptance criteria in `docs/SPEC.md` §8 hold.
- No new third-party requests and no new client JS (or they were explicitly approved).
- README updated if commands, setup or structure changed.
