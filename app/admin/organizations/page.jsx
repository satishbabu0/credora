import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Organizations() {
  const auth = await requireAdmin();
  if (auth.error) {
    if (auth.status === 401) redirect('/login');
    redirect('/student/dashboard');
  }
  const where = auth.session.role === 'SUPER_ADMIN' ? {} : { id: auth.session.institutionId };
  const institutions = await db.institution.findMany({
    where,
    include: { _count: { select: { users: true, certificates: true } } },
    orderBy: { name: 'asc' }
  });

  return (
    <main className="dash-main">
      <h1>Organizations</h1>
      {institutions.length ? (
        <div className="feature-grid">
          {institutions.map(institution => (
            <section className="panel" key={institution.id} style={{ margin: '12px 0' }}>
              <h2>{institution.name}</h2>
              {institution.description && <p className="muted">{institution.description}</p>}
              <p>{institution._count.certificates} certificate{institution._count.certificates === 1 ? '' : 's'}</p>
              <p>{institution._count.users} account{institution._count.users === 1 ? '' : 's'} associated</p>
            </section>
          ))}
        </div>
      ) : <p className="muted">No institution is assigned to this administrator.</p>}
    </main>
  );
}
