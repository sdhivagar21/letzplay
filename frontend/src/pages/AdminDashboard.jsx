import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'lp-admin-key';
const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

// Admin shows one thing: how many people visited the site.
// The passcode is checked by the stats function, never in the browser.
export default function AdminDashboard() {
  const [key, setKey] = useState(() => { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } });
  const [draft, setDraft] = useState('');
  const [data, setData] = useState(null);
  const [state, setState] = useState(key ? 'loading' : 'locked');   // locked | loading | ready | error
  const [message, setMessage] = useState('');

  const load = useCallback(async (k) => {
    setState('loading'); setMessage('');
    try {
      const res = await fetch('/.netlify/functions/stats', { headers: { 'x-admin-key': k } });
      if (res.status === 401) { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } setKey(''); setState('locked'); setMessage('That passcode is not right.'); return; }
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
      try { sessionStorage.setItem(KEY, k); } catch { /* ignore */ }
      setKey(k);
      setState('ready');
    } catch {
      setState('error');
      setMessage('The visitor count could not be loaded. It only works on the live site, not on the local dev server.');
    }
  }, []);

  useEffect(() => { if (key) load(key); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const unlock = (e) => { e.preventDefault(); if (draft.trim()) load(draft.trim()); };
  const lock = () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } setKey(''); setData(null); setDraft(''); setState('locked'); };

  if (state === 'locked' || (state === 'error' && !data && !key)) {
    return (
      <main className="page page--narrow admin">
        <h1 className="h-display h-1">Admin</h1>
        <form className="form" onSubmit={unlock}>
          <label className="field">Passcode
            <input className="input" type="password" value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="current-password" autoFocus />
          </label>
          {message && <p className="alert" role="alert">{message}</p>}
          <button type="submit" className="btn btn--solid">See visitors</button>
        </form>
        <p className="admin__back"><Link className="textlink" to="/">Back to the site</Link></p>
      </main>
    );
  }

  const days = data?.days || [];
  const peak = Math.max(1, ...days.map((d) => d.count));

  return (
    <main className="page page--narrow admin">
      <h1 className="h-display h-1">Visitors</h1>
      {state === 'loading' && !data && <p className="muted">Loading…</p>}
      {state === 'error' && <p className="alert" role="alert">{message}</p>}
      {data && (
        <>
          <div className="admin__stats">
            <div><span>All time</span><strong>{data.total.toLocaleString('en-IN')}</strong></div>
            <div><span>Today</span><strong>{data.today.toLocaleString('en-IN')}</strong></div>
            <div><span>Last 7 days</span><strong>{data.week.toLocaleString('en-IN')}</strong></div>
          </div>
          <h2 className="h-display h-3 admin__sub">Last 14 days</h2>
          <ul className="admin__days">
            {days.map((d) => (
              <li key={d.date}>
                <span>{dayLabel(d.date)}</span>
                <i aria-hidden="true"><b style={{ transform: `scaleX(${d.count / peak})` }} /></i>
                <strong>{d.count}</strong>
              </li>
            ))}
          </ul>
          <p className="tiny muted">One visit is counted per browser per day. Pre-order details arrive by email, not here.</p>
        </>
      )}
      <div className="row-actions admin__actions">
        <button type="button" className="btn btn--line" onClick={() => load(key)} disabled={state === 'loading'}>{state === 'loading' ? 'Refreshing…' : 'Refresh'}</button>
        <button type="button" className="btn btn--text" onClick={lock}>Lock</button>
        <Link className="btn btn--text" to="/">Back to the site</Link>
      </div>
    </main>
  );
}
