import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function HowItWorks() {
  return (
    <main className="page-wrap">
      <Link href="/" className="brand" style={{ fontSize: 25, color: '#031827' }}>
        <ShieldCheck className="brand-mark" />Credora
      </Link>
      <section className="panel">
        <h1>How It Works</h1>
        <ol style={{ lineHeight: 2.2, paddingLeft: 22 }}>
          <li>Institutions create a certificate record for a learner or participant.</li>
          <li>Credora generates a unique credential ID and verification link.</li>
          <li>A QR code is embedded into the certificate for quick public verification.</li>
          <li>A verifier scans the code or enters the ID on the public verification page.</li>
          <li>The platform checks the database and shows the current valid, expired or revoked status.</li>
        </ol>
        <Link href="/verify" className="btn btn-primary">Try verification</Link>
      </section>
    </main>
  );
}
