// frontend/src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src="/images/logo.png" alt="LET'Z PLAY" />
          <p>Premium tees & hoodies with anime-inspired details.</p>
        </div>

        <div className="footer__col">
          <h4>Shop</h4>
          <a href="/collections/New">New</a><br/>
          <a href="/collections/Best%20Sellers">Best Sellers</a><br/>
          <a href="/collections/Oversized%20T-Shirts">T-Shirts</a><br/>
          <a href="/collections/Hoodies">Hoodies</a><br/>
          <a href="/collections/Accessories">Accessories</a>
        </div>


      </div>

      <div className="footer__bar container">
        <div>© {year} LET’Z PLAY</div>
        <div className="footer__legal">
          <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  );
}
