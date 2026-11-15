import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { resolveStatus } from '@/lib/certificate';
import { formatCertificateDate } from '@/lib/date';
import RevokeCertificateForm from '@/components/certificates/revoke-certificate-form';

export const dynamic = 'force-dynamic';

export default async function CertificateDetails({ params }) {
  const auth = await requireAdmin();
  if (auth.error) {
    if (auth.status === 401) redirect('/login');
    redirect('/student/dashboard');
  }
  const { id } = await params;
  const where = { id };
  if (auth.session.role === 'INSTITUTION_ADMIN') where.institutionId = auth.session.institutionId;

  const certificate = await db.certificate.findFirst({
    where,
    include: {
      institution: { select: { name: true } },
      issuedBy: { select: { name: true } }
    }
  });
  if (!certificate) notFound();

  const [auditLogs, verificationLogs] = await Promise.all([
    db.auditLog.findMany({
      where: { entityType: 'Certificate', entityId: id },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    db.verificationLog.findMany({
      where: { certificateId: id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ]);
  const status = resolveStatus(certificate.status, certificate.expiryDate);
  return (
    <main className="dash-main">
      <Link href="/admin/certificates">← Certificates</Link>
      <div className="dash-top" style={{ marginTop: 16 }}>
        <div>
          <p className="muted" style={{ margin: 0 }}>CERTIFICATE DETAILS</p>
          <h1 style={{ margin: '6px 0' }}>{certificate.certificateId}</h1>
        </div>
        <a className="btn btn-primary" href={`/api/certificates/${certificate.id}/pdf`}>Download PDF</a>
      </div>

      <section className="panel" style={{ margin: '20px 0', maxWidth: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h2>{certificate.certificateTitle}</h2>
            <p><b>Recipient:</b> {certificate.recipientName}</p>
            <p><b>Recipient email:</b> {certificate.recipientEmail}</p>
            <p><b>Course/program:</b> {certificate.courseName}</p>
            <p><b>Institution:</b> {certificate.institution.name}</p>
            <p><b>Issue date:</b> {formatCertificateDate(certificate.issueDate)}</p>
            <p><b>Expiry date:</b> {formatCertificateDate(certificate.expiryDate)}</p>
            <p><b>Status:</b> {status}</p>
            {certificate.description && <p><b>Achievement details:</b> {certificate.description}</p>}
            {certificate.status === 'REVOKED' && (
              <>
                <p><b>Revoked on:</b> {formatCertificateDate(certificate.revokedAt)}</p>
                <p><b>Revocation reason:</b> {certificate.revocationReason}</p>
              </>
            )}
            <p className="muted">Issued by {certificate.issuedBy?.name || 'Administrator'}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={`/api/qr/${encodeURIComponent(certificate.certificateId)}`}
              alt={`QR code for certificate ${certificate.certificateId}`}
              width="180"
              height="180"
            />
            <p><Link href={`/verify/${encodeURIComponent(certificate.certificateId)}`}>Open public verification</Link></p>
          </div>
        </div>
        {certificate.status !== 'REVOKED' && <RevokeCertificateForm certificateId={certificate.id} />}
      </section>

      <section className="table-card">
        <h2>Audit history</h2>
        {auditLogs.length ? (
          <table>
            <thead><tr><th>Action</th><th>Actor</th><th>Date</th><th>Details</th></tr></thead>
            <tbody>{auditLogs.map(log => (
              <tr key={log.id}>
                <td>{log.action.replaceAll('_', ' ')}</td>
                <td>{log.actorId || 'System'}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.details || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : <p className="muted">No audit entries are available for this certificate.</p>}

        <h2 style={{ marginTop: 28 }}>Verification history</h2>
        {verificationLogs.length ? (
          <table>
            <thead><tr><th>Result</th><th>Method</th><th>Date</th></tr></thead>
            <tbody>{verificationLogs.map(log => (
              <tr key={log.id}>
                <td>{log.result}</td>
                <td>{log.method.replaceAll('_', ' ')}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : <p className="muted">This certificate has not been verified yet.</p>}
      </section>
    </main>
  );
}
