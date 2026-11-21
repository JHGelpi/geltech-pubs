import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublished, byNewest, frontmatterIssues } from './posts.ts';

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
