import React, { useState } from 'react';
import api, { errorText } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/');

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Use a password with at least 6 characters.'); return; }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/signup', { name: name.trim(), email: email.trim(), password }, { timeout: 30000 });
      login(data.token);
      nav(next, { replace: true });
    } catch (err) {
      setError(
        err?.code === 'ECONNABORTED' || err?.response?.status === 409
          ? 'That email may already have an account. Try signing in.'
          : errorText(err, 'The account could not be created. Try again.')
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__art" aria-hidden="true">
        <img src="/images/oversized24-back.webp" alt="" width="800" height="1200" />
      </div>
      <div className="auth__panel">
        <h1 className="h-display h-2">Create account</h1>
        <p className="muted">An account saves your pre-orders and shows their status.</p>
        <form onSubmit={submit} className="form">
          <label className="field">Name
            <input className="input" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">Email
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">Password
            <span className="input-wrap">
              <input className="input" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="input-wrap__btn" onClick={() => setShow((v) => !v)}>{show ? 'Hide' : 'Show'}</button>
            </span>
            <span className="field__hint">At least 6 characters</span>
          </label>
          {error && <p className="alert" role="alert">{error}</p>}
          <button className="btn btn--solid btn--lg btn--block" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="auth__switch">Already have an account? <Link to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign in</Link></p>
      </div>
    </main>
  );
}
