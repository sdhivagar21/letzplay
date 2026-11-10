// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  const { user } = useAuth();
  return (
    <footer className="site-footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src="/images/logo.webp" alt="LET'Z PLAY" width="120" height="120" loading="lazy" />
          <p>Oversized tees and hoodies with anime and pop-culture back prints.</p>
        </div>

        <div className="footer__col">
          <h2>Shop</h2>
          <Link to="/collections/New">New</Link>
          <Link to="/collections/Best%20Sellers">Best sellers</Link>
          <Link to="/collections/Oversized%20T-Shirts">Oversized tees</Link>
          <Link to="/collections/Hoodies">Hoodies</Link>
          <Link to="/collections/Accessories">Accessories</Link>
        </div>

        <div className="footer__col">
          <h2>Account</h2>
          {user ? <Link to="/profile">My profile</Link> : <Link to="/login">Sign in</Link>}
          {!user && <Link to="/signup">Create account</Link>}
          <Link to="/cart">My pre-orders</Link>
        </div>
      </div>

      <p className="footer__mega" aria-hidden="true">LET’Z PLAY</p>

      <div className="footer__bar container">
        <span>© {year} LET’Z PLAY</span>
        <span>Pre-order only. No payment is taken on this site.</span>
      </div>
    </footer>
  );
}
