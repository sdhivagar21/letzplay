import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/collections/New', label: 'New' },
  { to: '/collections/Best%20Sellers', label: 'Best sellers' },
  { to: '/collections/Oversized%20T-Shirts', label: 'Oversized tees' },
  { to: '/collections/Hoodies', label: 'Hoodies' },
  { to: '/collections/Accessories', label: 'Accessories' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the menu on navigation and lock page scroll while it is open.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = () => {
    logout();
    nav('/');
    setOpen(false);
  };

  const firstName = (user?.name || '').trim().split(' ')[0];

  return (
    <header className={`nav ${open ? 'is-open' : ''}`}>
      <div className="nav__bar container">
        <Link to="/" className="nav__logo" aria-label="LET'Z PLAY home">
          <img src="/images/logo.webp" alt="" width="44" height="44"
               onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/images/logo.png'; } }} />
          <span className="nav__word">LET’Z PLAY</span>
        </Link>

        <nav className="nav__links" aria-label="Shop">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          {!user ? (
            <Link className="nav__text nav__desk" to="/login">Sign in</Link>
          ) : (
            <>
              {user.role === 'admin' && <Link className="nav__text nav__desk" to="/admin">Admin</Link>}
              <Link className="nav__text nav__desk" to="/profile">{firstName ? `Hi, ${firstName}` : 'Profile'}</Link>
            </>
          )}
          <Link className="nav__pill" to="/cart">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>Pre-orders</span>
          </Link>
          <button type="button" className="nav__burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="nav__drawer" hidden={!open}>
        <div className="container">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav__drawer-link">{l.label}</NavLink>
          ))}
          <div className="nav__drawer-foot">
            {!user ? (
              <>
                <Link className="btn btn--coin" to="/login">Sign in</Link>
                <Link className="btn btn--line" to="/signup">Create account</Link>
              </>
            ) : (
              <>
                <Link className="btn btn--line" to="/profile">My profile</Link>
                {user.role === 'admin' && <Link className="btn btn--line" to="/admin">Admin</Link>}
                <button type="button" className="btn btn--line" onClick={handleLogout}>Log out</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
