import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { resolveStatus } from '@/lib/certificate';
export const dynamic = 'force-dynamic';
export default async function StudentDashboard() {
  const auth = await requireUser();
  if (auth.error) redirect('/login');
  const session = auth.session;
  if (session.role !== 'STUDENT') redirect('/admin/dashboard');
  const certificates = await db.certificate.findMany({ where: { recipientEmail: session.email.toLowerCase() }, include: { institution: { select: { name: true } } }, orderBy: { issueDate: 'desc' } });
  return <main className="page-wrap"><section className="panel"><p className="muted">STUDENT PORTAL</p><h1>Welcome, {session.name}</h1><p className="muted">Your digital credentials are linked to your account.</p><div className="dash-cards"><div className="dash-card"><small>My certificates</small><strong>{certificates.length}</strong></div><div className="dash-card"><small>Valid certificates</small><strong>{certificates.filter(c=>resolveStatus(c.status,c.expiryDate)==='VALID').length}</strong></div></div><Link className="btn btn-primary" href="/student/certificates">View my certificates</Link></section></main>;
}
