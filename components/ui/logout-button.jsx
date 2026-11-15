'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '13px 12px', marginTop: 25, border: 0, borderRadius: 8, background: 'transparent', color: '#c4d3dd', cursor: 'pointer' }}>
      ↪ Sign out
    </button>
  );
}
