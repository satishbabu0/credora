'use client';
import { useEffect, useState } from 'react';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
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
        if (data.institutions.length) setInstitutionId(data.institutions[0].id);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Could not load institutions.');
      } finally {
        if (active) setLoadingInstitutions(false);
      }
    }
    loadInstitutions();
    return () => { active = false; };
  }, []);

  async function upload() {
    if (!file) {
      setError('Choose a CSV file first.');
      return;
    }
    if (file.size > 2_000_000) {
      setError('Choose a CSV file smaller than 2 MB.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    setResult(null);
    try {
      const response = await fetch('/api/certificates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: await file.text(), institutionId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Import failed.');
      setResult(data);
      setMessage(`Imported ${data.created} certificate(s). ${data.errors.length} row(s) need attention.`);
    } catch (requestError) {
      setError(requestError.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dash-main">
      <h1>Bulk Certificate Upload</h1>
      <section className="panel" style={{ margin: '25px 0' }}>
        <p className="muted">
          CSV columns: recipientName, recipientEmail, courseName and issueDate (YYYY-MM-DD).
          Optional: certificateTitle, expiryDate and description. Imports are limited to 1,000 records.
        </p>
        <p>
          <a href="data:text/csv;charset=utf-8,recipientName%2CrecipientEmail%2CcourseName%2CcertificateTitle%2CissueDate%2CexpiryDate%2Cdescription%0A" download="credora-certificates-template.csv">
            Download an empty CSV template
          </a>
        </p>
        <label htmlFor="bulk-institution">Institution
          <select
            id="bulk-institution"
            required
            value={institutionId}
            onChange={event => setInstitutionId(event.target.value)}
            disabled={loadingInstitutions || institutions.length === 0}
            style={{ display: 'block', width: '100%', padding: 12, margin: '8px 0 18px', border: '1px solid #cbd5df', borderRadius: 8 }}
          >
            <option value="">{loadingInstitutions ? 'Loading institutions…' : 'Select institution'}</option>
            {institutions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label htmlFor="bulk-file">CSV file
          <input id="bulk-file" type="file" accept=".csv,text/csv" onChange={event => setFile(event.target.files?.[0] || null)} />
        </label>
        {file && <p className="muted">{file.name}</p>}
        <button className="btn btn-primary" type="button" disabled={busy || loadingInstitutions || !institutions.length} onClick={upload}>
          {busy ? 'Importing…' : 'Import certificates'}
        </button>
        {error && <p className="result bad" role="alert">{error}</p>}
        {message && <p className="result" role="status">{message}</p>}
        {result?.errors?.length > 0 && (
          <div className="result bad" role="alert">
            <b>Rows not imported</b>
            {result.errors.map(item => <p key={item.row}>Row {item.row}: {item.error}</p>)}
          </div>
        )}
      </section>
    </main>
  );
}
