// Pure helpers (no astro: imports) so node:test can exercise them.
export const isPublished = (data: { draft: boolean }, prod: boolean): boolean => !prod || !data.draft;

export const byNewest = <T extends { data: { pubDate: Date } }>(a: T, b: T): number =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

export const slugify = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Posts grouped by tag slug, in input order; the first spelling seen names the tag. */
export function postsByTag<T extends { data: { tags: string[] } }>(posts: T[]): Map<string, { name: string; posts: T[] }> {
  const byTag = new Map<string, { name: string; posts: T[] }>();
  for (const post of posts) {
    for (const name of post.data.tags) {
      const slug = slugify(name);
      if (!byTag.has(slug)) byTag.set(slug, { name, posts: [] });
      const entry = byTag.get(slug)!;
      if (!entry.posts.includes(post)) entry.posts.push(post); // "ETL" and "etl" on one post
    }
  }
  return byTag;
}

type Issue = { path: 'description' | 'pubDate' | 'updatedDate' | 'tags'; message: string };
const DAY = 24 * 60 * 60 * 1000;

/** Checks Zod can't express per field: published posts need a description (share cards),
 *  and a date over a day ahead is almost always YAML rolling an impossible date (2026-13-45) forward. */
export function frontmatterIssues(
  data: { draft: boolean; description: string; pubDate: Date; updatedDate?: Date; tags?: string[] },
  now: Date,
): Issue[] {
  const issues: Issue[] = [];
  if (!data.draft && !data.description.trim()) {
    issues.push({ path: 'description', message: 'Published posts need a description (meta + share card).' });
  }
  for (const key of ['pubDate', 'updatedDate'] as const) {
    const d = data[key];
    if (d && d.valueOf() > now.valueOf() + DAY) {
      issues.push({ path: key, message: `${d.toISOString().slice(0, 10)} is in the future; check for an impossible date like month 13.` });
    }
  }
  for (const tag of data.tags ?? []) {
    if (!slugify(tag)) issues.push({ path: 'tags', message: `Tag "${tag}" needs at least one letter or digit (it becomes the /blog/tags/<tag>/ URL).` });
  }
  return issues;
}

/** Minutes to read at 225 words a minute, rounded up, never 0. */
export const readingMinutes = (text: string): number =>
  Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 225));

/** FR-7: a table of contents only for posts with 3+ H2s; it lists the H2s. */
export const tocHeadings = <T extends { depth: number; slug: string }>(headings: T[]): T[] => {
  // footnote-label is the hidden "Footnotes" heading GFM adds, not one the author wrote.
  const h2s = headings.filter((h) => h.depth === 2 && h.slug !== 'footnote-label');
  return h2s.length >= 3 ? h2s : [];
};
