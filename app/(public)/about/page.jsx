import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <main className="page-wrap">
      <Link href="/" className="brand" style={{ fontSize: 25, color: '#031827' }}>
        <ShieldCheck className="brand-mark" />Credora
      </Link>
      <section className="panel">
        <h1>About Credora</h1>
        <p className="muted">Credora is a secure digital credential platform for issuing, managing and verifying certificates with trust, speed and transparency.</p>
        <p><b>Mission:</b> Every achievement deserves to be trusted.</p>
        <p className="muted">The platform is designed for institutions, students and employers to handle verifiable credentials without friction.</p>
      </section>
    </main>
  );
}
