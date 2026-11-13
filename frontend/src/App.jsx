import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { PicksProvider } from './context/PicksContext.jsx';

// Start every page at the top.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Tells the visitor counter about this visit: once per browser per day,
// and never from the admin page or the local dev server.
const CountVisit = () => {
  useEffect(() => {
    if (import.meta.env.DEV || window.location.pathname.startsWith('/admin')) return;
    const day = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem('lp-visit') === day) return;
      localStorage.setItem('lp-visit', day);
    } catch { /* storage blocked: count the visit anyway */ }
    fetch('/.netlify/functions/visit', { method: 'POST', keepalive: true }).catch(() => {});
  }, []);
  return null;
};

// The site is one page. Old links (collections, products, sign in, cart)
// land on the home page.
export default function App() {
  return (
    <PicksProvider>
      <ScrollToTop />
      <CountVisit />
      <a className="skip-link" href="#designs">Skip to the tees</a>
      <div className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </PicksProvider>
  );
}
