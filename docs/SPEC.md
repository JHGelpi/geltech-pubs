# geltech.dev Personal Site & Blog — Product Spec v0.6

**Owner:** Wes · **Status:** Ready for Claude Code · **Last updated:** 2026-11-21

**Changelog**
- v0.6: Card-based design replaces "minimal, text-first" (§5.5 rewritten); light/dark switch (FR-8) and reading time shipped, moved out of Phase 2.
- v0.5: /about/ mirrors the CV site (jhgelpi.github.io/cv): same sections, CV sections as tabs (approved client JS, /about/ only), email address and Bluesky link shown; phone and city stay off the site.
- v0.4: CV moved onto /about/ (employer names allowed only there); bio field; www redirect via dashboard rule; custom domain declared in wrangler.jsonc.
- v0.3: All open questions resolved: the root is a placeholder (safe to replace), the repo is public, the design is minimal and text-first, and the byline is full name with a generic role (employer not named). Added a single site config file and design requirements.
- v0.2: URL decision locked: personal site at the root, blog at `/blog`; apps stay on their own subdomains (e.g. `dishkept.geltech.dev`). DNS is already on Cloudflare.
- v0.1: Initial draft.

## 1. Problem & goal

Wes wants a personal site with a blog on his own domain, to build a professional profile in data engineering and data platform leadership. Distribution happens on LinkedIn and X/Twitter; the site's job is to be the **canonical, credible home** for the writing and a hub for the apps he builds.

**Goals**
- Publish a post by writing Markdown and running `git push`; no CMS, no admin UI.
- Own the domain, content, design, and SEO end to end.
- Look sharp when shared: every post produces a good LinkedIn/X preview card.
- Fast and private: near-perfect Lighthouse scores, no third-party trackers.
- Effectively $0/month to run (domain renewal aside).

**Non-goals (v1)**
- Email newsletter, paid subscriptions, comments, user accounts.
- A visual CMS or WYSIWYG editor.
- Multi-author support.
- Hosting or changing any app on a geltech.dev subdomain.

## 2. Success metrics

| Metric | Target |
|---|---|
| Time from finished draft to live post | < 5 minutes |
| Lighthouse (mobile) Performance / Accessibility / Best Practices / SEO | ≥ 95 each |
| Total JS shipped on a post page | ≈ 0 KB (no client JS unless a component needs it) |
| Share-card validation | Passes LinkedIn Post Inspector and renders correctly on X |
| Hosting cost | $0/month |

## 3. Tech decisions

| Area | Decision | Rationale |
|---|---|---|
| Site generator | **Astro** (latest stable), static output | Markdown/MDX content collections, zero-JS by default, strong ecosystem (RSS, sitemap). |
| Hosting | **Cloudflare Workers with Static Assets** (assets-only `wrangler.jsonc`) | As of 2026, Cloudflare recommends Workers Static Assets over Pages for new projects; it's free for static traffic and new features ship there. |
| Domain / DNS | Bare domain `geltech.dev` attached to the Worker as a Custom Domain; DNS already on Cloudflare | `.dev` requires HTTPS (HSTS preload); Cloudflare issues the certificates automatically. |
| Domain layout | **Root = personal site + `/blog`. Subdomains = apps** (`dishkept.geltech.dev`, future apps) | One identity for the profile; each app stays independent. |
| Repo | **Public** GitHub repo | Doubles as a portfolio piece. Note: drafts committed to the repo are publicly readable (see FR-3a). |
| CI/CD | GitHub Actions → `wrangler deploy`; preview deploys on PRs | Drafts can be reviewed at a preview URL before merging. |
| Styling | **Card-based, app-like**; plain CSS (no framework), system font stack | Polished look with the smallest payload and least maintenance. See §5.5. |
| Analytics | Cloudflare Web Analytics (cookieless) | Privacy-friendly, free, no consent banner needed. |

## 4. URL structure

- `https://geltech.dev/`: home (short bio, latest posts, featured projects)
- `https://geltech.dev/blog/`: post index, newest first
- `https://geltech.dev/blog/<slug>/`: individual post
- `https://geltech.dev/blog/tags/<tag>/`: posts by tag
- `https://geltech.dev/about/`: bio, email, links (LinkedIn, GitHub, X, Bluesky) and the full CV with its sections as tabs
- `https://geltech.dev/projects/`: cards for apps and projects, linking out (Dishkept → `https://dishkept.geltech.dev`)
- `https://geltech.dev/rss.xml`, `/sitemap-index.xml`, `/robots.txt`
- `www.geltech.dev` → 301 to the bare domain; `*.workers.dev` must not be indexable (redirect or `noindex`). The `www` redirect is a Cloudflare Redirect Rule created in the dashboard; the apex is declared as a Custom Domain in `wrangler.jsonc`.

