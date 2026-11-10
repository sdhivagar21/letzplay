import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import CollectionPage from './pages/CollectionPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login?next=%2Fadmin" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Start every page at the top.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const NotFound = () => (
  <main className="page page--narrow empty">
    <p className="empty__code">404</p>
    <h1 className="h-display h-2">Game over. This page doesn’t exist.</h1>
    <p className="muted">The link may be old, or the print may have been retired.</p>
    <div className="row-actions">
      <Link className="btn btn--coin" to="/"><span className="pad pad--a">A</span>Back to home</Link>
      <Link className="btn btn--ghost" to="/collections/All">Browse everything</Link>
    </div>
  </main>
);

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <div id="main" className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/:name" element={<CollectionPage />} />
          <Route path="/product/:sku" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </AuthProvider>
  );
}
