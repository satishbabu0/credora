import { randomBytes } from 'crypto';

export function generateCertificateId() {
  return `CRD-${new Date().getFullYear()}-${randomBytes(8).toString('hex').toUpperCase()}`;
}

export function resolveStatus(status, expiryDate = null, now = new Date()) {
  if (status === 'REVOKED') return 'REVOKED';
  if (status === 'PENDING') return 'PENDING';
  if (status === 'EXPIRED') return 'EXPIRED';
  if (expiryDate) {
    const expiryDay = new Date(expiryDate);
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (expiryDay < today) return 'EXPIRED';
  }
  return 'VALID';
}
