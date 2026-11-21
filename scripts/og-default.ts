// Renders public/og-default.png (1200×630) from site.config.ts. Run once after the config is final, commit the PNG.
import sharp from 'sharp';
import { site } from '../src/site.config.ts';
import { configProblems } from '../src/lib/config-guard.ts';
import { employersFromCv } from './verify-dist.ts';
import { readFileSync } from 'node:fs';

const problems = configProblems(site, employersFromCv(readFileSync('src/content/pages/cv.md', 'utf8')));
if (problems.length) {
  console.error('Fill in src/site.config.ts first:\n' + problems.join('\n'));
  process.exit(1);
}

// shortcut: no text wrapping, a tagline over ~50 chars runs off the card; wrap or shrink if Wes's tagline is longer.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const font = 'DejaVu Sans, Helvetica, Arial, sans-serif';
// Colours match the light theme tokens in global.css.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#fdfdfc"/>
  <rect x="80" y="80" width="12" height="470" fill="#0b5cad"/>
  <text x="130" y="250" font-family="${font}" font-size="88" font-weight="700" fill="#1d1d1f">${esc(site.name)}</text>
  <text x="130" y="330" font-family="${font}" font-size="40" fill="#5c5c66">${esc(site.tagline)}</text>
  <text x="130" y="530" font-family="${font}" font-size="36" font-weight="700" fill="#0b5cad">geltech.dev</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('Wrote public/og-default.png');
