// Renders public/og-default.png (1200×630) from site.config.ts. Run once after the config is final, commit the PNG.
import sharp from 'sharp';
import { site } from '../src/site.config.ts';
import { configProblems } from '../src/lib/config-guard.ts';
import { employersFromCv } from './verify-dist.ts';
import { ogSvg, wrap } from '../src/lib/og.ts';
import { readFileSync } from 'node:fs';

if (import.meta.main) {
  const problems = configProblems(site, employersFromCv(readFileSync('src/content/pages/cv.md', 'utf8')));
  if (problems.length) {
    console.error('Fill in src/site.config.ts first:\n' + problems.join('\n'));
    process.exit(1);
  }

  // ~42 chars of 40px text fit in the 990px column; 3 lines fit above the domain.
  const svg = ogSvg({ heading: [site.name], headingSize: 88, body: wrap(site.tagline, 42, 3), footer: new URL(site.url).host });

  await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
  console.log('Wrote public/og-default.png');
}
