// Scaffold a draft post. Usage: npm run new-post "Title" [-- --private]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { slugify } from '../src/lib/posts.ts';

export const frontmatter = (title: string, today: string): string =>
  ['---', `title: ${JSON.stringify(title)}`, 'description: ""', `pubDate: ${today}`, 'tags: []', 'draft: true', '---', '', ''].join('\n');

// `npm run new-post "x" --private` (no `--`) makes npm eat the flag into npm_config_private.
export const wantsPrivate = (args: string[], env: Record<string, string | undefined>): boolean =>
  args.includes('--private') || env.npm_config_private === 'true';

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isPrivate = wantsPrivate(args, process.env);
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
