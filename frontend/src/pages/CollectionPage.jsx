import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';

const imgs = (p) => p.images || p.imageUrls || p.ImageURLs || [];
const coll = (p) => p.collection || p.collectionName || p.Collection || 'Other';
const keyId = (p) => p.sku || p.ProductID || p.productId || p._id;

// Optional curated list for Best Sellers (fallbacks handled below)
const BEST_SELLER_SKUS = [
  'oversized-anime-1',
  'oversized-anime-2',
  'oversized-anime-3',
  'oversized-anime-4',
  'hoodie-anime-1',
  'hoodie-anime-2',
];

export default function CollectionPage() {
  const { name } = useParams();
  const decoded = decodeURIComponent(name);
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    api.get('/api/products', { params: { _ts: Date.now() } })
      .then(res => setProducts(res.data || []))
      .catch(console.error);
    window.scrollTo(0, 0);
  }, [decoded]);

  const filtered = useMemo(() => {
    let items = [];

    const tees = products.filter(p => coll(p) === 'Oversized T-Shirts');
    const hood = products.filter(p => coll(p) === 'Hoodies');

    // Fillers helper to ensure we don't leave page empty
    const fillUpTo = (list, target = 12) => {
      const out = [...list];
      if (out.length < target) {
        const pool = [...tees, ...hood, ...products];
        for (const p of pool) {
          if (out.length >= target) break;
          if (!out.includes(p)) out.push(p);
        }
      }
      return out.slice(0, target);
    };

    const lower = decoded.toLowerCase();

    if (lower === 'new' || lower === 'new arrivals' || lower === 'new arrival') {
      // Mix of tees + hoodies; if DB has no createdAt we just take first few
      items = fillUpTo([...tees.slice(0, 6), ...hood.slice(0, 6)], 12);
    } else if (lower === 'best sellers' || lower === 'bestsellers' || lower === 'best' || lower === 'best arrival' || lower === 'best arrivals') {
      // Prefer curated SKUs; if missing, backfill with tees/hoodies
      const idOf = (p) => String(p.sku || p.ProductID || p.productId || p._id || '');
      const map = new Map(products.map(p => [idOf(p), p]));
      const curated = BEST_SELLER_SKUS.map(s => map.get(String(s))).filter(Boolean);
      items = fillUpTo(curated, 12);
    } else {
      // Normal collection
      items = products.filter(p => coll(p) === decoded);
    }

    // Search filter
    if (q.trim()) {
      const s = q.toLowerCase();
      items = items.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s)
      );
    }

    // Sort
    if (sort === 'price-asc') items = items.slice().sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') items = items.slice().sort((a, b) => b.price - a.price);

    return items;
  }, [products, decoded, q, sort]);

  const Card = ({ p }) => {
    const list = imgs(p);
    const img1 = list[0] || '/images/placeholder-1.jpg';
    const img2 = list[1] || img1;
    return (
      <Link to={`/product/${encodeURIComponent(keyId(p))}`} className="sk-card">
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
    <div className="page-wrap">
      <div className="page-head">
        <h1>{decoded}</h1>
        <nav className="crumbs"><Link to="/">Home</Link> <span>›</span> <span>{decoded}</span></nav>
      </div>

      <div className="filters-bar">
        <input className="input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
        <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low → high</option>
          <option value="price-desc">Price: high → low</option>
        </select>
      </div>

      <div className="sk-grid">
        {filtered.map(p => <Card key={keyId(p)} p={p} />)}
      </div>

      {filtered.length === 0 && (
        <p className="muted" style={{ padding: '12px' }}>
          No products found.
        </p>
      )}
    </div>
  );
}
