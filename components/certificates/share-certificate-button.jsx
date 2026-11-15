'use client';
import { useState } from 'react';

export default function ShareCertificateButton({ certificateId }) {
  const [message, setMessage] = useState('');

  async function share() {
    const url = `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`;
    setMessage('');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Verify this Credora certificate', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage('Verification link copied.');
    } catch (error) {
      if (error.name !== 'AbortError') setMessage('Unable to share this link from your browser.');
    }
  }

  return (
    <span>
      <button type="button" onClick={share}>Share</button>
      {message && <span className="muted" role="status"> {message}</span>}
    </span>
  );
}
