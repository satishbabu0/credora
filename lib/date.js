export function formatCertificateDate(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}
