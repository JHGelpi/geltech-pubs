// Renders public/og-default.png (1200×630) from site.config.ts. Run once after the config is final, commit the PNG.
import sharp from 'sharp';
import { site } from '../src/site.config.ts';
import { configProblems } from '../src/lib/config-guard.ts';
import { employersFromCv } from './verify-dist.ts';
import { readFileSync } from 'node:fs';

/** Greedy word wrap to `width` chars; past `maxLines` the last line ends with "…". */
export function wrap(text: string, width: number, maxLines: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const last = lines.at(-1);
    if (last !== undefined && (last + ' ' + word).length <= width) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = kept[maxLines - 1]!.slice(0, width - 1) + '…';
  return kept;
}

if (import.meta.main) {
  const problems = configProblems(site, employersFromCv(readFileSync('src/content/pages/cv.md', 'utf8')));
  if (problems.length) {
    console.error('Fill in src/site.config.ts first:\n' + problems.join('\n'));
    process.exit(1);
  }

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const font = 'DejaVu Sans, Helvetica, Arial, sans-serif';
  // ~42 chars of 40px text fit in the 1000px column; 3 lines fit above the domain.
  const tagline = wrap(site.tagline, 42, 3)
    .map((line, i) => `<tspan x="130" dy="${i ? 52 : 0}">${esc(line)}</tspan>`)
    .join('');
  // Colours match the light theme tokens in global.css.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#fdfdfc"/>
  <rect x="80" y="80" width="12" height="470" fill="#0b5cad"/>
  <text x="130" y="230" font-family="${font}" font-size="88" font-weight="700" fill="#1d1d1f">${esc(site.name)}</text>
  <text x="130" y="310" font-family="${font}" font-size="40" fill="#5c5c66">${tagline}</text>
  <text x="130" y="530" font-family="${font}" font-size="36" font-weight="700" fill="#0b5cad">geltech.dev</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
  console.log('Wrote public/og-default.png');
}
