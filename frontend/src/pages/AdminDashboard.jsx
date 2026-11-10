import React, { useRef, useState } from 'react';
import api, { errorText } from '../api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function AdminDashboard() {
  const fileRef = useRef(null);
  const [exportMsg, setExportMsg] = useState(null); // { ok, text }
  const [uploadMsg, setUploadMsg] = useState(null);
  const [busy, setBusy] = useState('');

  const downloadCSV = async () => {
    setBusy('export'); setExportMsg(null);
    try {
      const res = await api.get('/api/admin/preorders/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'preorders.csv'; a.click();
      URL.revokeObjectURL(url);
      setExportMsg({ ok: true, text: 'Downloaded preorders.csv.' });
    } catch (err) {
      setExportMsg({ ok: false, text: err?.response?.status === 404 ? 'There are no pre-orders to export yet.' : errorText(err, 'The export failed. Check that you are signed in as an admin.') });
    } finally { setBusy(''); }
  };

  const uploadProducts = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('file', f);
    setBusy('upload'); setUploadMsg(null);
    try {
      await api.post('/api/upload/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadMsg({ ok: true, text: `Products from ${f.name} were added or updated.` });
    } catch (err) {
      setUploadMsg({ ok: false, text: errorText(err, 'The upload failed. Check the file matches the sample columns.') });
    } finally {
      setBusy('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <main className="page page--mid">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Admin' }]} />
      <header className="page__head"><h1 className="h-display h-1">Admin dashboard</h1></header>

      <div className="admin-grid">
        <section className="admin-card">
          <h2 className="h-display h-3">Export pre-orders</h2>
          <p className="muted">Download every pre-order as <code>preorders.csv</code>.</p>
          <button type="button" className="btn btn--solid" onClick={downloadCSV} disabled={busy === 'export'}>
            {busy === 'export' ? 'Preparing…' : 'Download CSV'}
          </button>
          {exportMsg && <p className={exportMsg.ok ? 'note' : 'alert'} role="status">{exportMsg.text}</p>}
        </section>

        <section className="admin-card">
          <h2 className="h-display h-3">Bulk upload products</h2>
          <p className="muted">Upload a CSV or Excel file with the columns ProductID, Name, Collection, Price, Description, Sizes, Colors, ImageURLs, Stock.</p>
          <label className={`btn btn--line ${busy === 'upload' ? 'is-disabled' : ''}`}>
            {busy === 'upload' ? 'Uploading…' : 'Choose file'}
            <input className="sr-only" type="file" ref={fileRef} onChange={uploadProducts} accept=".csv,.xls,.xlsx" disabled={busy === 'upload'} />
          </label>
          {uploadMsg && <p className={uploadMsg.ok ? 'note' : 'alert'} role="status">{uploadMsg.text}</p>}
        </section>
      </div>
    </main>
  );
}
