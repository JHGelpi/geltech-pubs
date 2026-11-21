# Launch checklist (Wes, by hand)

Claude doesn't do these: they touch DNS, Cloudflare settings or secrets. Work top to bottom.

- [ ] **1. DNS snapshot (G-1).** Cloudflare dashboard → geltech.dev → DNS → Records → Export. Keep the file outside this repo.
- [ ] **2. API token and secrets (FR-23).** Create a Cloudflare API token from the "Edit Cloudflare Workers" template, scoped to your account and the `geltech.dev` zone. Add it to GitHub → Settings → Secrets and variables → Actions as `CLOUDFLARE_API_TOKEN`, and your account ID as `CLOUDFLARE_ACCOUNT_ID`.
- [ ] **3. Fill in identity.** In `src/site.config.ts` set `tagline`, `bio`, `links.linkedin`, `links.x` (or delete a link you don't want). Then run `npm run og` and commit `public/og-default.png`. Replace the Dishkept summary in `src/content/projects/dishkept.md`.
- [ ] **4. Merge the deploy PR.** The first CI deploy attaches `geltech.dev` as a Custom Domain on the Worker. Then check DNS: only the apex record changed; `dishkept` and every other record are untouched (G-2). Compare against the snapshot from step 1.
- [ ] **5. `www` redirect.** Add a proxied `www` DNS record (e.g. `AAAA www 100::`), then Rules → Redirect Rules → new rule: hostname equals `www.geltech.dev` → dynamic redirect to `concat("https://geltech.dev", http.request.uri.path)`, status 301, preserve query string.
- [ ] **6. HSTS (G-3).** SSL/TLS → Edge Certificates → HSTS: if enabled, **Include subdomains must be off**.
- [ ] **7. Dishkept smoke test (G-5).** Open `https://dishkept.geltech.dev` and use it as normal.
- [ ] **8. Retire the old CV site.** Turn off GitHub Pages on `JHGelpi/cv`, or replace its `index.html` with a link to `https://geltech.dev/about/`.
- [ ] **9. First real post (§8).** After it's live: paste its URL into LinkedIn Post Inspector and check the X card. Title, description and image should be right.
