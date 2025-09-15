import React, { useEffect, useMemo, useState, useRef } from 'react';
import api from '../api.js';
import { Link } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    api.get('/api/products', { params: { _ts: Date.now() } })
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  // Ensure autoplay works on browsers that block it
  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play?.();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // ignored if autoplay blocked
        });
      }
    }
  }, []);

  // Collections for sections
  const collections = useMemo(() => ({
    New: products.slice(0, 8),
    'Oversized T-Shirts': products.filter(p => p.collection === 'Oversized T-Shirts').slice(0, 12),
    Hoodies: products.filter(p => p.collection === 'Hoodies').slice(0, 12),
    Accessories: products.filter(p => p.collection === 'Accessories').slice(0, 12),
  }), [products]);

  // Card with hover swap
  const Card = ({ p }) => {
    const list = p.images || p.imageUrls || p.ImageURLs || [];
    const img1 = list[0] || '/images/placeholder-1.jpg';
    const img2 = list[1] || img1;
    return (
      <Link
        to={`/product/${encodeURIComponent(p.sku || p.ProductID || p.productId || p._id)}`}
        className="sk-card"
        aria-label={p.name}
      >
        <div className="sk-img-wrap">
          <img src={img1} alt={p.name} className="sk-img primary" loading="lazy" />
          <img src={img2} alt="" className="sk-img secondary" loading="lazy" />
        </div>
        <div className="sk-meta">
          <div className="sk-name">{p.name}</div>
          <div className="sk-price">₹{p.price}</div>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* HERO with video */}
      <section className="hero-skims">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/hero-mobile.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
          {/* Optional: <source src="/videos/hero.webm" type="video/webm" /> */}
          Your browser does not support the video tag.
        </video>

        <div className="hero-overlay">
          <h1>Effortless Essentials</h1>
          <p>Premium tees & hoodies for every day.</p>
          <div className="hero-actions">
            <Link className="btn-solid" to="/collections/Oversized%20T-Shirts">Shop T-Shirts</Link>
            <Link className="btn-outline" to="/collections/Hoodies">Shop Hoodies</Link>
          </div>
        </div>
      </section>

      {/* NEW (main) */}
      <section className="sk-section">
        <div className="sk-section-head">
          <h2>New</h2>
          <Link to="/collections/New" className="link">View all</Link>
        </div>
        <div className="sk-grid">
          {(collections['New'] || []).map(p => <Card key={(p.sku || p._id)} p={p} />)}
        </div>
      </section>

      {/* Collections */}
      {(['Oversized T-Shirts', 'Hoodies', 'Accessories']).map(title => {
        const items = collections[title] || [];
        return items.length > 0 ? (
          <section className="sk-section" key={title}>
            <div className="sk-section-head">
              <h2>{title}</h2>
              <Link to={`/collections/${encodeURIComponent(title)}`} className="link">View all</Link>
            </div>
            <div className="sk-grid">
              {items.map(p => <Card key={(p.sku || p._id)} p={p} />)}
            </div>
          </section>
        ) : null;
      })}
    </>
  );
}
