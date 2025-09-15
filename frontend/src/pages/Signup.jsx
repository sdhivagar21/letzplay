import React, { useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/signup', { name, email, password });
      login(data.token);
      nav('/');
    } catch {
      alert('Signup failed');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Create Account</h1>
        <form onSubmit={submit} className="form v">
          <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn-solid wide" type="submit">Create</button>
        </form>
        <p className="tiny muted">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
