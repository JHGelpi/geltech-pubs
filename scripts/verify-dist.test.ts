import { test } from 'node:test';
import assert from 'node:assert/strict';
import { employersFromCv, verifyDist } from './verify-dist.ts';

test('employersFromCv', () => {
  assert.deepEqual(
    employersFromCv('### Director · SAS Institute, Cary, NC · Jan 2026 – Present\n### X · Red Hat, Raleigh, NC · 2018 – 2021\n### Y · Red Hat, Raleigh, NC · 2015 – 2018'),
    ['SAS Institute', 'Red Hat'],
  );
});

test('flags script tags, draft pages and employer leaks', () => {
  const files = new Map([
    ['index.html', '<head></head><script src="x.js"></script>Red Hat'],
    ['blog/hello-world/index.html', 'x'],
    ['about/index.html', '<head><title>Red Hat</title></head><body>Red Hat</body>'],
    ['rss.xml', '<rss></rss>'],
  ]);
  const p = verifyDist(files, ['Red Hat']).join('\n');
  assert.match(p, /index\.html.*script/);
  assert.match(p, /hello-world/);
  assert.match(p, /^index\.html.*Red Hat/m);
  assert.match(p, /about\/index\.html.*head.*Red Hat/);
});

test('catches HTML-escaped employer names', () => {
  const p = verifyDist(new Map([['blog/a/index.html', 'R&amp;W Books']]), ['R&W Books']);
  assert.equal(p.length, 1);
});

test('clean dist passes', () => {
  const files = new Map([['about/index.html', '<head><script type="application/ld+json">{}</script></head><body>Red Hat</body>']]);
  assert.deepEqual(verifyDist(files, ['Red Hat']), []);
});

test('only /about/ may ship a client script (approved CV tabs)', () => {
  const tag = '<script type="module">tabs()</script>';
  assert.deepEqual(verifyDist(new Map([['about/index.html', `<head></head><body>${tag}</body>`]]), []), []);
  assert.equal(verifyDist(new Map([['blog/a/index.html', tag]]), []).length, 1);
});

test('employer match is case-insensitive on word boundaries', () => {
  assert.equal(verifyDist(new Map([['blog/a/index.html', 'I worked at RED HAT.']]), ['Red Hat']).length, 1);
  assert.equal(verifyDist(new Map([['blog/a/index.html', 'Reddit hats']]), ['Red Hat']).length, 0);
});
