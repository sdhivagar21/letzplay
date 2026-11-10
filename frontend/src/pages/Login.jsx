import React, { useState } from 'react';
import api, { errorText } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

// Only allow redirects back into this site.
const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/');

export default function Login() {
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
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/login', { email: email.trim(), password }, { timeout: 30000 });
      login(data.token);
      nav(next, { replace: true });
    } catch (err) {
      setError(err?.response?.status === 401 ? 'That email and password don’t match.' : errorText(err, 'Sign-in failed. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__art" aria-hidden="true">
        <img src="/images/oversized26-back.webp" alt="" width="800" height="1200" />
      </div>
      <div className="auth__panel">
        <h1 className="h-display h-2">Sign in</h1>
        <p className="muted">Sign in to place and track pre-orders.</p>
        <form onSubmit={submit} className="form">
          <label className="field">Email
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">Password
            <span className="input-wrap">
              <input className="input" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="input-wrap__btn" onClick={() => setShow((v) => !v)}>{show ? 'Hide' : 'Show'}</button>
            </span>
          </label>
          {error && <p className="alert" role="alert">{error}</p>}
          <button className="btn btn--solid btn--lg btn--block" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth__switch">New here? <Link to={`/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link></p>
      </div>
    </main>
  );
}
