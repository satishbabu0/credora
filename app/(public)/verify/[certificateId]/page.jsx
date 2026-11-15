import Link from 'next/link';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { verifyPublicCertificate } from '@/lib/verification';
import { formatCertificateDate } from '@/lib/date';

export const dynamic = 'force-dynamic';

export default async function CertificateVerification({ params }) {
  const { certificateId } = await params;
  let result;
  let unavailable = false;

  try {
    result = await verifyPublicCertificate(certificateId, 'PUBLIC_PAGE');
  } catch (error) {
    console.error('Could not load certificate verification page:', error);
    unavailable = true;
  }

  const certificate = result?.certificate;
  const status = result?.status;
  const valid = status === 'VALID';

  return (
    <main className="page-wrap">
      <Link href="/" className="brand" style={{ fontSize: 25, color: '#031827' }}>
        <ShieldCheck className="brand-mark" />Credora
      </Link>
      <section className="panel">
        <h1 style={{ marginTop: 0 }}>Certificate Verification</h1>
        <p className="muted">Certificate ID: <b>{certificateId}</b></p>

        {unavailable ? (
          <div className="result bad" role="alert">
            <h2>Verification Unavailable</h2>
            <p>We could not reach the verification service. Please try again shortly.</p>
          </div>
        ) : certificate ? (
          <div className={'result ' + (valid ? '' : 'bad')}>
            <h2 style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {valid ? <ShieldCheck /> : <AlertTriangle />}
              {valid ? 'Certificate Verified' : `Certificate ${status}`}
            </h2>
            <p><b>Recipient:</b> {certificate.recipientName}</p>
            <p><b>Course:</b> {certificate.courseName}</p>
            <p><b>Institution:</b> {certificate.institution}</p>
            <p><b>Issue date:</b> {formatCertificateDate(certificate.issueDate)}</p>
            <p><b>Expiry date:</b> {certificate.expiryDate ? formatCertificateDate(certificate.expiryDate) : 'No expiry date'}</p>
            <p><b>Status:</b> {status}</p>
          </div>
        ) : (
          <div className="result bad">
            <h2>Certificate Not Found</h2>
            <p>No matching record was found. Check the certificate ID and try again.</p>
          </div>
        )}

        <Link href="/verify" className="btn btn-primary" style={{ marginTop: 15 }}>Verify another certificate</Link>
      </section>
    </main>
  );
}
