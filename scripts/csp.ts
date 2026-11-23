// Writes the Content-Security-Policy into dist/_headers after each build (FR-20).
// Inline scripts are allowed only by hash, so the hashes are computed from the built pages.
import { createHash } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { readTree } from './verify-dist.ts';

/** sha256 source expressions for every executable inline script (JSON-LD is data, not script). */
export function inlineScriptHashes(pages: Iterable<string>): string[] {
  const hashes = new Set<string>();
  for (const html of pages) {
    for (const [, attrs = '', body = ''] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(attrs) || attrs.includes('application/ld+json')) continue;
      hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
    }
  }
  return [...hashes].sort();
}

export function csp(hashes: string[]): string {
  return [
    "default-src 'self'",
    // static.cloudflareinsights.com: the Web Analytics beacon, the one allowed third party (spec §8).
    ['script-src', "'self'", ...hashes, 'https://static.cloudflareinsights.com'].join(' '),
    "style-src 'self'",
    // Shiki colours code with style attributes; attributes can't run script.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; ');
}

export function writeCspHeader(dist: string): void {
  const pages = [...readTree(dist)].filter(([path]) => path.endsWith('.html')).map(([, html]) => html);
  // A second `/*` block: Cloudflare applies every matching block, so this adds to public/_headers.
  appendFileSync(join(dist, '_headers'), `\n/*\n  Content-Security-Policy: ${csp(inlineScriptHashes(pages))}\n`);
}
