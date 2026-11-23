import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrap, ogSvg, postOgSvg } from './og.ts';

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

test('ogSvg escapes text and keeps the default card layout', () => {
  const svg = ogSvg({ heading: ['A & B'], headingSize: 88, body: ['<x>'], footer: 'geltech.dev' });
  assert.match(svg, /y="228"[^>]*>.*A &amp; B/);
  assert.match(svg, /y="308"[^>]*>.*&lt;x&gt;/);
});

test('postOgSvg: title up to 4 lines, description fills the lines left', () => {
  const long = 'Why every data platform team eventually rebuilds its ingestion layer from scratch';
  assert.equal(postOgSvg(long, 'desc', 'Name', 'geltech.dev').match(/<tspan/g)?.length, 4);
  const svg = postOgSvg('Short title', long, 'Name', 'geltech.dev');
  assert.equal(svg.match(/<tspan/g)?.length, 1 + 2);
  assert.match(svg, /Name · geltech\.dev/);
});
