import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candidateCsp, enforcedCsp } from '../securityHeaders.js';

test('active policy blocks plugin objects, external base URLs and framing', () => {
  for (const directive of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'"]) assert.ok(enforcedCsp.includes(directive));
});
test('candidate uses the API origin only and never includes credentials or query strings', () => {
  const csp = candidateCsp('https://example.test/api?private=value');
  assert.ok(csp.includes('https://example.test'));
  assert.ok(!csp.includes('private=value'));
  assert.throws(() => candidateCsp('http://example.test/api'));
  assert.ok(!csp.includes("'unsafe-eval'"));
});
