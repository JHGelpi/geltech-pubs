import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/site.config.ts';
import { configProblems } from './src/lib/config-guard.ts';
import { employersFromCv } from './scripts/verify-dist.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { writeCspHeader } from './scripts/csp.ts';

// Deploy builds set SITE_STRICT=1 so placeholder identity can never go live.
if (process.env.SITE_STRICT === '1') {
  const problems = configProblems(site, employersFromCv(readFileSync('src/content/pages/cv.md', 'utf8')));
  if (problems.length) throw new Error('site.config.ts not ready:\n' + problems.join('\n'));
}

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap(),
    { name: 'csp-header', hooks: { 'astro:build:done': ({ dir }) => writeCspHeader(fileURLToPath(dir)) } },
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark-default' } },
  },
});
