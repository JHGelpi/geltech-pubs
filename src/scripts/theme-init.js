// Theme switch (CLAUDE.md rule 2). Inlined at the top of <body> by ThemeScript.astro so a chosen theme never flashes.
// A manual choice overrides the device setting for this browser session only: it's a session cookie (no Expires),
// shared by every page and tab, cleared when the browser closes. Host-only, never .geltech.dev (G-4).
(() => {
  const root = document.documentElement;
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const saved = () => /(?:^|;\s*)theme=(light|dark)(?:;|$)/.exec(document.cookie)?.[1];
  const effective = () => root.dataset.theme || (dark.matches ? 'dark' : 'light');
  const label = () => {
    const next = effective() === 'dark' ? 'light' : 'dark';
    for (const b of document.querySelectorAll('[data-theme-toggle]')) b.setAttribute('aria-label', `Switch to ${next} theme`);
  };
  const apply = () => {
    const t = saved();
    if (t) root.dataset.theme = t;
    else delete root.dataset.theme;
    label();
  };
  // Choices used to be kept forever; drop any old one so the device setting is the default again.
  try { localStorage.removeItem('theme'); } catch {}
  root.dataset.js = '';
  apply();
  document.addEventListener('DOMContentLoaded', label);
  dark.addEventListener('change', label);
  // A page restored by Back/Forward, or a tab you return to, can predate a choice made on another page.
  addEventListener('pageshow', apply);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(); });
  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element) || !e.target.closest('[data-theme-toggle]')) return;
    const next = effective() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    document.cookie = `theme=${next}; Path=/; SameSite=Lax; Secure`;
    label();
  });
})();
