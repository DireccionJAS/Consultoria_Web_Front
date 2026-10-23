import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAppointmentDate } from '../src/utils/appointmentDate.js';

test('unassigned simulation, CAS and consular dates never become December 31', () => {
  const progress = { dateSimulation: null, dateCas: null, dateCon: null };
  assert.equal(formatAppointmentDate(progress.dateSimulation || progress.dateCas || progress.dateCon), null);
  for (const value of [null, undefined, '', '  ', false, 0, {}, 'invalid-date', '0000-00-00 00:00:00']) {
    assert.equal(formatAppointmentDate(value), null);
  }
});
test('assigned simulation and CAS keep their local calendar date and time', () => {
  assert.deepEqual(formatAppointmentDate('2026-10-30 09:15:00'), { fecha: '30 oct', hora: '09:15' });
  assert.deepEqual(formatAppointmentDate('2026-11-03T12:30:00'), { fecha: '3 nov', hora: '12:30' });
});
test('a real December 31 appointment is preserved, including date-only values', () => {
  assert.deepEqual(formatAppointmentDate('2026-12-31 10:00:00'), { fecha: '31 dic', hora: '10:00' });
  assert.deepEqual(formatAppointmentDate('2026-12-31'), { fecha: '31 dic', hora: '00:00' });
});
