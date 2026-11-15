import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { resolveStatus } from '@/lib/certificate';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const auth = await requireAdmin();
  if (auth.error) {
    if (auth.status === 401) redirect('/login');
    redirect('/student/dashboard');
  }

  const where = auth.session.role === 'SUPER_ADMIN' ? {} : { institutionId: auth.session.institutionId };
  const verificationWhere = auth.session.role === 'SUPER_ADMIN'
    ? {}
    : { certificate: { is: { institutionId: auth.session.institutionId } } };
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let certificates = [];
  let stats = null;
  let errorMessage = '';

  try {
    const [recent, total, valid, revoked, verifications] = await Promise.all([
      db.certificate.findMany({
        where,
        include: { institution: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8
      }),
      db.certificate.count({ where }),
      db.certificate.count({
        where: {
          ...where,
          status: 'VALID',
          OR: [{ expiryDate: null }, { expiryDate: { gte: today } }]
        }
      }),
      db.certificate.count({ where: { ...where, status: 'REVOKED' } }),
      db.verificationLog.count({ where: verificationWhere })
    ]);
    certificates = recent;
    stats = { total, valid, revoked, verifications };
  } catch (error) {
    console.error('Admin dashboard query failed:', error);
    errorMessage = 'Dashboard data is temporarily unavailable. Please try again.';
  }

  return (
    <main className="dash-main">
      <div className="dash-top">
        <div>
          <p className="muted" style={{ margin: 0 }}>CREDORA / ADMIN</p>
          <h1 style={{ margin: '6px 0' }}>Dashboard</h1>
        </div>
        <Link className="btn btn-primary" href="/admin/certificates/new">+ Issue Certificate</Link>
      </div>
      {errorMessage && <p className="result bad" role="alert">{errorMessage}</p>}
      {stats && (
        <div className="dash-cards">
          {[
            ['Total certificates', stats.total],
            ['Valid certificates', stats.valid],
            ['Total verifications', stats.verifications]
          ].map(([label, value]) => (
            <div className="dash-card" key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="table-card">
        <h2>Recent certificates</h2>
        {errorMessage ? null : certificates.length ? (
          <table>
            <thead><tr><th>Certificate ID</th><th>Recipient</th><th>Course</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>{certificates.map(certificate => (
              <tr key={certificate.id}>
                <td>{certificate.certificateId}</td>
                <td>{certificate.recipientName}</td>
                <td>{certificate.courseName}</td>
                <td>{resolveStatus(certificate.status, certificate.expiryDate)}</td>
                <td><Link href={`/admin/certificates/${certificate.id}`}>Manage</Link></td>
              </tr>
            ))}</tbody>
          </table>
        ) : <p className="muted">No certificates have been issued yet.</p>}
      </div>
    </main>
  );
}
