// Share cards (1200×630) as SVG; callers render them to PNG with sharp. Colours match the light theme in global.css.

/** Greedy word wrap to `width` chars; past `maxLines` the last line ends with "…". */
export function wrap(text: string, width: number, maxLines: number): string[] {
  if (maxLines <= 0) return [];
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

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FONT = 'DejaVu Sans, Helvetica, Arial, sans-serif';

/** Big bold heading lines, optional muted body lines under them, and an accent footer. */
export function ogSvg({ heading, headingSize, body = [], footer }: { heading: string[]; headingSize: number; body?: string[]; footer: string }): string {
  const lines = (ls: string[], lineHeight: number) =>
    ls.map((l, i) => `<tspan x="130" dy="${i ? lineHeight : 0}">${esc(l)}</tspan>`).join('');
  const headingY = 140 + headingSize;
  const bodyY = headingY + (heading.length - 1) * Math.round(headingSize * 1.15) + 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="80" y="80" width="12" height="470" rx="6" fill="#2563eb"/>
  <text x="130" y="${headingY}" font-family="${FONT}" font-size="${headingSize}" font-weight="700" fill="#18181b">${lines(heading, Math.round(headingSize * 1.15))}</text>
  ${body.length ? `<text x="130" y="${bodyY}" font-family="${FONT}" font-size="40" fill="#52525b">${lines(body, 52)}</text>` : ''}
  <text x="130" y="530" font-family="${FONT}" font-size="36" font-weight="700" fill="#2563eb">${esc(footer)}</text>
</svg>`;
}

/** A post's card: up to 4 lines of title (~25 chars of 60px bold fit the 990px column), the description in
 *  whatever lines are left, and "Name · domain".
 *  shortcut: wrapping counts characters, so an all-caps title or a 25+ char word can overflow; measure glyphs if one does. */
export function postOgSvg(title: string, description: string, name: string, domain: string): string {
  const heading = wrap(title, 25, 4);
  return ogSvg({ heading, headingSize: 60, body: wrap(description, 42, Math.min(3, 4 - heading.length)), footer: `${name} · ${domain}` });
}
