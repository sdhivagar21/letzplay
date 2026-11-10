import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { rupees, errorText } from '../api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!user) return;
    setState('loading');
    api.get('/api/preorders/mine', { timeout: 30000 })
      .then((res) => { setOrders(Array.isArray(res.data) ? res.data : []); setState('ready'); })
      .catch((e) => { setError(errorText(e, 'Your pre-orders could not be loaded.')); setState('error'); });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="page page--mid">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My pre-orders' }]} />
      <header className="page__head"><h1 className="h-display h-1">My pre-orders</h1></header>

      {!user && (
        <div className="empty">
          <h2 className="h-display h-3">Sign in to see your pre-orders</h2>
          <p className="muted">Pre-orders are saved to your account.</p>
          <div className="row-actions">
            <Link className="btn btn--solid" to="/login?next=%2Fcart">Sign in</Link>
            <Link className="btn btn--line" to="/signup">Create account</Link>
          </div>
        </div>
      )}

      {user && state === 'loading' && <div className="orders" aria-busy="true"><div className="order sk-block" /><div className="order sk-block" /></div>}

      {user && state === 'error' && (
        <div className="empty">
          <h2 className="h-display h-3">Couldn’t load your pre-orders</h2>
          <p className="muted">{error}</p>
          <button type="button" className="btn btn--solid" onClick={load}>Try again</button>
        </div>
      )}

      {user && state === 'ready' && orders.length === 0 && (
        <div className="empty">
          <h2 className="h-display h-3">No pre-orders yet</h2>
          <p className="muted">Pick a print and it will show up here with its status.</p>
          <Link className="btn btn--solid" to="/collections/New">See new drops</Link>
        </div>
      )}

      {user && state === 'ready' && orders.length > 0 && (
        <ul className="orders">
          {orders.map((o) => (
            <li key={o._id} className="order">
              <div className="order__main">
                <Link className="order__name" to={`/product/${encodeURIComponent(o.sku)}`}>{o.name}</Link>
                <p className="muted">{[o.size && `Size ${o.size}`, o.color, `Qty ${o.qty}`].filter(Boolean).join(', ')}</p>
              </div>
              <div className="order__meta">
                <span className="order__price">{rupees(Number(o.price) * Number(o.qty || 1))}</span>
                <span className="muted tiny">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <span className={`badge badge--${o.status}`}>{o.status}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
