// Scaffold a draft post. Usage: npm run new-post "Title" [-- --private]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const slugify = (title: string): string =>
  title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const frontmatter = (title: string, today: string): string =>
  ['---', `title: ${JSON.stringify(title)}`, 'description: ""', `pubDate: ${today}`, 'tags: []', 'draft: true', '---', '', ''].join('\n');

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isPrivate = args.includes('--private');
  const title = args.filter((a) => a !== '--private').join(' ').trim();
  const slug = slugify(title);
  if (!title || !slug) {
    console.error('Usage: npm run new-post "Post title" [-- --private]  (the title needs at least one letter or digit)');
    process.exit(1);
  }
  const path = join(isPrivate ? 'drafts' : 'src/content/blog', `${slug}.md`);
  mkdirSync(dirname(path), { recursive: true });
  try {
    writeFileSync(path, frontmatter(title, new Date().toISOString().slice(0, 10)), { flag: 'wx' });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
      console.error(`${path} already exists; pick another title or edit that file.`);
      process.exit(1);
    }
    throw e;
  }
  console.log(`Created ${path}\nFill in description (≤ 160 chars) before building.\nBranch: git checkout -b post/${slug}`);
}
