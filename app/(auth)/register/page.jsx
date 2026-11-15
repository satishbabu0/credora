'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      router.push('/student/dashboard'); router.refresh();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <main className="page-wrap"><Link href="/" className="brand" style={{fontSize:25,color:'#031827'}}><ShieldCheck className="brand-mark"/>Credora</Link><section className="panel"><h1>Create your student account</h1><p className="muted">Register to view certificates associated with your email.</p><form onSubmit={submit}><input required minLength={2} maxLength={80} placeholder="Full name" autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{display:'block',width:'100%',padding:12,margin:'12px 0',border:'1px solid #cbd5df',borderRadius:8}}/><input required type="email" placeholder="Email address" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{display:'block',width:'100%',padding:12,margin:'12px 0',border:'1px solid #cbd5df',borderRadius:8}}/><input required type="password" minLength={8} placeholder="Password (at least 8 characters)" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{display:'block',width:'100%',padding:12,margin:'12px 0',border:'1px solid #cbd5df',borderRadius:8}}/><button className="btn btn-primary" disabled={busy}>{busy?'Creating account…':'Create account'}</button></form>{message&&<p className="result bad" role="alert">{message}</p>}<p className="muted"><Link href="/login">Already have an account? Sign in</Link></p></section></main>;
}
