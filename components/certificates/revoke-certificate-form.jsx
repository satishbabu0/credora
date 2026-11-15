'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RevokeCertificateForm({ certificateId, onRevoked }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVOKED', reason })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not revoke certificate.');
      setExpanded(false);
      setReason('');
      await onRevoked?.();
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || 'Could not revoke certificate.');
    } finally {
      setBusy(false);
    }
  }

  if (!expanded) {
    return <button type="button" onClick={() => setExpanded(true)} aria-label={`Revoke certificate ${certificateId}`} style={{ color: '#b42318', background: 'none', border: 0, cursor: 'pointer' }}>Revoke</button>;
  }

  return (
    <form onSubmit={submit} aria-label={`Revoke certificate ${certificateId}`}>
      <label htmlFor={`revoke-reason-${certificateId}`}>Reason for revocation (required)</label>
      <textarea
        id={`revoke-reason-${certificateId}`}
        required
        minLength={3}
        maxLength={1000}
        rows={3}
        value={reason}
        onChange={event => setReason(event.target.value)}
      />
      {error && <p className="result bad" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy || reason.trim().length < 3}>
        {busy ? 'Revoking…' : 'Confirm revocation'}
      </button>
      <button type="button" onClick={() => { setExpanded(false); setError(''); }}>Cancel</button>
    </form>
  );
}
