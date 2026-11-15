import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Award, ScanQrCode, UploadCloud, Building2, BarChart3, Settings } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import LogoutButton from '@/components/ui/logout-button';

export default async function AdminLayout({ children }) {
  const auth = await requireAdmin();
  if (auth.error) {
    if (auth.status === 401) redirect('/login');
    redirect('/student/dashboard');
  }
  const session = auth.session;

  const links = [
    ['Dashboard', '/admin/dashboard', LayoutDashboard],
    ['Certificates', '/admin/certificates', Award],
    ['Issue Certificate', '/admin/certificates/new', Award],
    ['Verify Certificate', '/verify', ScanQrCode],
    ['Bulk Upload', '/admin/bulk-upload', UploadCloud],
    ['Organizations', '/admin/organizations', Building2],
    ['Reports', '/admin/reports', BarChart3],
    ['Settings', '/admin/settings', Settings]
  ];

  return (
    <div className="dashboard-shell">
      <aside className="side">
        <div className="brand"><ShieldCheck className="brand-mark" />Credora</div>
        <p style={{ fontSize: 12, color: '#9fb4c2', padding: '0 10px' }}>Signed in as {session.name}</p>
        {links.map(([label, href, Icon], i) => (
          <Link className={i === 0 ? 'active' : ''} href={href} key={label}>
            <Icon size={18} />{label}
          </Link>
        ))}
        <LogoutButton />
      </aside>
      <div>{children}</div>
    </div>
  );
}
