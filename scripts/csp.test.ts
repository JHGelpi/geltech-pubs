import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csp, inlineScriptHashes } from './csp.ts';

test('hashes inline scripts once, skipping external scripts and JSON-LD', () => {
  const page = '<script id="theme-init">a</script><script src="x.js"></script><script type="application/ld+json">{}</script>';
  // Browser-format hash of the script text "a".
  assert.deepEqual(inlineScriptHashes([page, page]), ["'sha256-ypeBEsobvcr6wjGzmiPcTaeG7/gUfE5yuYB3ha/uSLs='"]);
});

test('policy allows hashed scripts only and never unsafe-inline scripts', () => {
  const policy = csp(["'sha256-x'"]);
  assert.match(policy, /script-src 'self' 'sha256-x' https:\/\/static\.cloudflareinsights\.com/);
  assert.doesNotMatch(policy, /script-src[^;]*unsafe/);
  assert.match(policy, /frame-ancestors 'none'/);
});
