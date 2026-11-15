'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function localDateValue() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function NewCertificate() {
  const [form, setForm] = useState({
    recipientName: '',
    recipientEmail: '',
    courseName: '',
    institutionId: '',
    certificateTitle: 'Certificate of Achievement',
    issueDate: localDateValue(),
    expiryDate: '',
    description: ''
  });
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [message, setMessage] = useState('');
  const [created, setCreated] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadInstitutions() {
      try {
        const response = await fetch('/api/institutions');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load institutions.');
        if (!active) return;
        setInstitutions(data.institutions);
        if (data.institutions.length) {
          setForm(current => ({ ...current, institutionId: data.institutions[0].id }));
        }
      } catch (error) {
        if (active) setMessage(error.message || 'Could not load institutions.');
      } finally {
        if (active) setLoadingInstitutions(false);
      }
    }
    loadInstitutions();
    return () => { active = false; };
  }, []);

  function updateField(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setCreated(null);
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not issue certificate.');
      setCreated(data.certificate);
      setMessage('Certificate issued successfully.');
      setForm(current => ({
        ...current,
        recipientName: '',
        recipientEmail: '',
        courseName: '',
        description: '',
        expiryDate: ''
      }));
    } catch (error) {
      setMessage(error.message || 'Could not issue certificate.');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: 12,
    border: '1px solid #cbd5df',
    borderRadius: 8,
    marginTop: 7
  };
  const labelStyle = { display: 'block', margin: '15px 0', fontWeight: 600, fontSize: 13 };

  return (
    <main className="dash-main">
      <Link href="/admin/certificates">← Certificates</Link>
      <section className="panel" style={{ margin: '25px 0', maxWidth: 760 }}>
        <h1>Issue New Certificate</h1>
        <p className="muted">Create a database-backed credential with a unique ID and QR verification link.</p>
        <form onSubmit={submit}>
          <label htmlFor="recipientName" style={labelStyle}>Recipient full name
            <input id="recipientName" name="recipientName" autoComplete="name" required minLength={2} maxLength={120} value={form.recipientName} onChange={updateField} style={inputStyle} />
          </label>
          <label htmlFor="recipientEmail" style={labelStyle}>Recipient email
            <input id="recipientEmail" name="recipientEmail" type="email" autoComplete="email" required maxLength={160} value={form.recipientEmail} onChange={updateField} style={inputStyle} />
          </label>
          <label htmlFor="certificateTitle" style={labelStyle}>Certificate title
            <input id="certificateTitle" name="certificateTitle" required minLength={2} maxLength={160} value={form.certificateTitle} onChange={updateField} style={inputStyle} />
          </label>
          <label htmlFor="courseName" style={labelStyle}>Course or program name
            <input id="courseName" name="courseName" required minLength={2} maxLength={160} value={form.courseName} onChange={updateField} style={inputStyle} />
          </label>
          <label htmlFor="institutionId" style={labelStyle}>Institution
            <select id="institutionId" name="institutionId" required value={form.institutionId} onChange={updateField} disabled={loadingInstitutions || institutions.length === 0} style={inputStyle}>
              <option value="">{loadingInstitutions ? 'Loading institutions…' : 'Select institution'}</option>
              {institutions.map(institution => <option key={institution.id} value={institution.id}>{institution.name}</option>)}
            </select>
          </label>
          <label htmlFor="issueDate" style={labelStyle}>Issue date
            <input id="issueDate" name="issueDate" type="date" required value={form.issueDate} onChange={updateField} style={inputStyle} />
          </label>
          <label htmlFor="expiryDate" style={labelStyle}>Expiry date (optional)
            <input id="expiryDate" name="expiryDate" type="date" min={form.issueDate} value={form.expiryDate} onChange={updateField} style={inputStyle} />
          </label>
          <label htmlFor="description" style={labelStyle}>Achievement details (optional)
            <textarea id="description" name="description" maxLength={2000} rows={4} value={form.description} onChange={updateField} style={inputStyle} />
          </label>
          <button className="btn btn-primary" disabled={busy || loadingInstitutions || !institutions.length}>
            {busy ? 'Issuing…' : 'Issue Certificate'}
          </button>
        </form>
        {message && <p className={created ? 'result' : 'result bad'} role={created ? 'status' : 'alert'}>{message}</p>}
        {created && (
          <div className="panel" style={{ margin: '15px 0', padding: 18 }}>
            <b>Certificate ID: {created.certificateId}</b>
            <p><Link href={`/verify/${encodeURIComponent(created.certificateId)}`}>Open public verification</Link></p>
            <p><a href={`/api/qr/${encodeURIComponent(created.certificateId)}`} target="_blank" rel="noreferrer">View QR code</a></p>
            <p><a href={`/api/certificates/${created.id}/pdf`}>Download certificate PDF</a></p>
            <p><Link href={`/admin/certificates/${created.id}`}>Manage certificate</Link></p>
          </div>
        )}
      </section>
    </main>
  );
}
