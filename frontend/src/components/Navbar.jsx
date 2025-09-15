import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    nav('/');
    setOpen(false);
  };

  return (
    <header className={`nav ${open ? 'open' : ''}`}>
      <div className="nav__bar container">
        <Link to="/" className="nav__logo" aria-label="LET'Z PLAY" onClick={() => setOpen(false)}>
          {/* Falls back to text if image is missing */}
          <img src="/images/logo.png" alt="LET'Z PLAY" onError={(e)=>{e.currentTarget.outerHTML="<strong>LET'Z PLAY</strong>";}} />
        </Link>

        <nav className="nav__links" aria-label="Primary">
          <NavLink to="/collections/New"            className={({isActive}) => `nav__link ${isActive ? 'is-active' : ''}`}>New</NavLink>
          <NavLink to="/collections/Best%20Sellers" className={({isActive}) => `nav__link ${isActive ? 'is-active' : ''}`}>Best Sellers</NavLink>
          <NavLink to="/collections/Oversized%20T-Shirts" className={({isActive}) => `nav__link ${isActive ? 'is-active' : ''}`}>Oversized T-Shirts</NavLink>
          <NavLink to="/collections/Hoodies"        className={({isActive}) => `nav__link ${isActive ? 'is-active' : ''}`}>Hoodies</NavLink>
          <NavLink to="/collections/Accessories"    className={({isActive}) => `nav__link ${isActive ? 'is-active' : ''}`}>Accessories</NavLink>
        </nav>

        <div className="nav__actions">
          {!user ? (
            <>
              <Link className="btn-link" to="/login">Sign In</Link>
              <Link className="btn-link" to="/signup">Sign Up</Link>
            </>
          ) : (
            <>
              <Link className="btn-link" to="/profile">My Profile</Link>
              {user.role === 'admin' && <Link className="btn-link" to="/admin">Admin</Link>}
              <button className="btn-link" onClick={handleLogout}>Log Out</button>
            </>
          )}
          <Link className="nav__cart" to="/cart" aria-label="Cart" onClick={() => setOpen(false)}>🛒</Link>

          {/* Burger toggles state, not a checkbox sibling */}
          <button
            type="button"
            className="nav__burger"
            aria-label="Menu"
            onClick={() => setOpen(v => !v)}
          />
        </div>
      </div>

      {/* Mobile drawer */}
      <div className="nav__drawer container">
        <NavLink to="/collections/New"                 className="nav__drawer-link" onClick={()=>setOpen(false)}>New</NavLink>
        <NavLink to="/collections/Best%20Sellers"      className="nav__drawer-link" onClick={()=>setOpen(false)}>Best Sellers</NavLink>
        <NavLink to="/collections/Oversized%20T-Shirts"className="nav__drawer-link" onClick={()=>setOpen(false)}>Oversized T-Shirts</NavLink>
        <NavLink to="/collections/Hoodies"             className="nav__drawer-link" onClick={()=>setOpen(false)}>Hoodies</NavLink>
        <NavLink to="/collections/Accessories"         className="nav__drawer-link" onClick={()=>setOpen(false)}>Accessories</NavLink>
      </div>
    </header>
  );
}
