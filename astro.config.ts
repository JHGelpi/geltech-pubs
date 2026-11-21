import { defineConfig } from 'astro/config';
import { site } from './src/site.config.ts';
import { configProblems } from './src/lib/config-guard.ts';

// Deploy builds set SITE_STRICT=1 so placeholder identity can never go live.
if (process.env.SITE_STRICT === '1') {
  const problems = configProblems(site);
  if (problems.length) throw new Error('site.config.ts not ready:\n' + problems.join('\n'));
}

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
