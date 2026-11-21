import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrap } from './og-default.ts';

test('wrap keeps every line within the width and loses no words', () => {
  const text = 'Engineering Director & Technologist | Turning Enterprise Technology into Business Value | Jenkins MBA Candidate';
  const lines = wrap(text, 42, 3);
  assert.ok(lines.every((l) => l.length <= 42), lines.join('\n'));
  assert.equal(lines.join(' '), text);
});

test('wrap ends with an ellipsis when the text needs more lines than allowed', () => {
  const lines = wrap('one two three four five six', 9, 2);
  assert.deepEqual(lines, ['one two', 'three…']);
});
