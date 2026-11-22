import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8');

test('dark --shadow is list-safe: `none` inside a shadow list drops the whole box-shadow', () => {
  assert.ok(/var\(--shadow\),/.test(css), 'premise: --shadow is combined with another shadow somewhere');
  assert.doesNotMatch(css, /--shadow:\s*none/);
});
