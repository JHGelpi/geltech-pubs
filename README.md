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
| CI/CD | GitHub Actions → `wrangler deploy` (production on `main`, previews on PRs) |
| Analytics | Cloudflare Web Analytics (cookieless) |

No database, no server-side code, no third-party trackers. Pages ship with essentially zero JavaScript.

## Getting started

Requires Node.js (LTS) and npm.

```bash
npm install
npm run dev        # local preview at http://localhost:4321
npm run build      # production build to dist/
npm run preview    # serve the built site locally
npm run check      # type and content checks (astro check)
```

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
heroImage: ./hero.png        # optional; otherwise a share image is generated
canonicalUrl: ""             # optional; only for posts first published elsewhere
---
```

> **This repo is public.** Anything committed, including drafts, can be read on GitHub. Use `--private` for anything not ready to be seen.

### Publishing

1. Push the branch and open a pull request.
2. CI runs checks (types, links, Lighthouse budget) and deploys a **preview URL**. Check the page and its share card there.
3. Set `draft: false`, merge to `main`. CI deploys to production.
4. Share the link on LinkedIn and X.

**Slugs are permanent.** Once a post is published, don't rename its file. If you must, add a redirect from the old URL.

## Project layout

```
src/
  site.config.ts        # name, tagline, social links: edit this first
  content/
    blog/               # posts (.md / .mdx, images alongside)
    projects/           # one entry per app or project
  pages/                # routes: /, /blog, /blog/[slug], /blog/tags/[tag], /about, /projects, 404
  layouts/  components/ # BaseHead (meta, OG, JSON-LD), PostLayout, TOC, ...
  styles/
public/                 # static files copied as-is (favicon, robots.txt)
scripts/new-post.*      # post scaffolding
docs/SPEC.md            # product spec and acceptance criteria
wrangler.jsonc          # Cloudflare Worker config (assets-only)
.github/workflows/      # CI and deploy
```

## Deployment setup (one-time)

1. **Cloudflare API token:** in the Cloudflare dashboard, create a token with permission to edit Workers on this account only. It should not have DNS edit rights.
2. **GitHub secrets:** in *Settings → Secrets and variables → Actions*, add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. **Custom domain:** after the first deploy, attach `geltech.dev` (and `www.geltech.dev`, redirected to the apex) to the `geltech-site` Worker. Only the apex and `www` records change; **the `dishkept` record and every other subdomain must stay as they are.**
4. Enable Cloudflare Web Analytics for the site.

## License

- **Code** (everything outside `src/content/`): [MIT](LICENSE).
- **Writing and images** in `src/content/`: © the author, all rights reserved. Please link rather than republish.
