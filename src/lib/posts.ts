// Pure helpers (no astro: imports) so node:test can exercise them.
export const isPublished = (data: { draft: boolean }, prod: boolean): boolean => !prod || !data.draft;

export const byNewest = <T extends { data: { pubDate: Date } }>(a: T, b: T): number =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
