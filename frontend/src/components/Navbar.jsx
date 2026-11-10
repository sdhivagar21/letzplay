import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/collections/New', label: 'New' },
  { to: '/collections/Best%20Sellers', label: 'Best Sellers' },
  { to: '/collections/Oversized%20T-Shirts', label: 'Oversized Tees' },
  { to: '/collections/Hoodies', label: 'Hoodies' },
  { to: '/collections/Accessories', label: 'Accessories' },
];

const Icon = ({ d, children }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // On the home page the header sits over the hero until the page is scrolled.
  const overHero = pathname === '/' && !scrolled && !open;

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const search = (e) => {
    e.preventDefault();
    const term = q.trim();
    nav(term ? `/collections/All?q=${encodeURIComponent(term)}` : '/collections/All');
    setQ('');
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    nav('/');
    setOpen(false);
  };

  return (
    <>
      <p className="topbar">Pre-orders are open on every style</p>
      <header className={`nav ${open ? 'is-open' : ''} ${overHero ? 'nav--over' : ''} ${pathname === '/' ? 'nav--home' : ''}`}>
        <div className="nav__bar">
          <Link to="/" className="nav__logo" aria-label="LET'Z PLAY home">
            <img src="/images/logo.webp" alt="" width="36" height="36"
                 onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/images/logo.png'; } }} />
            <span className="nav__word">LET’Z PLAY</span>
          </Link>

          <nav className="nav__links" aria-label="Shop">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="nav__actions">
            <form className="nav__search" role="search" onSubmit={search}>
              <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></Icon>
              <input type="search" placeholder="Search" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
            {user?.role === 'admin' && <Link className="nav__text" to="/admin">Admin</Link>}
            <Link className="nav__icon" to={user ? '/profile' : '/login'} aria-label={user ? 'My profile' : 'Sign in'}>
              <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4 4.2-6 8-6s6.800 2 8 6" /></Icon>
            </Link>
            <Link className="nav__icon" to="/cart" aria-label="My pre-orders">
              <Icon><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /></Icon>
            </Link>
            <button type="button" className="nav__burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              <span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="nav__drawer" hidden={!open}>
          <form className="nav__search nav__search--drawer" role="search" onSubmit={search}>
            <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></Icon>
            <input type="search" placeholder="Search" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav__drawer-link">{l.label}</NavLink>
          ))}
          <div className="nav__drawer-foot">
            {!user ? (
              <>
                <Link className="btn btn--solid" to="/login">Sign in</Link>
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
      </header>
    </>
  );
}
