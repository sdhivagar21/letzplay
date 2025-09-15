import React, { useState } from 'react';
import api from '../api.js';

export default function PreorderModal({ product, onClose, onSuccess }) {
  const [size, setSize] = useState(product.sizes?.[0] || '');
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [qty, setQty] = useState(1);

  const submit = async () => {
    try {
      const { data } = await api.post('/api/preorders', {
        sku: product.sku, size, color, quantity: qty
      });
      onSuccess(data);
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Confirm Pre-Order</h3>
        <p>{product.name} — ${product.price}</p>
        <label>Size:
          <select value={size} onChange={e=>setSize(e.target.value)}>
            {product.sizes?.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Color:
          <select value={color} onChange={e=>setColor(e.target.value)}>
            {product.colors?.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Quantity:
          <input type="number" value={qty} onChange={e=>setQty(e.target.value)} />
        </label>
        <button onClick={submit}>Place Pre-Order</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
