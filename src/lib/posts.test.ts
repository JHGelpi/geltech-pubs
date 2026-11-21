import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublished, byNewest } from './posts.ts';

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
