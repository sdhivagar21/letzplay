import React, { useEffect, useMemo, useState, useRef } from 'react';
import api from '../api.js';
import { Link } from 'react-router-dom';

// Helpers for "New" & ordering
const NEW_DAYS = 45;
const isNew = (p) =>
  (Array.isArray(p.tags) && p.tags.includes('new')) ||
  (p.releasedAt && (Date.now() - new Date(p.releasedAt).getTime()) < NEW_DAYS * 864e5);

const byPriority = (a, b) =>
  (Number(b.priority || 0) - Number(a.priority || 0)) ||
  (new Date(b.releasedAt || b.createdAt || 0) - new Date(a.releasedAt || a.createdAt || 0));

export default function Home() {
  const [products, setProducts] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    api.get('/api/products', { params: { _ts: Date.now() } })
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      const p = videoRef.current.play?.();
      if (p && typeof p.then === 'function') p.catch(() => {});
    }
  }, []);

  const collections = useMemo(() => {
    const newItems = [...products].filter(isNew).sort(byPriority).slice(0, 12);
    const pick = (name) =>
      products.filter((p) => p.collection === name).sort(byPriority).slice(0, 12);
    return {
      New: newItems,
      'Oversized T-Shirts': pick('Oversized T-Shirts'),
      Hoodies: pick('Hoodies'),
      Accessories: pick('Accessories'),
    };
  }, [products]);

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

      {/* New */}
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
