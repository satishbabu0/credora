'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QRScanner() {
  const elementId = 'credora-qr-reader';
  const scannerRef = useRef(null);
  const router = useRouter();
  const [message, setMessage] = useState('Allow camera access to scan a certificate QR code.');
  const [active, setActive] = useState(false);

  async function start() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } },
        decodedText => {
          scanner.stop().catch(() => {});
          setActive(false);
          try {
            const url = new URL(decodedText);
            const allowedOrigins = [window.location.origin];
            if (process.env.NEXT_PUBLIC_APP_URL) {
              try {
                allowedOrigins.push(new URL(process.env.NEXT_PUBLIC_APP_URL).origin);
              } catch {
                setMessage('The configured public verification URL is invalid.');
                return;
              }
            }
            if (allowedOrigins.includes(url.origin) && /^\/verify\/[^/]+$/.test(url.pathname)) {
              router.push(url.pathname);
            }
            else if (/^[A-Z0-9-]+$/i.test(decodedText)) router.push(`/verify/${encodeURIComponent(decodedText)}`);
            else setMessage('QR code is not a Credora verification link.');
          } catch {
            if (/^[A-Z0-9-]+$/i.test(decodedText)) router.push(`/verify/${encodeURIComponent(decodedText)}`);
            else setMessage('QR code is not a valid certificate ID.');
          }
        },
        () => {}
      );
      setActive(true);
      setMessage('Camera is active. Hold the QR code inside the frame.');
    } catch (error) {
      setMessage(error.message || 'Camera could not start. Check browser permissions and use HTTPS or localhost.');
    }
  }

  useEffect(() => () => {
    if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
  }, []);

  return (
    <div>
      <div id={elementId} style={{ maxWidth: 420, margin: '20px auto' }} />
      <button className="btn btn-primary" onClick={start} disabled={active}>
        {active ? 'Scanner active' : 'Start camera scanner'}
      </button>
      <p className="muted" aria-live="polite">{message}</p>
    </div>
  );
}
