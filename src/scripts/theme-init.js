// Theme switch (CLAUDE.md rule 2). Inlined into <head> by ThemeScript.astro so a saved theme never flashes.
(() => {
  const root = document.documentElement;
  const dark = matchMedia('(prefers-color-scheme: dark)');
  try {
    const t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') root.dataset.theme = t;
  } catch {}
  root.dataset.js = '';
  const effective = () => root.dataset.theme || (dark.matches ? 'dark' : 'light');
  const label = () => {
    const next = effective() === 'dark' ? 'light' : 'dark';
    for (const b of document.querySelectorAll('[data-theme-toggle]')) b.setAttribute('aria-label', `Switch to ${next} theme`);
  };
  document.addEventListener('DOMContentLoaded', label);
  dark.addEventListener('change', label);
  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element) || !e.target.closest('[data-theme-toggle]')) return;
    const next = effective() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    label();
  });
})();
