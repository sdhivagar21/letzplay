import React, { useEffect, useState } from 'react';
import api from '../api.js';
import { Link } from 'react-router-dom';

export default function Cart() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/api/preorders/mine')
      .then(res => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="page-wrap">
      <div className="page-head">
        <h1>My Pre-Orders</h1>
        <nav className="crumbs">
          <Link to="/">Home</Link> <span>›</span> <span>Pre-Orders</span>
        </nav>
      </div>

      <div className="table">
        <div className="tr th">
          <div>Product</div><div>Qty</div><div>Price</div><div>Date</div><div>Status</div>
        </div>

        {orders.map(o => (
          <div key={o._id} className="tr">
            <div>
              <div className="t-strong">{o.name}</div>
              <div className="tiny muted">{o.size} • {o.color}</div>
            </div>
            <div>{o.qty}</div>
            <div>₹{o.price}</div>
            <div>{new Date(o.createdAt).toLocaleDateString()}</div>
            <div><span className={`badge ${o.status}`}>{o.status}</span></div>
          </div>
        ))}
      </div>

      {orders.length === 0 && <p className="muted" style={{ padding: '12px' }}>No pre-orders yet.</p>}
    </div>
  );
}
