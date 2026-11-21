// Pure helpers (no astro: imports) so node:test can exercise them.
export const isPublished = (data: { draft: boolean }, prod: boolean): boolean => !prod || !data.draft;

export const byNewest = <T extends { data: { pubDate: Date } }>(a: T, b: T): number =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

type Issue = { path: 'description' | 'pubDate' | 'updatedDate'; message: string };
const DAY = 24 * 60 * 60 * 1000;

/** Checks Zod can't express per field: published posts need a description (share cards),
 *  and a date over a day ahead is almost always YAML rolling an impossible date (2026-13-45) forward. */
export function frontmatterIssues(
  data: { draft: boolean; description: string; pubDate: Date; updatedDate?: Date },
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
  return issues;
}
