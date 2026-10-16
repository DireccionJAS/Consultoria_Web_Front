import test from 'node:test';
import assert from 'node:assert/strict';
import { safeWebUrl } from '../src/utils/webLinks.js';

for (const value of [
  'javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,<script>alert(1)</script>',
  'file:///etc/passwd', '//evil.test', '/Login', 'https://',
  'https://trusted.test@evil.test/form', 'https://example.test\\@evil.test',
  'https://example.test/\r\nheader', null, {}, 'https://example.test/' + 'x'.repeat(1000),
]) {
  test(`rejects unsafe link ${JSON.stringify(value).slice(0, 65)}`, () => assert.equal(safeWebUrl(value), ''));
}
for (const value of [
  'https://docs.google.com/forms/d/e/test/viewform?entry.1=Ana%20L%C3%B3pez',
  'https://forms.gle/example', 'http://example.test/form', 'HTTPS://example.test/form#part',
]) {
  test(`preserves web link ${value}`, () => assert.equal(safeWebUrl(value), value));
}
