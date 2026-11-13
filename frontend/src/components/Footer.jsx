// frontend/src/components/Footer.jsx
import React from 'react';
import { CONTACT, hasContact } from '../data/site.js';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer site-footer--dark" id="contact">
      <p className="footer__mega" aria-hidden="true">LET’Z PLAY</p>
      <div className="footer__bar">
        <span>© {year} LET’Z PLAY</span>
        {hasContact && (
          <span className="footer__links">
            {CONTACT.instagram && <a href={CONTACT.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {CONTACT.whatsapp && <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
            {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>Email</a>}
          </span>
        )}
      </div>
    </footer>
  );
}
