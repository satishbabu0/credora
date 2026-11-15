import Link from 'next/link';
import { Search, ShieldCheck } from 'lucide-react';

export default function VerifyPage() {
  return (
    <main className="page-wrap">
      <Link href="/" className="brand" style={{ fontSize: 25, color: '#031827' }}>
        <ShieldCheck className="brand-mark" />Credora
      </Link>
      <section className="panel">
        <h1 style={{ fontSize: 30, marginTop: 0 }}>Verify a Certificate</h1>
        <p className="muted">Enter the unique certificate ID or use the camera QR scanner to check authenticity.</p>
        <form action="/verify/result" className="field">
          <input name="id" placeholder="Enter certificate ID" defaultValue="" required />
          <button className="btn btn-primary" type="submit"><Search size={17} /> Verify</button>
        </form>
        <p className="muted" style={{ fontSize: 13 }}>
          You can also use the <Link href="/scan" style={{ color: '#07899a', fontWeight: 700 }}>QR scanner</Link>.
          Verification results include the current status and certificate details only.
        </p>
      </section>
    </main>
  );
}
