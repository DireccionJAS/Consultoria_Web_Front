import test from 'node:test';
import assert from 'node:assert/strict';
import { revokeAndClearSession } from '../src/api/sessionLifecycle.js';
function storage(token = 'old') {
  return { token, getItem() { return this.token; }, removeItem() { this.token = null; } };
}
test('clears local session only after server confirms revocation', async () => {
  const local = storage();
  const closed = await revokeAndClearSession(local, async token => {
    assert.equal(token, 'old'); assert.equal(local.token, 'old');
  });
  assert.equal(closed, true); assert.equal(local.token, null);
});
test('network failures preserve token so revocation can be retried', async () => {
  const local = storage();
  await assert.rejects(revokeAndClearSession(local, async () => { throw new Error('offline'); }));
  assert.equal(local.token, 'old');
});
test('already invalid token can be removed', async () => {
  const local = storage();
  await revokeAndClearSession(local, async () => { throw { response: { status: 401 } }; });
  assert.equal(local.token, null);
});
test('does not erase a session established while logout was pending', async () => {
  const local = storage();
  assert.equal(await revokeAndClearSession(local, async () => { local.token = 'new'; }), false);
  assert.equal(local.token, 'new');
});
test('no token does not send a logout request', async () => {
  const local = storage(null);
  assert.equal(await revokeAndClearSession(local, () => assert.fail('unexpected request')), true);
});
