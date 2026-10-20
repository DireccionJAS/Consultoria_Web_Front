import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientsOnly, accountConfirmation, requireAccountActionSuccess } from '../src/utils/accountActions.js';

const client = { idUser: 3, email: 'synthetic@example.test', role: { name: 'USER' } };
test('client lists exclude EMPRESA and ADMIN regardless of role representation', () => {
  assert.deepEqual(clientsOnly([client, { role: 'EMPRESA' }, { role: { name: 'ADMIN' } }, {}]), [client]);
});
test('archive confirmation identifies account and explains client access is preserved', () => {
  const options = accountConfirmation(client, 'archive', true);
  assert.match(options.text, /synthetic@example.test/);
  assert.match(options.text, /USER/);
  assert.match(options.text, /no modifica su acceso/);
  assert.equal(options.focusCancel, true);
});
test('company cannot be passed to account management confirmation', () => {
  assert.throws(() => accountConfirmation({ ...client, role: 'EMPRESA' }, 'archive', true));
});
test('suspension and administrator archival explain loss of access', () => {
  assert.match(accountConfirmation(client, 'status', false).text, /perderá el acceso/);
  const options = accountConfirmation({ ...client, role: 'ADMIN' }, 'archive', true);
  assert.match(options.text, /clientes quedarán sin encargado/);
});
test('HTTP success with business rejection must not be reported as success', () => {
  assert.throws(() => requireAccountActionSuccess({ success: false, message: 'No autorizado' }), /No autorizado/);
  assert.throws(() => requireAccountActionSuccess(null));
  assert.deepEqual(requireAccountActionSuccess({ success: true }), { success: true });
});
