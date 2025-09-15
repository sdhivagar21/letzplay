import React, { useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data.token);
      nav('/');
    } catch {
      alert('Login failed');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Sign In</h1>
        <form onSubmit={submit} className="form v">
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn-solid wide" type="submit">Continue</button>
        </form>
        <p className="tiny muted">New here? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}
