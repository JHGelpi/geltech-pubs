import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const src = readFileSync(new URL('./theme-init.js', import.meta.url), 'utf8');

/** Runs the theme script against a minimal fake page; `jar` is the browser's cookie store, shared between pages. */
function page({ jar = new Map<string, string>(), osDark = false, cookiesBlocked = false } = {}) {
  const listeners: Record<string, ((e?: unknown) => void)[]> = {};
  const winListeners: Record<string, (() => void)[]> = {};
  const mqListeners: (() => void)[] = [];
  const button = { attrs: {} as Record<string, string>, setAttribute(k: string, v: string) { this.attrs[k] = v; }, closest: () => button };
  class Element {}
  Object.setPrototypeOf(button, Element.prototype);
  const mq = { matches: osDark, addEventListener: (_: string, f: () => void) => mqListeners.push(f) };
  const document = {
    hidden: false,
    documentElement: { dataset: {} as Record<string, string> },
    querySelectorAll: () => [button],
    addEventListener: (t: string, f: (e?: unknown) => void) => (listeners[t] ??= []).push(f),
    // Like a browser: reading gives name=value pairs; writing stores the first pair and ignores attributes.
    get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join('; '); },
    set cookie(c: string) { if (cookiesBlocked) return; const [k, v] = c.split(';')[0]!.split('='); jar.set(k!, v!); },
  };
  const ctx = {
    Element, document,
    matchMedia: () => mq,
    localStorage: { removeItem: () => {} },
    addEventListener: (t: string, f: () => void) => (winListeners[t] ??= []).push(f),
  };
  runInNewContext(src, ctx);
  const fire = (t: string, e?: unknown) => listeners[t]?.forEach((f) => f(e));
  fire('DOMContentLoaded');
  return {
    root: document.documentElement.dataset, button, jar,
    click: () => fire('click', { target: button }),
    osChange: (dark: boolean) => { mq.matches = dark; mqListeners.forEach((f) => f()); },
    restoredFromCache: () => winListeners.pageshow?.forEach((f) => f()),
    tabShown: () => { document.hidden = false; fire('visibilitychange'); },
  };
}

test('no choice: no data-theme, page marked JS-capable, label offers the opposite of the device', () => {
  const p = page({ osDark: true });
  assert.equal(p.root.theme, undefined);
  assert.equal(p.root.js, '');
  assert.equal(p.button.attrs['aria-label'], 'Switch to light theme');
});

test('a choice made on one page applies on the next page load', () => {
  const jar = new Map<string, string>();
  page({ jar, osDark: true }).click();
  assert.equal(jar.get('theme'), 'light');
  assert.equal(page({ jar, osDark: true }).root.theme, 'light');
  assert.equal(page({ jar: new Map([['theme', 'bogus']]) }).root.theme, undefined);
});

test('click flips the effective theme, saves it and relabels', () => {
  const p = page({ osDark: false });
  p.click();
  assert.equal(p.root.theme, 'dark');
  assert.equal(p.jar.get('theme'), 'dark');
  assert.equal(p.button.attrs['aria-label'], 'Switch to light theme');
  p.click();
  assert.equal(p.root.theme, 'light');
});

test('a page restored by Back, or a tab shown again, picks up a choice made elsewhere', () => {
  const jar = new Map<string, string>();
  const a = page({ jar, osDark: false });
  page({ jar, osDark: false }).click(); // choose dark on page B
  assert.equal(a.root.theme, undefined);
  a.restoredFromCache();
  assert.equal(a.root.theme, 'dark');
  assert.equal(a.button.attrs['aria-label'], 'Switch to light theme');
  jar.delete('theme'); // browser closed: session cookie gone
  a.tabShown();
  assert.equal(a.root.theme, undefined);
});

test('blocked cookies: no error, theme still flips for this page view', () => {
  const p = page({ cookiesBlocked: true });
  assert.doesNotThrow(() => p.click());
  assert.equal(p.root.theme, 'dark');
});

test('device theme change with no choice updates the label', () => {
  const p = page({ osDark: false });
  assert.equal(p.button.attrs['aria-label'], 'Switch to dark theme');
  p.osChange(true);
  assert.equal(p.button.attrs['aria-label'], 'Switch to light theme');
});
