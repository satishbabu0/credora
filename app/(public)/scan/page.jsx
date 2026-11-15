import Link from 'next/link';
import { Camera, ShieldCheck } from 'lucide-react';
import QRScanner from '@/components/verification/qr-scanner';

export default function Scan() {
  return (
    <main className="page-wrap">
      <Link href="/" className="brand" style={{ fontSize: 25, color: '#031827' }}>
        <ShieldCheck className="brand-mark" />Credora
      </Link>
      <section className="panel">
        <Camera size={34} color="#08aebe" />
        <h1>Scan a Certificate QR Code</h1>
        <p className="muted">Use your camera to verify a Credora credential. Camera access works on localhost or an HTTPS deployment.</p>
        <QRScanner />
        <p className="muted">Prefer manual verification? <Link href="/verify">Enter a certificate ID</Link></p>
      </section>
    </main>
  );
}
