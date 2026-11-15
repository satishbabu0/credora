'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import RevokeCertificateForm from '@/components/certificates/revoke-certificate-form';
import { formatCertificateDate } from '@/lib/date';

const statusColors = {
  VALID: { color: '#12633a', background: '#eaf7f0' },
  REVOKED: { color: '#a32929', background: '#fff0f0' },
  EXPIRED: { color: '#805b00', background: '#fff7df' },
  PENDING: { color: '#475569', background: '#edf2f7' }
};

export default function Certificates() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pageCount: 0, total: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set('q', query);
      if (status) params.set('status', status);
      const response = await fetch(`/api/certificates?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load certificates.');
      setList(data.certificates);
      setPagination(data.pagination);
    } catch (requestError) {
      setError(requestError.message || 'Could not load certificates.');
    } finally {
      setLoading(false);
    }
  }, [page, query, status]);

  useEffect(() => { load(); }, [load]);

  function searchCertificates(event) {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  function filterStatus(event) {
    setPage(1);
    setStatus(event.target.value);
  }

  return (
    <main className="dash-main">
      <div className="dash-top">
        <div>
          <h1>Certificates</h1>
          <p className="muted">{pagination.total} credential{pagination.total === 1 ? '' : 's'} in your authorized scope</p>
        </div>
        <Link href="/admin/certificates/new" className="btn btn-primary">Issue certificate</Link>
      </div>

      <form onSubmit={searchCertificates} className="field" role="search" aria-label="Search certificates">
        <label htmlFor="certificate-search">Search by recipient or certificate ID</label>
        <input id="certificate-search" value={search} onChange={event => setSearch(event.target.value)} />
        <button className="btn btn-primary" type="submit">Search</button>
        <label htmlFor="certificate-status">Filter by status</label>
        <select id="certificate-status" value={status} onChange={filterStatus}>
          <option value="">All statuses</option>
          <option value="VALID">Valid</option>
          <option value="EXPIRED">Expired</option>
          <option value="REVOKED">Revoked</option>
          <option value="PENDING">Pending</option>
        </select>
      </form>

      {error && <p className="result bad" role="alert">{error}</p>}
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Certificate ID</th><th>Recipient</th><th>Course</th><th>Institution</th><th>Issue date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map(certificate => (
              <tr key={certificate.id}>
                <td>{certificate.certificateId}</td>
                <td>{certificate.recipientName}</td>
                <td>{certificate.courseName}</td>
                <td>{certificate.institution.name}</td>
                <td>{formatCertificateDate(certificate.issueDate)}</td>
                <td>
                  <span className="status" style={statusColors[certificate.status] || statusColors.PENDING}>
                    {certificate.status}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/certificates/${certificate.id}`}>Details</Link>
                  {' · '}<a href={`/api/certificates/${certificate.id}/pdf`}>PDF</a>
                  {certificate.status !== 'REVOKED' && (
                    <div style={{ marginTop: 8 }}>
                      <RevokeCertificateForm certificateId={certificate.id} onRevoked={load} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="muted" role="status">Loading certificates…</p>}
        {!loading && !error && !list.length && (
          <p className="muted">{query || status ? 'No certificates match these filters.' : 'No certificates have been issued yet.'}</p>
        )}
      </div>
      {pagination.pageCount > 1 && (
        <nav aria-label="Certificate pages" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <button type="button" className="btn" disabled={page <= 1 || loading} onClick={() => setPage(current => current - 1)}>Previous</button>
          <span className="muted">Page {page} of {pagination.pageCount}</span>
          <button type="button" className="btn" disabled={page >= pagination.pageCount || loading} onClick={() => setPage(current => current + 1)}>Next</button>
        </nav>
      )}
    </main>
  );
}
