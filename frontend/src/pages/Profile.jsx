import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user) {
    return (
      <main className="page page--narrow empty">
        <h1 className="h-display h-2">Sign in to see your profile</h1>
        <Link className="btn btn--coin" to="/login?next=%2Fprofile"><span className="pad pad--a">A</span>Sign in</Link>
      </main>
    );
  }

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <main className="page page--mid container">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My profile' }]} />
      <header className="page__head"><h1 className="h-display h-1">My profile</h1></header>

      <div className="player">
        <div className="player__avatar" aria-hidden="true">{initial}</div>
        <dl className="player__rows">
          <div><dt>Name</dt><dd>{user.name || 'Not set'}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Account type</dt><dd><span className="badge badge--neutral">{user.role}</span></dd></div>
        </dl>
      </div>

      <div className="row-actions">
        <Link className="btn btn--coin" to="/cart">My pre-orders</Link>
        {user.role === 'admin' && <Link className="btn btn--line-dark" to="/admin">Admin dashboard</Link>}
        <button type="button" className="btn btn--ghost" onClick={() => { logout(); nav('/'); }}>Log out</button>
      </div>
    </main>
  );
}
