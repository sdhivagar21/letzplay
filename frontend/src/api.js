import { createElement, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000' });

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;

/* ------------------------------------------------------------------
   Product helpers (shared by every page)
   ------------------------------------------------------------------ */
export const idOf = (p) => String(p?.sku || p?.ProductID || p?.productId || p?._id || '');
export const collOf = (p) => p?.collection || p?.collectionName || p?.Collection || 'Other';
export const sameColl = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

// Local product photos have a small .webp twin next to each .png (see public/images).
// Paths saved in the database as "images/x.png" (no leading slash) are fixed here too.
export const imgSrc = (src) => {
  if (!src) return '';
  let s = String(src).trim();
  if (/^(https?:)?\/\//.test(s) || s.startsWith('data:')) return s;
  if (!s.startsWith('/')) s = `/${s}`;
  return s.startsWith('/images/') ? s.replace(/\.png$/i, '.webp') : s;
};
// If a .webp twin is missing, fall back to the original file once.
export const imgFallback = (original) => (e) => {
  const el = e.currentTarget;
  if (el.dataset.fellBack) return;
  el.dataset.fellBack = '1';
  let s = String(original || '').trim();
  if (s && !/^(https?:)?\/\//.test(s) && !s.startsWith('/')) s = `/${s}`;
  if (s && el.getAttribute('src') !== s) el.src = s;
};
export const imagesOf = (p) =>
  (p?.images || p?.imageUrls || p?.ImageURLs || []).map((s) => String(s).trim()).filter(Boolean);

export const rupees = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? `₹${v.toLocaleString('en-IN')}` : '';
};

const NEW_DAYS = 45;
export const isNew = (p) =>
  (Array.isArray(p.tags) && p.tags.includes('new')) ||
  (p.releasedAt && Date.now() - new Date(p.releasedAt).getTime() < NEW_DAYS * 864e5);
export const byPriority = (a, b) =>
  Number(b.priority || 0) - Number(a.priority || 0) ||
  new Date(b.releasedAt || b.createdAt || 0) - new Date(a.releasedAt || a.createdAt || 0);

export const COLLECTIONS = ['Oversized T-Shirts', 'Hoodies', 'Accessories'];
const BEST_SELLER_SKUS = [
  'oversized-anime-3', 'hoodie-anime-2', 'oversized-anime-2',
  'oversized-anime-4', 'hoodie-anime-1', 'oversized-anime-1',
];

// One place that decides what a collection page shows.
export const productsIn = (products, name) => {
  const lower = String(name).trim().toLowerCase();
  if (lower === 'all') return [...products].sort(byPriority);
  if (['new', 'new arrivals', 'new arrival'].includes(lower)) {
    const fresh = products.filter(isNew).sort(byPriority);
    // The database has no "new" flag yet, so fall back to the latest items.
    return (fresh.length ? fresh : [...products].reverse()).slice(0, 12);
  }
  if (['best sellers', 'bestsellers', 'best'].includes(lower)) {
    const map = new Map(products.map((p) => [idOf(p), p]));
    const picked = BEST_SELLER_SKUS.map((s) => map.get(s)).filter(Boolean);
    for (const p of products) {
      if (picked.length >= 8) break;
      if (!picked.includes(p)) picked.push(p);
    }
    return picked.slice(0, 8);
  }
  return products.filter((p) => sameColl(collOf(p), name)).sort(byPriority);
};

/* ------------------------------------------------------------------
   Built-in catalogue
   Shown only when the API cannot be reached or returns no products, so
   the shop never renders empty. Names and prices of every item are
   editable right here. Pre-orders still need the API.
   ------------------------------------------------------------------ */
const tee = (sku, name, price, color, pics, description, extra = {}) => ({
  sku, name, price, description,
  collection: 'Oversized T-Shirts',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [color],
  images: pics.map((x) => `/images/${x}.png`),
  stock: 50,
  ...extra,
});
const hoodie = (sku, name, price, color, pics, description, extra = {}) => ({
  ...tee(sku, name, price, color, pics, description, extra),
  collection: 'Hoodies',
  stock: 40,
});

export const FALLBACK_PRODUCTS = [
  tee('oversized-anime-3', 'Purple Shadow Oversized T-Shirt', 849, 'Lilac', ['design11', 'design12'],
    'Lilac oversized tee with a small chest emblem and a full shadow-army back print. Striped sleeves.', { priority: 90 }),
  tee('oversized-anime-2', 'Arise Oversized T-Shirt', 799, 'White', ['oversized2-front', 'oversized2-back'],
    "White oversized tee with a bold 'Arise' silhouette back print and sleeve arrows.", { priority: 80 }),
  tee('oversized-anime-4', 'Wakanda Flames Oversized T-Shirt', 899, 'Black', ['oversized3-front', 'oversized3-back'],
    'Black oversized tee with purple flame hems and a panther mask on the back.', { priority: 70 }),
  tee('oversized-anime-1', 'Anime Walk Oversized T-Shirt', 799, 'White', ['oversized5-front', 'oversized5-back'],
    'White oversized cotton tee with a minimal chest crest and manga-panel eyes across the back.', { priority: 60 }),
  tee('oversized-scout-1', 'Scout Panels Oversized T-Shirt', 899, 'Beige', ['oversized4-front', 'oversized4-back'],
    'Beige boxy tee with a full manga-panel collage on the back and stitched sleeve bands.', { priority: 50 }),
  tee('oversized-blossom-1', 'Bamboo Blossom Oversized T-Shirt', 849, 'Pink', ['oversized21-front', 'oversized21-back'],
    'Pink oversized tee with a round chest badge and a chibi back print.', { tags: ['new'], priority: 100 }),
  tee('oversized-butterfly-1', 'Butterfly Slayer Oversized T-Shirt', 849, 'Navy', ['oversized22-front', 'oversized22-back'],
    'Navy oversized tee with a chest badge and a butterfly-haori back print.', { tags: ['new'], priority: 99 }),
  tee('oversized-merc-1', 'Merc Mask Oversized T-Shirt', 799, 'White', ['oversized23-front', 'oversized23-back'],
    'White oversized tee with a small chest logo and a crossed-swords mask on the back.', { tags: ['new'], priority: 95 }),
  tee('oversized-thunder-1', 'Thunder Breath Oversized T-Shirt', 849, 'Black', ['oversized24-front', 'oversized24-back'],
    'Black oversized tee with a chest badge and a golden swordsman back print.', { tags: ['new'], priority: 98 }),
  tee('oversized-seven-1', 'Number 7 Oversized T-Shirt', 849, 'Black', ['oversized25-front', 'oversized25-back'],
    'Black oversized tee with a small chest mark and a painted number 7 back print.', { tags: ['new'], priority: 94 }),
  tee('oversized-cloud-1', 'Red Cloud Oversized T-Shirt', 849, 'White', ['oversized26-front', 'oversized26-back'],
    'White oversized tee with a red cloud on the chest and an ink-and-crows back print.', { tags: ['new'], priority: 97 }),
  tee('oversized-danger-1', 'The Danger Oversized T-Shirt', 799, 'Black', ['oversized27-front', 'oversized27-back'],
    "Black oversized tee with a small chest mark and a green 'I am the danger' back print.", { tags: ['new'], priority: 93 }),
  tee('oversized-homeland-1', 'Homeland Oversized T-Shirt', 849, 'Navy', ['oversized28-front', 'oversized28-back'],
    'Navy oversized tee with a chest wordmark and a stars-and-stripes poster back print.', { tags: ['new'], priority: 92 }),
  hoodie('hoodie-anime-2', 'Pain Kanji Hoodie', 1599, 'Black', ['hoodie1-front', 'hoodie1-back'],
    "Black hoodie with a 'pain' kanji on the chest and a quote print down the back.", { priority: 85 }),
  hoodie('hoodie-anime-1', 'Spider Emblem Hoodie', 1499, 'Grey', ['hoodie2-front', 'hoodie2-back'],
    'Blue-grey hoodie with a bold spider on the chest and back, and web cracks on the sleeves.', { priority: 75 }),
  hoodie('hoodie-icon-1', 'Pink Icon Hoodie', 1499, 'White', ['hoodie3-front', 'hoodie3-back'],
    'White hoodie with a pink script chest print and a glitter silhouette on the back.', { tags: ['new'], priority: 96 }),
  { ...tee('hat-spider-1', 'Spider Bucket Hat', 499, 'Black', ['HAT1'], 'Black cotton bucket hat with a red embroidered spider.', { priority: 40 }),
    collection: 'Accessories', sizes: ['One size'], stock: 30 },
  { ...tee('hat-fedora-1', 'Classic Fedora', 699, 'Tan', ['HAT2'], 'Tan felt fedora with a black band.', { priority: 30 }),
    collection: 'Accessories', sizes: ['One size'], stock: 30 },
];

/* ------------------------------------------------------------------
   useProducts — loads the catalogue once and shares it across pages.
   The API (Render free tier) can take a while to wake up, so the
   built-in catalogue is shown after a short wait and swapped for the
   live one as soon as it arrives.
   ------------------------------------------------------------------ */
const store = { products: null, live: false, pending: null };
const listeners = new Set();
const publish = () => listeners.forEach((fn) => fn());

const loadProducts = () => {
  if (store.pending) return store.pending;
  const showFallback = () => {
    if (!store.live) { store.products = FALLBACK_PRODUCTS; publish(); }
  };
  const timer = setTimeout(showFallback, 2500);
  store.pending = api
    .get('/api/products', { params: { _ts: Date.now() }, timeout: 60000 })
    .then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length) { store.products = list; store.live = true; publish(); } else showFallback();
    })
    .catch(showFallback)
    .finally(() => { clearTimeout(timer); store.pending = null; });
  return store.pending;
};

