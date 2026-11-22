import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const src = readFileSync(new URL('./theme-init.js', import.meta.url), 'utf8');

/** Runs the head script against a minimal fake page; returns handles to drive it. */
function page({ saved = null as string | null, osDark = false, storageThrows = false } = {}) {
  const listeners: Record<string, ((e?: unknown) => void)[]> = {};
  const mqListeners: (() => void)[] = [];
  const button = { attrs: {} as Record<string, string>, setAttribute(k: string, v: string) { this.attrs[k] = v; }, closest: () => button };
  const store = new Map(saved ? [['theme', saved]] : []);
  class Element {}
  Object.setPrototypeOf(button, Element.prototype);
  const mq = { matches: osDark, addEventListener: (_: string, f: () => void) => mqListeners.push(f) };
  const ctx = {
    Element,
    matchMedia: () => mq,
    localStorage: {
      getItem: (k: string) => { if (storageThrows) throw new Error('blocked'); return store.get(k) ?? null; },
      setItem: (k: string, v: string) => { if (storageThrows) throw new Error('blocked'); store.set(k, v); },
    },
    document: {
      documentElement: { dataset: {} as Record<string, string> },
      querySelectorAll: () => [button],
      addEventListener: (t: string, f: (e?: unknown) => void) => (listeners[t] ??= []).push(f),
    },
  };
  runInNewContext(src, ctx);
  const fire = (t: string, e?: unknown) => listeners[t]?.forEach((f) => f(e));
  fire('DOMContentLoaded');
  return {
    root: ctx.document.documentElement.dataset, button, store, mq,
    click: () => fire('click', { target: button }),
    osChange: (dark: boolean) => { mq.matches = dark; mqListeners.forEach((f) => f()); },
  };
}

test('no saved choice: no data-theme, page marked JS-capable, label offers the opposite of the device', () => {
  const p = page({ osDark: true });
  assert.equal(p.root.theme, undefined);
  assert.equal(p.root.js, '');
  assert.equal(p.button.attrs['aria-label'], 'Switch to light theme');
});

test('a saved choice is applied before paint', () => {
  assert.equal(page({ saved: 'dark' }).root.theme, 'dark');
  assert.equal(page({ saved: 'bogus' }).root.theme, undefined);
});

test('click flips the effective theme, saves it and relabels', () => {
  const p = page({ osDark: false });
  p.click();
  assert.equal(p.root.theme, 'dark');
  assert.equal(p.store.get('theme'), 'dark');
  assert.equal(p.button.attrs['aria-label'], 'Switch to light theme');
  p.click();
  assert.equal(p.root.theme, 'light');
});

test('blocked storage: no error, theme still flips for this page view', () => {
  const p = page({ storageThrows: true });
  assert.doesNotThrow(() => p.click());
  assert.equal(p.root.theme, 'dark');
});

test('device theme change with nothing saved updates the label', () => {
  const p = page({ osDark: false });
  assert.equal(p.button.attrs['aria-label'], 'Switch to dark theme');
  p.osChange(true);
  assert.equal(p.button.attrs['aria-label'], 'Switch to light theme');
});
