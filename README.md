# geltech.dev

Source for [geltech.dev](https://geltech.dev): my personal site and blog, writing about data engineering, data platforms and leading technical teams.

- **Blog:** `https://geltech.dev/blog/<slug>/`
- **Projects:** apps I build live on their own subdomains (e.g. [dishkept.geltech.dev](https://dishkept.geltech.dev)) and are listed at `/projects/`.

> **Status:** under construction. The plan is in [`docs/SPEC.md`](docs/SPEC.md).

## Stack

| Layer | Choice |
|---|---|
| Site generator | [Astro](https://astro.build), static output |
| Content | Markdown/MDX in Git, validated by content-collection schemas |
| Hosting | Cloudflare Workers with Static Assets |
| CI/CD | GitHub Actions → `wrangler deploy` on push to `main`; PRs run the same checks, a Lighthouse budget, and upload a preview with drafts |
| Analytics | Cloudflare Web Analytics, cookieless (Phase 2) |

No database, no server-side code, no third-party trackers. Pages ship with essentially zero JavaScript.

## Getting started

Requires Node.js 24 (`.nvmrc`; run `nvm use`) and npm.

```bash
npm install
npm run dev        # local preview at http://localhost:4321
npm run build      # production build to dist/
npm run preview    # serve the built site locally
npm run check      # type and content checks (astro check)
npm test           # unit tests (node:test)
npm run verify     # after a build: fails if dist/ has client JS, a draft, an employer name outside /about/, or a broken internal link
npm run og         # regenerate public/og-default.png from site.config.ts
```

CI deploys with `SITE_STRICT=1`, which fails the build while `site.config.ts` still has placeholders.

## Writing a post

```bash
git checkout -b post/my-post-title
npm run new-post "My Post Title"             # creates src/content/blog/my-post-title.md with draft: true
npm run new-post "My Post Title" -- --private  # writes to drafts/ instead (git-ignored, never committed)
```

Frontmatter:

```yaml
---
title: "My Post Title"
description: "One or two sentences, max 160 characters. Used for search results and share cards."
pubDate: 2026-11-21
updatedDate: 2026-11-22      # optional
tags: [data-platforms, leadership]
draft: true                  # drafts never reach production, RSS or the sitemap
heroImage: /images/hero.png  # optional; otherwise the default share image is used
canonicalUrl: ""             # optional; only for posts first published elsewhere
---
```

> **This repo is public.** Anything committed, including drafts, can be read on GitHub. Use `--private` for anything not ready to be seen.

### Publishing

1. Push the branch and open a pull request.
2. Check the post locally with `npm run dev` (PR preview URLs and CI checks on PRs arrive in Phase 2).
3. Set `draft: false`, merge to `main`. CI tests, builds and deploys to production.
4. Share the link on LinkedIn and X.

**Slugs are permanent.** Once a post is published, don't rename its file. If you must, add a redirect from the old URL.

## Project layout

```
src/
  site.config.ts        # name, tagline, bio, social links: edit this first
  content/
    blog/               # posts (.md, images alongside)
    projects/           # one entry per app or project
    pages/cv.md         # the CV shown on /about/ (the only place employers are named)
  pages/                # routes: /, /blog, /blog/[slug], /blog/tags/[tag], /og/blog/[slug].png (share cards), /about, /projects, rss.xml, 404
  layouts/  components/ # BaseLayout, BaseHead (meta, OG, JSON-LD), Nav, theme switch, post and project cards
  lib/                  # draft filter, reading time, config guard, JSON-LD, share-card SVG
  scripts/theme-init.js # the light/dark switch, inlined at the top of every page's <body>
  styles/global.css
public/                 # copied as-is (robots.txt, _headers security headers, og-default.png)
scripts/                # new-post, verify-dist, og-default, csp (writes the CSP into dist/_headers on build)
docs/SPEC.md            # product spec and acceptance criteria
docs/launch-checklist.md # one-time manual steps (DNS, secrets, redirect)
wrangler.jsonc          # Cloudflare Worker config (assets-only)
.github/workflows/      # CI and deploy
```

## Deployment

Deploys happen only from CI (`.github/workflows/deploy.yml`) on push to `main`; pull requests run the same checks but skip the deploy step. Each PR also gets a preview (drafts included) at `pr-<number>-geltech-dev.<subdomain>.workers.dev`, linked as "View deployment" on the PR; it's an uploaded version, never deployed to `geltech.dev`, and marked `noindex`. Never promote a preview version in the Cloudflare dashboard: it contains drafts. Never run `wrangler deploy` locally.

`wrangler.jsonc` defines an assets-only Worker named `geltech-dev` with `geltech.dev` as its Custom Domain and no `workers.dev` route. `www` → apex is a Cloudflare Redirect Rule, not code. One-time setup (DNS snapshot, API token, secrets, redirect, smoke tests) is in [`docs/launch-checklist.md`](docs/launch-checklist.md).

**Only the apex and `www` belong to this site.** The `dishkept` record and every other subdomain must stay as they are.

## License

- **Code** (everything outside `src/content/`): [MIT](LICENSE).
- **Writing and images** in `src/content/`: © the author, all rights reserved. Please link rather than republish.
