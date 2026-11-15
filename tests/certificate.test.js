import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCertificateId, resolveStatus } from '../lib/certificate.js';
import { formatCertificateDate } from '../lib/date.js';

const now = new Date('2026-11-15T12:00:00.000Z');

test('generated certificate IDs use a collision-resistant Credora format', () => {
  const first = generateCertificateId();
  const second = generateCertificateId();
  assert.match(first, /^CRD-\d{4}-[A-F0-9]{16}$/);
  assert.notEqual(first, second);
});

test('revocation takes precedence over an expired date', () => {
  assert.equal(resolveStatus('REVOKED', new Date('2026-11-14T00:00:00.000Z'), now), 'REVOKED');
});

test('an expiry date remains valid through that UTC calendar day', () => {
  assert.equal(resolveStatus('VALID', new Date('2026-11-15T00:00:00.000Z'), now), 'VALID');
});

test('expired credentials never resolve as valid', () => {
  assert.equal(resolveStatus('VALID', new Date('2026-11-14T00:00:00.000Z'), now), 'EXPIRED');
});

test('pending credentials retain their pending status until changed', () => {
  assert.equal(resolveStatus('PENDING', null, now), 'PENDING');
  assert.equal(resolveStatus('PENDING', new Date('2026-11-14T00:00:00.000Z'), now), 'PENDING');
});

test('explicitly expired credentials never resolve as valid', () => {
  assert.equal(resolveStatus('EXPIRED', null, now), 'EXPIRED');
});

test('date-only credentials display the stored UTC calendar day', () => {
  assert.equal(formatCertificateDate(new Date('2026-11-15T00:00:00.000Z')), 'Nov 15, 2026');
});
