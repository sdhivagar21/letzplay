import React, { useRef, useState } from 'react';
import { usePicks, goTo } from '../context/PicksContext.jsx';
import { imgSrc, imgFallback } from '../api.js';
import { FORM_NAME } from '../data/site.js';

const EMPTY = { name: '', phone: '', email: '', location: '' };

const check = (f, count) => {
  const e = {};
  if (!count) e.picks = 'Pick at least one tee and its size above.';
  if (f.name.trim().length < 2) e.name = 'Enter your name.';
  if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.location.trim().length < 2) e.location = 'Enter your city or area.';
  return e;
};

// The last step: picked tees on one side, four short fields on the other.
// It is sent as a Netlify form, so no account and no server are needed.
export default function InterestForm() {
  const { list, count, unpick, clear } = usePicks();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');   // idle | sending | done | failed
  const [sent, setSent] = useState(null);       // what was submitted, for the thank-you note
  const formRef = useRef(null);

  const set = (k) => (e) => {
    const v = e.target.value;
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = check(f, count);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      if (first === 'picks') goTo('designs');
      else formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    const tees = list.map((p) => `${p.design.name} (size ${p.size})`).join(', ');
    const body = new URLSearchParams({
      'form-name': FORM_NAME,
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      location: f.location.trim(),
      tees,
      'bot-field': e.target.elements['bot-field']?.value || '',
    });
    setState('sending');
    try {
      if (import.meta.env.DEV) await new Promise((r) => setTimeout(r, 500));   // no Netlify on the dev server
      else {
        const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
        if (!res.ok) throw new Error(String(res.status));
      }
      setSent({ name: f.name.trim().split(/\s+/)[0], tees: list });
      setState('done');
      setF(EMPTY);
      clear();
    } catch {
      setState('failed');
    }
  };

  if (state === 'done' && sent) {
    return (
      <section className="lead lead--done" id="preorder" aria-live="polite">
        <div className="lead__thanks">
          <h2 className="lead__title">Thanks, <span>{sent.name}</span></h2>
          <p>We’ll contact you when the drop is ready.</p>
          <ul className="lead__sent">
            {sent.tees.map((p) => <li key={p.design.sku}>{p.design.name}<span>Size {p.size}</span></li>)}
          </ul>
          <button type="button" className="rail-pill" onClick={() => { setState('idle'); setSent(null); goTo('designs'); }}>Pick more</button>
        </div>
      </section>
    );
  }

  const field = (name, label, props) => (
    <label className={`lead__field ${errors[name] ? 'has-error' : ''}`}>
      <span>{label}</span>
      <input className="input" name={name} value={f[name]} onChange={set(name)} aria-invalid={!!errors[name]}
             aria-describedby={errors[name] ? `lead-${name}-err` : undefined} {...props} />
      {errors[name] && <em id={`lead-${name}-err`} role="alert">{errors[name]}</em>}
    </label>
  );

  return (
    <section className="lead" id="preorder">
      <div className="lead__picks">
        <h2 className="lead__title">Make it <span>yours</span></h2>
        {count ? (
          <ul className="lead__list">
            {list.map(({ design, size }) => (
              <li key={design.sku}>
                <img src={imgSrc(design.images[1])} onError={imgFallback(design.images[1])} alt="" width="64" height="64" loading="lazy" />
                <span className="lead__item"><b>{design.name}</b><span>Size {size}</span></span>
                <button type="button" className="lead__remove" onClick={() => unpick(design.sku)} aria-label={`Remove ${design.name}`}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`lead__empty ${errors.picks ? 'has-error' : ''}`} role={errors.picks ? 'alert' : undefined}>
            <button type="button" className="rail-pill" onClick={() => goTo('designs')}>{errors.picks ? 'Pick a tee first' : 'Pick your tees'}</button>
          </p>
        )}
      </div>

      <form className="lead__form" ref={formRef} name={FORM_NAME} method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} noValidate>
        <input type="hidden" name="form-name" value={FORM_NAME} />
        <p className="lead__trap" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
        {field('name', 'Name', { type: 'text', autoComplete: 'name', autoCapitalize: 'words', placeholder: 'Your name', enterKeyHint: 'next' })}
        {field('phone', 'Mobile number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '98765 43210', enterKeyHint: 'next' })}
        {field('email', 'Email', { type: 'email', inputMode: 'email', autoComplete: 'email', autoCapitalize: 'off', placeholder: 'you@example.com', enterKeyHint: 'next' })}
        {field('location', 'City', { type: 'text', autoComplete: 'address-level2', autoCapitalize: 'words', placeholder: 'Chennai', enterKeyHint: 'send' })}
        {state === 'failed' && <p className="alert" role="alert">That didn’t go through. Check your connection and try again.</p>}
        <button type="submit" className="rail-pill rail-pill--solid lead__send" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Pre-order'}
        </button>
        <p className="lead__fine">No payment now. We contact you when it’s ready.</p>
      </form>
    </section>
  );
}
