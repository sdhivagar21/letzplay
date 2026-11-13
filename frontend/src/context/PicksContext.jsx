import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DESIGNS } from '../data/railProducts.js';

// The visitor's picks: one size per design, e.g. { doom: 'L', 'virat-18': 'M' }.
// Kept for the browser tab so a refresh does not lose them.
const KEY = 'lp-picks';
const PicksCtx = createContext(null);
export const usePicks = () => useContext(PicksCtx);

const read = () => {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) || '{}');
    const out = {};
    for (const d of DESIGNS) if (d.sizes.includes(raw[d.sku])) out[d.sku] = raw[d.sku];
    return out;
  } catch { return {}; }
};

export function PicksProvider({ children }) {
  const [picks, setPicks] = useState(read);

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(picks)); } catch { /* private mode: picks last until refresh */ }
  }, [picks]);

  const pick = useCallback((sku, size) => setPicks((p) => ({ ...p, [sku]: size })), []);
  const unpick = useCallback((sku) => setPicks((p) => { const n = { ...p }; delete n[sku]; return n; }), []);
  const clear = useCallback(() => setPicks({}), []);

  const value = useMemo(() => {
    const list = DESIGNS.filter((d) => picks[d.sku]).map((d) => ({ design: d, size: picks[d.sku] }));
    return { picks, list, count: list.length, pick, unpick, clear };
  }, [picks, pick, unpick, clear]);

  return <PicksCtx.Provider value={value}>{children}</PicksCtx.Provider>;
}

// Smooth scroll to a section by id (instant when motion is reduced).
export const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
};
