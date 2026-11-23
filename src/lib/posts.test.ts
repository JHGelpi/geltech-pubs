import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublished, byNewest, frontmatterIssues, readingMinutes, postsByTag, tocHeadings } from './posts.ts';

test('drafts hidden in prod, shown in dev', () => {
  assert.equal(isPublished({ draft: true }, true), false);
  assert.equal(isPublished({ draft: true }, false), true);
  assert.equal(isPublished({ draft: false }, true), true);
});

test('byNewest sorts descending', () => {
  const a = { data: { pubDate: new Date('2026-01-01') } };
  const b = { data: { pubDate: new Date('2026-02-01') } };
  assert.deepEqual([a, b].sort(byNewest), [b, a]);
});

test('published post needs a description; drafts may leave it empty', () => {
  const now = new Date('2026-11-21T12:00:00Z');
  const base = { pubDate: new Date('2026-11-20'), description: '' };
  assert.deepEqual(frontmatterIssues({ ...base, draft: true }, now), []);
  assert.deepEqual(frontmatterIssues({ ...base, draft: false }, now).map((i) => i.path), ['description']);
});

test('dates more than a day in the future are rejected (catches 2026-13-45 rollover)', () => {
  const now = new Date('2026-11-21T12:00:00Z');
  const issues = frontmatterIssues({ draft: true, description: 'x', pubDate: new Date('2027-02-14'), updatedDate: new Date('2027-01-01') }, now);
  assert.deepEqual(issues.map((i) => i.path), ['pubDate', 'updatedDate']);
  assert.deepEqual(frontmatterIssues({ draft: false, description: 'x', pubDate: new Date('2026-11-22') }, now), []);
});

test('reading time is words / 225, rounded up, at least 1', () => {
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('word '.repeat(225)), 1);
  assert.equal(readingMinutes('word '.repeat(226)), 2);
  assert.equal(readingMinutes('a\n\nb\tc   d'), 1);
});

test('postsByTag groups by slug, keeps order and the first spelling', () => {
  const a = { data: { tags: ['Data Engineering', 'ETL', 'etl'] } };
  const b = { data: { tags: ['data engineering'] } };
  const byTag = postsByTag([a, b]);
  assert.deepEqual([...byTag.keys()], ['data-engineering', 'etl']);
  assert.equal(byTag.get('data-engineering')?.name, 'Data Engineering');
  assert.deepEqual(byTag.get('data-engineering')?.posts, [a, b]);
  assert.deepEqual(byTag.get('etl')?.posts, [a]);
});

test('a tag with no letters or digits is a frontmatter error', () => {
  const base = { draft: false, description: 'd', pubDate: new Date(0) };
  assert.equal(frontmatterIssues({ ...base, tags: ['🚀'] }, new Date(0))[0]?.path, 'tags');
  assert.deepEqual(frontmatterIssues({ ...base, tags: ['ok'] }, new Date(0)), []);
});

test('table of contents needs 3+ H2s and lists only H2s', () => {
  const h = (depth: number) => ({ depth, slug: `s${depth}`, text: 't' });
  assert.deepEqual(tocHeadings([h(2), h(3), h(2)]), []);
  assert.deepEqual(tocHeadings([h(2), h(2), { depth: 2, slug: 'footnote-label', text: 'Footnotes' }]), []);
  assert.deepEqual(tocHeadings([h(2), h(3), h(2), h(2)]).map((x) => x.depth), [2, 2, 2]);
});
