import { test } from 'node:test';
import assert from 'node:assert/strict';
import { employersFromCv, verifyDist, brokenLinks } from './verify-dist.ts';

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
  const p = verifyDist(files, ['Red Hat'], ['/blog/hello-world/']).join('\n');
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

test('the theme-init script is allowed on every page; other scripts are not', () => {
  const ok = verifyDist(new Map([['blog/a/index.html', '<head><script id="theme-init">x</script></head>']]), []);
  assert.deepEqual(ok, []);
  const bad = verifyDist(new Map([['blog/a/index.html', '<script id="theme-init"></script><script src="t.js"></script>']]), []);
  assert.equal(bad.length, 1);
  assert.match(bad[0]!, /t\.js/);
});

test('brokenLinks finds missing pages, assets and anchors, and ignores external links', () => {
  const files = new Map([
    ['index.html', '<a href="/about/">a</a><a href="/blog/">b</a><a href="#main">m</a><a href="#nope">n</a><img src="/x.png">'
      + '<a href="https://geltech.dev/about/#cv">c</a><a href="https://example.com/">e</a><a href="//cdn.x/y">p</a><main id="main"></main>'],
    ['about/index.html', '<section id="cv"></section>'],
    ['rss.xml', '<link>https://geltech.dev/gone/</link>'],
  ]);
  const p = brokenLinks(files, (f) => f === 'x.png', 'https://geltech.dev');
  assert.deepEqual(p, ['index.html: broken link /blog/', 'index.html: no #nope for #nope', 'rss.xml: broken link https://geltech.dev/gone/']);
});

test('a draft linked from another page or feed is a leak, even without its own page', () => {
  const files = new Map([
    ['rss.xml', '<link>https://geltech.dev/blog/wip/</link>'],
    ['index.html', '<a href="/now/">Now</a>'],
    ['blog/index.html', '<a href="/blog/published/">ok</a>'],
  ]);
  assert.deepEqual(verifyDist(files, [], ['/blog/wip/', '/now/']), ['rss.xml: draft /blog/wip/ leaked', 'index.html: draft /now/ leaked']);
});
