import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontmatter, wantsPrivate } from './new-post.ts';
import { slugify } from '../src/lib/posts.ts';

test('slugify', () => {
  assert.equal(slugify('Hello, World!'), 'hello-world');
  assert.equal(slugify('Café & Crème: “ETL” in 2026'), 'cafe-creme-etl-in-2026');
  assert.equal(slugify('🚀🚀'), '');
});

test('frontmatter quotes the title and starts as draft', () => {
  const fm = frontmatter('Say "hi"', '2026-11-21');
  assert.match(fm, /^title: "Say \\"hi\\""$/m);
  assert.match(fm, /^draft: true$/m);
  assert.match(fm, /^pubDate: 2026-11-21$/m);
});

test('--private is honoured even when npm swallows the flag', () => {
  assert.equal(wantsPrivate(['--private'], {}), true);
  assert.equal(wantsPrivate([], { npm_config_private: 'true' }), true);
  assert.equal(wantsPrivate([], {}), false);
});
