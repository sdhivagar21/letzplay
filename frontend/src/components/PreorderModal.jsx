import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api, { idOf, imagesOf, imgSrc, imgFallback, rupees, errorText } from '../api.js';

// Confirmation step for a pre-order. Size, colour and quantity are chosen
// on the product page and can still be changed here.
export default function PreorderModal({ product, initial = {}, onClose, onSuccess }) {
  const [size, setSize] = useState(initial.size || product.sizes?.[0] || '');
  const [color, setColor] = useState(initial.color || product.colors?.[0] || '');
  const [qty, setQty] = useState(initial.qty || 1);
  const [state, setState] = useState('idle'); // idle | saving | done
  const [error, setError] = useState('');
  const nav = useNavigate();
  const loc = useLocation();
  const boxRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    boxRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const submit = async () => {
    setState('saving');
    setError('');
    try {
      const { data } = await api.post('/api/preorders', {
        sku: idOf(product),
        size,
        color,
        quantity: Math.max(1, Number(qty) || 1),
      }, { timeout: 30000 });
      setState('done');
      onSuccess?.(data);
    } catch (e) {
      if (e?.response?.status === 401) {
        nav(`/login?next=${encodeURIComponent(loc.pathname)}`);
        return;
      }
      setState('idle');
      setError(errorText(e, 'The pre-order could not be saved. Try again.'));
    }
  };

  const pic = imagesOf(product)[0];
  const total = Number(product.price) * Math.max(1, Number(qty) || 1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="po-title" tabIndex={-1} ref={boxRef} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>×</button>

        {state === 'done' ? (
          <div className="modal__done">
            <p className="modal__burst" aria-hidden="true">+1</p>
            <h3 id="po-title" className="h-display h-3">Pre-order placed</h3>
            <p className="muted">{product.name}, size {size || 'n/a'}, quantity {qty}. Its status shows under My pre-orders.</p>
            <div className="row-actions">
              <Link className="btn btn--coin" to="/cart">View my pre-orders</Link>
              <button type="button" className="btn btn--ghost" onClick={onClose}>Keep browsing</button>
            </div>
          </div>
        ) : (
          <>
            <h3 id="po-title" className="h-display h-3">Confirm your pre-order</h3>
            <div className="modal__item">
              {pic && <img src={imgSrc(pic)} onError={imgFallback(pic)} alt="" width="72" height="96" />}
              <div>
                <p className="t-strong">{product.name}</p>
                <p className="muted">{rupees(product.price)} each</p>
              </div>
            </div>

            <div className="modal__fields">
              {!!product.sizes?.length && (
                <label className="field">Size
                  <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
                    {product.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              )}
              {!!product.colors?.length && (
                <label className="field">Colour
                  <select className="input" value={color} onChange={(e) => setColor(e.target.value)}>
                    {product.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              )}
              <label className="field">Quantity
                <input className="input" type="number" min="1" max="20" value={qty} onChange={(e) => setQty(e.target.value)} />
              </label>
            </div>

            <div className="modal__total"><span>Total</span><strong>{rupees(total)}</strong></div>
            <p className="tiny muted">No payment is taken now. This saves your pre-order to your account.</p>
            {error && <p className="alert" role="alert">{error}</p>}

            <div className="row-actions">
              <button type="button" className="btn btn--coin" onClick={submit} disabled={state === 'saving'}>
                <span className="pad pad--a">A</span>{state === 'saving' ? 'Placing…' : 'Place pre-order'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
