import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { resolveStatus } from '@/lib/certificate';
import ShareCertificateButton from '@/components/certificates/share-certificate-button';
export const dynamic = 'force-dynamic';
export default async function MyCertificates() {
  const auth = await requireUser();
  if (auth.error) redirect('/login');
  const session = auth.session;
  if (session.role !== 'STUDENT') redirect('/admin/certificates');
  const certificates = await db.certificate.findMany({ where: { recipientEmail: session.email.toLowerCase() }, include: { institution: { select: { name: true } } }, orderBy: { issueDate: 'desc' } });
  return <main className="page-wrap"><section className="panel"><h1>My Certificates</h1><p className="muted">Credentials issued to your account.</p>{certificates.length?<div className="table-card"><table><thead><tr><th>Certificate ID</th><th>Course</th><th>Institution</th><th>Status</th><th>Actions</th></tr></thead><tbody>{certificates.map(c=>{const status=resolveStatus(c.status,c.expiryDate);return <tr key={c.id}><td>{c.certificateId}</td><td>{c.courseName}</td><td>{c.institution.name}</td><td>{status}</td><td><Link href={`/verify/${encodeURIComponent(c.certificateId)}`}>Verify</Link> · <a href={`/api/certificates/${c.id}/pdf`}>Download PDF</a> · <ShareCertificateButton certificateId={c.certificateId}/></td></tr>;})}</tbody></table></div>:<p className="result">No certificates are currently associated with your account.</p>}<Link href="/" className="btn btn-primary" style={{marginTop:18}}>Home</Link></section></main>;
}