export function useProducts() {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    listeners.add(fn);
    if (!store.products || !store.live) loadProducts();
    return () => listeners.delete(fn);
  }, []);
  return { products: store.products || [], loading: !store.products, live: store.live };
}

// Turns an axios error into one plain sentence for the person using the site.
export const errorText = (err, fallback) => {
  if (!err?.response) return 'The shop server is not responding right now. Try again in a minute.';
  return err.response.data?.message || fallback;
};

/* ------------------------------------------------------------------
   Small presentation helpers
   ------------------------------------------------------------------ */
const SWATCHES = {
  black: '#1c1b1a', white: '#ffffff', lilac: '#c9a2e0', purple: '#7a4fb5', pink: '#d680ad',
  navy: '#20255a', grey: '#8e9aa8', gray: '#8e9aa8', beige: '#d9c4a4', tan: '#b88a55',
  red: '#b3261e', blue: '#2f5fb3', green: '#2f7d4f', brown: '#6b4a32', cream: '#efe6d3',
};
// Colour name -> swatch colour (null when the name is not a known colour).
export const swatch = (name) => SWATCHES[String(name || '').trim().toLowerCase()] || null;

// Fades a block in the first time it scrolls into view.
// Without IntersectionObserver (or with reduced motion) content simply shows.
export function Reveal({ as = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return createElement(as, { ref, className: `reveal ${seen ? 'is-in' : ''} ${className}`.trim(), ...rest }, children);
}
