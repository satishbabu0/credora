import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import LogoutButton from '@/components/ui/logout-button';

export default async function StudentLayout({ children }) {
  const auth = await requireUser();
  if (auth.error) redirect('/login');
  if (auth.session.role !== 'STUDENT') redirect('/admin/dashboard');

  return (
    <div>
      <header style={{ padding: '18px 5%', background: '#061d2b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <b>Credora · Student</b>
        <nav aria-label="Student navigation" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/student/dashboard">Dashboard</Link>
          <Link href="/student/certificates">My Certificates</Link>
          <Link href="/">Home</Link>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </div>
  );
}