### 4.1 Domain guardrails (must-haves)
- **G-1** The bare domain currently serves only a placeholder, so it can be replaced outright. Still export a snapshot of the DNS records before cutover.
- **G-2** Attaching the Worker to `geltech.dev` must touch **only** the apex (and `www`) records. The `dishkept` record and any other subdomain records stay unchanged.
- **G-3** HSTS set by the blog must **not** use `includeSubDomains`, so the blog's headers can't affect the apps.
- **G-4** Cookies or analytics set by the blog are scoped to `geltech.dev` only, never `.geltech.dev`.
- **G-5** After cutover, smoke-test `https://dishkept.geltech.dev` still loads and works.

## 5. Functional requirements

### 5.0 Site config
- **FR-0** One typed config file (`src/site.config.ts`) holds identity and links, used by every page, the OG images, and the JSON-LD:
  ```ts
  export const site = {
    name: "<FULL NAME>",            // Wes to fill in; used as byline
    tagline: "<generic role>",       // e.g. "R&D leader · data platforms & engineering"
    bio: "<2–3 generic sentences>",  // home and About; Wes to fill in
    url: "https://geltech.dev",
    links: { linkedin: "", github: "https://github.com/JHGelpi", x: "" },
  };
  ```
- **FR-0a** **No employer name** anywhere on the site (bio, About, JSON-LD `worksFor`), **except the CV section of `/about/`**, which may name current and past employers. `/about/`'s meta description, share card and JSON-LD stay generic. Role descriptions elsewhere stay generic.

### 5.1 Content authoring
- **FR-1** Posts live in `src/content/blog/` as `.md` or `.mdx`, one file (or folder with co-located images) per post.
- **FR-2** Frontmatter is validated with a schema; the build fails on invalid frontmatter:
  ```yaml
  title: string            # required
  description: string      # required, ≤ 160 chars (used for meta + share card)
  pubDate: date            # required
  updatedDate: date        # optional
  tags: string[]           # optional
  draft: boolean           # default false; drafts excluded from production builds
  heroImage: string        # optional
  canonicalUrl: string     # optional, for cross-posts
  ```
- **FR-3** Drafts (`draft: true`) render in local dev and PR previews but never in production, RSS, or the sitemap.
- **FR-3a** Because the repo is public, the README documents that committed drafts are publicly readable. For sensitive drafts, write outside the repo (or in a git-ignored `drafts/` folder, which the `new-post` script supports via a `--private` flag) until they're ready.
- **FR-4** Code blocks get syntax highlighting at build time (Shiki), with a copy button as the one allowed bit of client JS.
- **FR-5** Supports tables, footnotes, heading anchors, and Mermaid diagrams (rendered at build time, or lazy-loaded only on pages that use them).
- **FR-6** Images are optimized at build time (responsive sizes, modern formats, width/height set to prevent layout shift).
- **FR-6a** Projects live in `src/content/projects/` (name, one-line summary, URL, status, optional repo link and screenshot) and are validated with a schema like posts.

### 5.2 Reading experience
- **FR-7** The post page shows title, date, updated date if any, estimated reading time, tags, and a table of contents for posts with 3+ H2s.
- **FR-8** Light and dark themes follow the OS preference, with a manual toggle.
- **FR-9** Previous/next post links at the bottom of each post.
- **FR-10** Responsive, accessible (WCAG 2.2 AA): semantic HTML, keyboard navigation, visible focus, sufficient contrast.
- **FR-10a** Site-wide nav: Home · Blog · Projects · About.

### 5.3 Distribution & SEO (most important for a professional profile)
- **FR-11** Every page has `<title>`, meta description, canonical URL, Open Graph, and Twitter Card tags.
- **FR-12** **Auto-generated share images**: each post gets a 1200×630 OG image built at build time (e.g. Satori), showing the post title, "geltech.dev", and `site.name`. A `heroImage` overrides it. Same minimal style as the site.
- **FR-13** JSON-LD structured data: `BlogPosting` on posts, `Person` on the home and about pages (name, `jobTitle` from the generic tagline, `sameAs` links; no `worksFor`).
- **FR-14** RSS feed with full post content; sitemap; `robots.txt`.
- **FR-15** Each post has "Share on LinkedIn" and "Share on X" links that are plain URLs, not embedded third-party scripts.
- **FR-16** Supports `canonicalUrl` so cross-posts elsewhere (e.g. LinkedIn articles, Hashnode) point back to geltech.dev.

