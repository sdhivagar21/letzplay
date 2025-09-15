import React, { useRef } from 'react';
import api from '../api.js';

export default function AdminDashboard() {
  const fileRef = useRef(null);

  const downloadCSV = async () => {
    try {
      const res = await api.get('/api/admin/preorders/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'preorders.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No preorders yet or not authorized.');
    }
  };

  const uploadProducts = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('file', f);
    try {
      await api.post('/api/upload/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Products uploaded/updated!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Upload failed');
    } finally {
      fileRef.current.value = '';
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-head"><h1>Admin Dashboard</h1></div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Export Pre-Orders</h3>
          <p className="muted tiny">Download the latest <code>preorders.csv</code>.</p>
          <button className="btn-solid" onClick={downloadCSV}>Download CSV</button>
        </div>

        <div className="admin-card">
          <h3>Bulk Upload Products</h3>
          <p className="muted tiny">Upload a CSV/Excel matching the sample schema.</p>
          <input type="file" ref={fileRef} onChange={uploadProducts} accept=".csv,.xls,.xlsx" />
        </div>
      </div>
    </div>
  );
}
