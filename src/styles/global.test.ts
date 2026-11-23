import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8');

// --shadow may be combined with other shadows (`var(--shadow), inset …`); `none` in a list drops them all.
test('dark --shadow is list-safe: never `none`', () => {
  assert.doesNotMatch(css, /--shadow:\s*none/);
});