### 5.4 Operations
- **FR-17** A push to `main` builds and deploys to production; a PR gets a preview URL.
- **FR-18** CI runs `astro check`, a link checker, and a Lighthouse CI budget; the build fails on errors.
- **FR-19** A 404 page in the site's style.
- **FR-20** Security headers: HSTS (no `includeSubDomains`, per G-3), CSP (strict, no inline scripts except hashed), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **FR-21** Dependabot or Renovate keeps dependencies current, with auto-merge for patch releases if CI passes.
- **FR-22** The repo includes a README (what it is, how to write and publish a post) and a license (MIT for code; content © the author, stated separately).
- **FR-23** No secrets in the repo; the Cloudflare API token lives in GitHub Actions secrets, scoped to deploy this Worker only.

### 5.5 Design (card-based)
Light grey page, white rounded cards, one accent colour, a sticky top bar with pill navigation and a light/dark switch. Dark theme is the same layout with dark cards. Details: `docs/superpowers/specs/2026-11-21-modern-ui-design.md`.
- **D-1** Post text stays in one readable column (~65–75 characters wide) on a single card; grids are only for lists of posts and projects.
- **D-2** Neutral palette with one accent colour; every text and UI colour pair meets WCAG AA in both themes.
- **D-3** Home leads with a hero card holding the bio, then the latest posts as cards (empty state when there are none).
- **D-4** Project cards are text-led (name, status, one line, link); screenshots optional.
- **D-5** Content first on post pages: no sidebars or widgets around the article.
- **D-6** The theme follows the device setting until the reader picks one with the switch; the choice is remembered on that device. No flash of the wrong theme; the switch is hidden when JS is off.

## 6. Publishing workflow (target)

1. `git checkout -b post/<slug>` → `npm run new-post "<title>"` (a script that scaffolds the file with frontmatter and `draft: true`; `--private` writes to the git-ignored `drafts/` folder instead).
2. Write in your editor; run `npm run dev` for a live preview.
3. Open a PR, check the preview URL and share card, then flip to `draft: false` and merge.
4. Share the link on LinkedIn and X.

## 7. Phasing

**Phase 1: MVP (one weekend)**
- Astro scaffold, site config, content schemas (posts + projects), home, blog index, post page, About, Projects (with Dishkept), RSS, sitemap, minimal theme.
- DNS snapshot (G-1); deploy to Workers Static Assets; attach `geltech.dev` + `www` redirect; verify Dishkept is unaffected (G-5).
- OG/Twitter meta tags with a default share image; README and license.

**Phase 2: Polish**
- Per-post generated OG images, JSON-LD, tags pages, table of contents. (Reading time and the dark mode toggle shipped in v0.6.)
- CI checks (astro check, links, Lighthouse budget), PR previews, security headers.
- Cloudflare Web Analytics.

**Phase 3: Later / optional**
- Email subscriptions via an external tool (e.g. Buttondown), fed from RSS, if readers ask for it.
- Site search (Pagefind; static, no server).
- "Now" page; richer project write-ups (ETL pipeline, research agent, MettleBox) as case-study posts.

## 8. Acceptance criteria (MVP)

- [ ] `https://geltech.dev/blog/<slug>/` serves a published post over HTTPS; `www` and `workers.dev` don't create duplicate indexed content.
- [ ] `https://dishkept.geltech.dev` works exactly as before cutover.
- [ ] `/projects/` links to Dishkept; nav works on every page.
- [ ] The byline, About page, and JSON-LD read from `site.config.ts`; no employer name appears outside the CV section of `/about/`.
- [ ] A post with `draft: true` is absent from the production site, RSS, and sitemap.
- [ ] Invalid frontmatter fails the build with a clear error.
- [ ] Pasting a post URL into LinkedIn Post Inspector shows the correct title, description, and image (deferred to the first real post).
- [ ] Lighthouse mobile ≥ 95 in all four categories on the home page and a sample post.
- [ ] No third-party requests on page load other than Cloudflare's own analytics beacon.

## 9. Decisions

- ✅ Blog lives at `geltech.dev/blog`; root is the personal site; apps stay on subdomains.
- ✅ geltech.dev DNS is already on Cloudflare; the root currently serves only a placeholder, so it's safe to replace.
- ✅ Public GitHub repo; private drafts kept outside version control.
- ✅ Minimal, text-first design.
- ✅ Byline is full name with a generic role; employer not named.

**To fill in before launch:** `site.name`, `site.tagline`, LinkedIn and X URLs in `site.config.ts`, plus the About page bio.
