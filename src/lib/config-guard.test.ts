import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configProblems } from './config-guard.ts';

test('placeholders and empty links are reported', () => {
  const p = configProblems({ name: 'A', tagline: '<generic role>', bio: 'ok', url: 'https://x', links: { github: 'https://g', x: '' } });
  assert.equal(p.length, 2);
  assert.match(p.join('\n'), /tagline/);
  assert.match(p.join('\n'), /links\.x/);
});

test('clean config has no problems', () => {
  assert.deepEqual(configProblems({ name: 'A', tagline: 'Leader', bio: 'Hi.', url: 'https://x', links: { github: 'https://g' } }), []);
});
