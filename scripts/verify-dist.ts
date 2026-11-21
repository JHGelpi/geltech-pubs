// Post-build guard: fails if dist/ ships client JS, the sample draft, or an employer name outside /about/'s body.
// Usage: node scripts/verify-dist.ts dist
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

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

export function verifyDist(files: Map<string, string>, employers: string[]): string[] {
  const problems: string[] = [];
  for (const [path, content] of files) {
    // shortcut: hard-coded sample slug, upgrade to reading draft slugs from src/content/blog when more drafts exist
    if (path.includes('hello-world')) problems.push(`${path}: draft sample post was built`);

    for (const tag of content.match(/<script\b[^>]*>/g) ?? []) {
      if (!tag.includes('application/ld+json')) problems.push(`${path}: client script ${tag}`);
    }

    // Only /about/'s <body> (the CV) may name employers (FR-0a).
    const isAbout = path === 'about/index.html';
    const checked = isAbout ? (content.split('</head>')[0] ?? '') : content;
    for (const name of employers) {
      if (checked.includes(name) || checked.includes(escapeHtml(name))) {
        problems.push(`${path}: ${isAbout ? 'head ' : ''}names employer "${name}"`);
      }
    }
  }
  return problems;
}

function readTree(dir: string, root = dir, out = new Map<string, string>()): Map<string, string> {
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
  const problems = verifyDist(readTree(dir), employers);
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`verify-dist: ${dir} ok (${employers.length} employer names checked)`);
}
