// Post-build guard: fails if dist/ ships unapproved client JS, any draft post or page, an employer name outside /about/'s body,
// or a broken internal link.
// Usage: node scripts/verify-dist.ts dist
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { mentions } from '../src/lib/config-guard.ts';
import { site } from '../src/site.config.ts';

/** Company names from CV role headings: `### Title · Company, City, ST · dates`. */
export function employersFromCv(md: string): string[] {
  const names = md
    .split('\n')
    .filter((line) => line.startsWith('### '))
    .map((line) => line.split(' · ')[1])
    .filter((part): part is string => Boolean(part))
    .map((part) => part.replace(/\*/g, '').replace(/,\s*[^,]+,\s*[A-Z]{2}$/, '').trim());
  return [...new Set(names)];
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;');

/** URL paths (`/blog/<slug>/`, `/<page>/`) of every `draft: true` entry, read from frontmatter. */
export function draftPaths(dir: string, urlPrefix: string): string[] {
  return readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f) && /^draft:\s*true\s*$/m.test(readFileSync(join(dir, f), 'utf8').split(/^---$/m)[1] ?? ''))
    .map((f) => `${urlPrefix}${f.replace(/\.mdx?$/, '')}/`);
}

export function verifyDist(files: Map<string, string>, employers: string[], drafts: string[] = []): string[] {
  const problems: string[] = [];
  for (const [path, content] of files) {
    // Drafts never ship (CLAUDE.md rule 3): no page of their own, and no link from pages, RSS or sitemap.
    for (const d of drafts) {
      if (path.startsWith(d.slice(1)) || content.includes(d)) problems.push(`${path}: draft ${d} leaked`);
    }

    const isAbout = path === 'about/index.html';
    // Approved scripts (CLAUDE.md rule 2): the theme switch on every page, the CV tabs on /about/.
    for (const tag of content.match(/<script\b[^>]*>/g) ?? []) {
      if (!tag.includes('application/ld+json') && !tag.includes('id="theme-init"') && !isAbout) problems.push(`${path}: client script ${tag}`);
    }

    // Only /about/'s <body> (the CV) may name employers (FR-0a).
    const checked = isAbout ? (content.split('</head>')[0] ?? '') : content;
    for (const name of employers) {
      if (mentions(checked, name) || mentions(checked, escapeHtml(name))) {
        problems.push(`${path}: ${isAbout ? 'head ' : ''}names employer "${name}"`);
      }
    }
  }
  return problems;
}

/** Internal links, assets and same-site absolute URLs (canonical, og:image, sitemap, RSS) that resolve to no file or #id.
 *  shortcut: external links aren't checked (slow and flaky in CI); add a scheduled job if they rot. */
export function brokenLinks(files: Map<string, string>, exists: (path: string) => boolean, origin: string): string[] {
  const problems: string[] = [];
  for (const [path, content] of files) {
    if (!/\.(html|xml)$/.test(path)) continue;
    for (const m of content.matchAll(/(?:href|src|content)="([^"]*)"|<(?:loc|link)>([^<]*)</g)) {
      const raw = (m[1] ?? m[2] ?? '').replaceAll('&amp;', '&');
      const ref = raw.startsWith(origin + '/') ? raw.slice(origin.length) : raw;
      if (!/^\/(?!\/)|^#/.test(ref)) continue; // external, protocol-relative, mailto, or not a URL
      const url = new URL(ref, `http://site/${path}`);
      let file = decodeURIComponent(url.pathname).slice(1);
      if (file === '' || file.endsWith('/')) file += 'index.html';
      if (!files.has(file) && !exists(file)) {
        problems.push(`${path}: broken link ${raw}`);
        continue;
      }
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && !files.get(file)?.includes(`id="${id}"`)) problems.push(`${path}: no #${id} for ${raw}`);
    }
  }
  return problems;
}

export function readTree(dir: string, root = dir, out = new Map<string, string>()): Map<string, string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) readTree(full, root, out);
    else if (/\.(html|xml|txt|json)$/.test(entry.name)) out.set(relative(root, full).replaceAll('\\', '/'), readFileSync(full, 'utf8'));
  }
  return out;
}

if (import.meta.main) {
  const dir = process.argv[2] ?? 'dist';
  const employers = employersFromCv(readFileSync('src/content/pages/cv.md', 'utf8'));
  const files = readTree(dir);
  const problems = [
    ...verifyDist(files, employers, [...draftPaths('src/content/blog', '/blog/'), ...draftPaths('src/content/pages', '/')]),
    ...brokenLinks(files, (p) => existsSync(join(dir, p)), new URL(site.url).origin),
  ];
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`verify-dist: ${dir} ok (${employers.length} employer names, internal links checked)`);
}
