import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COOKIE_KEY, readPreferences, savePreferences } from '../src/utils/cookiePreferences.js';

test('no consent, corrupted data, old versions and expired choices deny optional maps', () => {
  for (const raw of [null, '{', '{}', JSON.stringify({ version: 2, maps: true, savedAt: 10 }), JSON.stringify({ version: 1, maps: true, savedAt: 1 })]) {
    assert.equal(readPreferences({ getItem: () => raw }, 180 * 86400000 + 1), null);
  }
  assert.equal(readPreferences({ getItem() { throw Error('blocked'); } }), null);
});
test('both choices survive reload and a rejection replaces an earlier approval', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  savePreferences(storage, true, 1000);
  assert.equal(readPreferences(storage, 1001).maps, true);
  savePreferences(storage, false, 1002);
  assert.equal(readPreferences(storage, 1003).maps, false);
  assert.equal(values.size, 1);
  assert.ok(values.has(COOKIE_KEY));
});
test('blocked storage still allows a session choice without crashing', () => {
  assert.equal(savePreferences({ setItem() { throw Error('blocked'); } }, false).maps, false);
});
