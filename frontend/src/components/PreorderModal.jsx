import React, { useState } from 'react';
import api from '../api.js';

export default function PreorderModal({ product, onClose, onSuccess }) {
  const [size, setSize] = useState(product.sizes?.[0] || '');
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState(''); // allow guest

  const submit = async () => {
    try {
      const { data } = await api.post('/api/preorders', {
        sku: product.sku || product.ProductID || product._id,
        size,
        color,
        quantity: qty,
        email: email || undefined
      });
      onSuccess?.(data);
      onClose?.();
      alert('Pre-order saved!');
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Confirm Pre-Order</h3>
        <p>{product.name} — ₹{product.price}</p>

        <label>Size:
          <select value={size} onChange={e => setSize(e.target.value)}>
            {(product.sizes || []).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label>Color:
          <select value={color} onChange={e => setColor(e.target.value)}>
            {(product.colors || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label>Quantity:
          <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />
        </label>

        <label>Email (optional for guest):
          <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>

        <div style={{marginTop:12}}>
          <button onClick={submit}>Place Pre-Order</button>
          <button onClick={onClose} style={{marginLeft:8}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
