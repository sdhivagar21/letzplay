import React, { useMemo, useState } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ProductCard, { CardSkeletons } from '../components/ProductCard.jsx';
import { useProducts, productsIn, idOf } from '../api.js';

const TABS = [
  { to: '/collections/All', label: 'Everything' },
  { to: '/collections/New', label: 'New' },
  { to: '/collections/Best%20Sellers', label: 'Best sellers' },
  { to: '/collections/Oversized%20T-Shirts', label: 'Oversized tees' },
  { to: '/collections/Hoodies', label: 'Hoodies' },
  { to: '/collections/Accessories', label: 'Accessories' },
];
const TITLES = { all: 'Everything', new: 'New drops', 'best sellers': 'Best sellers', 'oversized t-shirts': 'Oversized tees' };

export default function CollectionPage() {
  const { name } = useParams();
  const decoded = decodeURIComponent(name);
  const { products, loading } = useProducts();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('featured');

  const base = useMemo(() => productsIn(products, decoded), [products, decoded]);

  const filtered = useMemo(() => {
    let items = base;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      items = items.filter((p) =>
        p.name?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        (p.colors || []).some((c) => String(c).toLowerCase().includes(s))
      );
    }
    if (sort === 'price-asc') items = items.slice().sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') items = items.slice().sort((a, b) => b.price - a.price);
    return items;
  }, [base, q, sort]);

  const title = TITLES[decoded.toLowerCase()] || decoded;

  return (
    <main className="page container">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
      <header className="page__head">
        <h1 className="h-display h-1">{title}</h1>
        {!loading && <p className="page__count">{filtered.length} {filtered.length === 1 ? 'style' : 'styles'}</p>}
      </header>

      <nav className="tabs" aria-label="Collections">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `tab ${isActive ? 'is-active' : ''}`}>{t.label}</NavLink>
        ))}
      </nav>

      <div className="filters">
        <label className="filters__search">
          <span className="sr-only">Search this collection</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input className="input" type="search" placeholder="Search by name or colour" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="filters__sort">
          <span>Sort</span>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
        </label>
      </div>

      <div className="grid">
        {loading ? <CardSkeletons count={8} /> : filtered.map((p, i) => <ProductCard key={idOf(p)} product={p} eager={i < 4} />)}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="empty">
          {q.trim() ? (
            <>
              <h2 className="h-display h-3">No match for “{q.trim()}”</h2>
              <p className="muted">Try a shorter word, or a colour like black or white.</p>
              <button type="button" className="btn btn--line-dark" onClick={() => setQ('')}>Clear search</button>
            </>
          ) : (
            <>
              <h2 className="h-display h-3">Nothing in {title} yet</h2>
              <p className="muted">This collection has no products right now.</p>
              <Link className="btn btn--coin" to="/collections/All">Browse everything</Link>
            </>
          )}
        </div>
      )}
    </main>
  );
}
