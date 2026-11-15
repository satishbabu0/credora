'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sign in failed');
      router.push(data.user.role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard');
      router.refresh();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <main className="page-wrap"><Link href="/" className="brand" style={{fontSize:25,color:'#031827'}}><ShieldCheck className="brand-mark"/>Credora</Link><section className="panel"><h1>Welcome back</h1><p className="muted">Sign in to manage or view your digital credentials.</p><form onSubmit={submit}><label>Email<input type="email" required autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" style={{display:'block',width:'100%',padding:12,margin:'8px 0 18px',border:'1px solid #cbd5df',borderRadius:8}}/></label><label>Password<input type="password" required autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password" style={{display:'block',width:'100%',padding:12,margin:'8px 0 18px',border:'1px solid #cbd5df',borderRadius:8}}/></label><button className="btn btn-primary" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form>{message&&<p className="result bad" role="alert">{message}</p>}<p className="muted">New here? <Link href="/register">Create a student account</Link></p></section></main>;
}
