import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PreorderModal from './PreorderModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { imgSrc, imgFallback, rupees } from '../api.js';
import { RAIL_ITEMS } from '../data/railProducts.js';

const STRIP = ['New drops weekly', 'Pre-order your size', 'Anime oversized tees'];
const SCROLL_QUERY = '(hover: none), (max-width: 820px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const pad2 = (n) => String(n).padStart(2, '0');

// Follows a media query.
const useMedia = (query) => {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const fn = () => setOn(mq.matches);
    fn();
    mq.addEventListener?.('change', fn);
    return () => mq.removeEventListener?.('change', fn);
  }, [query]);
  return on;
};

// Gradients shared by every hanger and the rail (drawn once).
const RailDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="lp-wood" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="84">
        <stop offset="0" stopColor="#d9b07a" /><stop offset=".55" stopColor="#b98a52" /><stop offset="1" stopColor="#8f6536" />
      </linearGradient>
      <linearGradient id="lp-steel" gradientUnits="userSpaceOnUse" x1="86" y1="0" x2="114" y2="0">
        <stop offset="0" stopColor="#8d9299" /><stop offset=".5" stopColor="#eef0f2" /><stop offset="1" stopColor="#7c8188" />
      </linearGradient>
    </defs>
  </svg>
);

const Hanger = () => (
  <svg className="hanger" viewBox="0 0 200 90" aria-hidden="true" focusable="false">
    <path d="M100 42V27a11 11 0 1 0-11-11" fill="none" stroke="url(#lp-steel)" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M100 42 190 78H10Z" fill="none" stroke="url(#lp-wood)" strokeWidth="9" strokeLinejoin="round" />
  </svg>
);

const TeeImg = ({ src, className, eager = false }) => (
  <img className={className} src={imgSrc(src)} onError={imgFallback(src)} alt="" draggable="false"
       loading={eager ? 'eager' : 'lazy'} decoding="async" width="760" height="950" />
);

/* ------------------------------------------------------------------
   Detail view: the clicked tee flies off the rail to the centre of the
   screen (FLIP), with name, price, sizes and the pre-order button.
   ------------------------------------------------------------------ */
function RailDetail({ items, index, setIndex, railRect, reduced, onClosed }) {
  const [shown, setShown] = useState(false);
  const [dir, setDir] = useState(0);
  const [size, setSize] = useState('');
  const [needSize, setNeedSize] = useState(false);
  const [showPre, setShowPre] = useState(false);
  const boxRef = useRef(null);
  const hangRef = useRef(null);
  const closing = useRef(false);
  const touch = useRef(null);
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const item = items[index];
  const total = items.length;

  // Transform that puts the big tee exactly over its place on the rail.
  const overRail = useCallback(() => {
    const from = railRect(index);
    const el = hangRef.current;
    if (!from || !el || reduced) return '';
    const to = el.getBoundingClientRect();
    if (!to.width) return '';
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
  }, [railRect, index, reduced]);

  // Open: start over the rail, then let go.
  useLayoutEffect(() => {
    const el = hangRef.current;
    const start = overRail();
    if (el && start) {
      el.style.transition = 'none';
      el.style.transform = start;
      el.getBoundingClientRect();
      el.style.transition = '';
      el.style.transform = '';
    }
    setShown(true);
    boxRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close: the same flight in reverse, then unmount.
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const back = overRail();
    if (back && hangRef.current) hangRef.current.style.transform = back;
    setShown(false);
    setTimeout(onClosed, reduced ? 180 : 520);
  }, [overRail, onClosed, reduced]);

  const step = useCallback((d) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  }, [setIndex, total]);

  // The size picker starts empty for every tee.
  useEffect(() => { setSize(''); setNeedSize(false); }, [item.product.sku]);

  useEffect(() => {
    const onKey = (e) => {
      if (showPre) return;                       // the pre-order modal handles its own keys
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {                // keep focus inside the dialog
        const f = boxRef.current?.querySelectorAll('button:not([disabled])');
        if (!f?.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === boxRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close, step, showPre]);

  // Lock page scroll (again after the pre-order modal releases it).
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [showPre]);

  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(t.clientY - s.y) * 1.4) step(dx < 0 ? 1 : -1);
  };

  // Same steps as the product page: size, then sign in, then confirm.
  const preorder = () => {
    if (!size) { setNeedSize(true); return; }
    if (!user) { nav(`/login?next=${encodeURIComponent(loc.pathname)}`); return; }
    setShowPre(true);
  };

  return (
    <div className={`rdv ${shown ? 'is-shown' : ''}`} role="dialog" aria-modal="true" aria-label={`${item.name}, ${item.view.toLowerCase()} view`}
         tabIndex={-1} ref={boxRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="rdv__veil" onClick={close} />
      <button type="button" className="rdv__close" onClick={close}>Close</button>

      <div className="rdv__body">
        <div className="rdv__meta">
          <p className="rdv__count" aria-live="polite">{pad2(index + 1)} / {pad2(total)}</p>
          <h3 className="rdv__name">{item.name}</h3>
          <p className="rdv__view">{item.view} print · Oversized tee</p>
          <p className="rdv__price">{rupees(item.price)}</p>
        </div>

        <div className="rdv__stage">
          <button type="button" className="rdv__arrow" aria-label="Previous tee" onClick={() => step(-1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14.5 5 8 12l6.500 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="rdv__hang" ref={hangRef}>
            <div className={`rdv__swap ${dir > 0 ? 'from-right' : dir < 0 ? 'from-left' : ''}`} key={item.id}>
              <Hanger />
              <TeeImg className="hang__tee" src={item.front} eager />
            </div>
          </div>
          <button type="button" className="rdv__arrow" aria-label="Next tee" onClick={() => step(1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9.500 5 16 12l-6.500 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        <div className="rdv__buy">
          <fieldset className={`rdv__sizes ${needSize && !size ? 'is-missing' : ''}`}>
            <legend>Size{size ? `: ${size}` : ''}</legend>
            <div className="rdv__size-row">
              {item.sizes.map((s) => (
                <button key={s} type="button" className={`rdv__size ${s === size ? 'is-active' : ''}`} aria-pressed={s === size}
                        onClick={() => { setSize(s); setNeedSize(false); }}>{s}</button>
              ))}
            </div>
            {needSize && !size && <p className="rdv__error" role="alert">Choose a size to continue.</p>}
          </fieldset>
          <button type="button" className="rail-pill rail-pill--solid" onClick={preorder}>Pre-order</button>
          <p className="rdv__note">{user ? 'No payment is taken now.' : 'You’ll be asked to sign in first. No payment is taken now.'}</p>
        </div>
      </div>

      {showPre && (
        <PreorderModal product={item.product} initial={{ size, qty: 1 }} onClose={() => setShowPre(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   The rail itself.
   Desktop: tees hang side-on and turn to face you on hover.
   Phones:  the rail swipes sideways and the centre tee faces you.
   ------------------------------------------------------------------ */
export default function ClothingRail({ items = RAIL_ITEMS }) {
  const scrollMode = useMedia(SCROLL_QUERY);
  const reduced = useMedia(REDUCED_QUERY);
  const [picked, setActive] = useState(null);
  // Desktop: with no mouse on the rail, the middle tee faces the front so the
  // section looks finished before anyone touches it.
  const rest = Math.floor((items.length - 1) / 2);
  const active = picked ?? (scrollMode ? null : rest);
  const [detail, setDetail] = useState(null);   // index of the open tee, or null
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const frame = useRef(0);

  const slotWidth = () => itemRefs.current[0]?.parentElement?.getBoundingClientRect().width || 1;
  const centreOn = useCallback((i, smooth) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * slotWidth(), behavior: smooth && !reduced ? 'smooth' : 'auto' });
  }, [reduced]);

  // Swipe mode: start a couple of tees in so both sides of the rail are full.
  useLayoutEffect(() => {
    if (!scrollMode) { setActive(null); return; }
    const start = Math.min(2, items.length - 1);
    centreOn(start, false);
    setActive(start);
  }, [scrollMode, items.length, centreOn]);

  // Swipe mode: whichever tee sits in the centre faces the front.
  const onScroll = () => {
    if (!scrollMode || frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / slotWidth())));
      setActive(i);
    });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Hover mode: the rail is split into one fixed zone per hanger, so moving
  // the mouse along it turns the tees one by one (the zones never move,
  // even while the tees slide apart).
  const onPointerMove = (e) => {
    if (scrollMode || e.pointerType !== 'mouse') return;
    const first = itemRefs.current[0]?.parentElement?.getBoundingClientRect();
    const tee = itemRefs.current[0]?.offsetWidth || 0;
    if (!first?.width) return;
    const reach = (tee - first.width) / 2;          // an end tee facing front sticks out this far
    const x = e.clientX - first.left;
    const inside = x >= -reach && x <= first.width * items.length + reach && e.clientY >= first.top && e.clientY <= first.bottom;
    setActive(inside ? Math.max(0, Math.min(items.length - 1, Math.floor(x / first.width))) : null);
  };
  const onPointerLeave = (e) => { if (!scrollMode && e.pointerType === 'mouse') setActive(null); };

  const railRect = useCallback((i) => itemRefs.current[i]?.getBoundingClientRect() || null, []);

  const detailRef = useRef(null);
  const showDetail = (i) => { detailRef.current = i; setDetail(i); };

  const open = (i) => { setActive(i); showDetail(i); };
  const onPick = (i) => {
    if (scrollMode && i !== active) { centreOn(i, true); return; }
    open(i);
  };

  // While the detail view moves between tees, the rail follows underneath
  // so the tee always flies back to its own hanger.
  const setDetailIndex = useCallback((next) => {
    const i = typeof next === 'function' ? next(detailRef.current) : next;
    if (scrollMode) centreOn(i, false);
    setActive(i);
    showDetail(i);
  }, [scrollMode, centreOn]);

  const onClosed = useCallback(() => {
    const el = itemRefs.current[detailRef.current];
    showDetail(null);
    el?.focus({ preventScroll: true });
    // back on the rail: stay facing front only if the mouse is still on it
    if (!scrollMode && el && !el.matches(':hover') && !el.matches(':focus-visible')) setActive(null);
  }, [scrollMode]);

  const shown = active != null ? items[active] : null;
  const isOpen = detail != null;

  return (
    <section className={`rail ${scrollMode ? 'rail--swipe' : 'rail--hover'} ${isOpen ? 'is-open' : ''}`} aria-label="This week’s drop on the rail">
      <RailDefs />
      <div className="rail__inner" aria-hidden={isOpen || undefined}>
        <div className="rail__top">
          <a href="#about">About</a>
          <span className="rail__logo">
            <img src="/images/logo.webp" alt="" width="34" height="34" loading="lazy"
                 onError={(e) => { if (!e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = '/images/logo.png'; } }} />
            <span>LET’Z PLAY</span>
          </span>
          <a href="#contact">Contact</a>
        </div>
        <h2 className="sr-only">This week’s drop</h2>

        <div className="rail__stage">
          <div className="rail__bar" aria-hidden="true" />
          <ul className="rail__track" ref={trackRef} onScroll={onScroll} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
            {items.map((it, i) => {
              const side = active == null ? 0 : Math.sign(i - active);
              const on = i === active;
              return (
                <li className={`rail__slot ${on ? 'is-active' : ''}`} key={it.id} style={{ '--dir': side }}>
                  <button type="button" ref={(el) => { itemRefs.current[i] = el; }}
                          className={`rail__item ${it.side ? 'has-side' : ''} ${detail === i ? 'is-lifted' : ''}`}
                          aria-label={`${it.name}, ${it.view.toLowerCase()} view, ${rupees(it.price)}. Open details`}
                          tabIndex={isOpen ? -1 : 0}
                          onClick={() => onPick(i)}
                          onFocus={(e) => { if (!scrollMode && e.currentTarget.matches(':focus-visible')) setActive(i); }}
                          onBlur={() => { if (!scrollMode) setActive((a) => (a === i ? null : a)); }}>
                    <span className="hang">
                      <Hanger />
                      <TeeImg className="hang__tee" src={it.front} />
                    </span>
                    {it.side && <TeeImg className="hang__side" src={it.side} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="rail__caption" aria-hidden="true">
          {shown
            ? <span key={shown.id}>{shown.name} <i>{shown.view}</i> <b>{rupees(shown.price)}</b></span>
            : <span key="hint" className="rail__hint">Hover a tee to turn it round</span>}
        </p>

        <div className="rail__cta">
          <button type="button" className="rail-pill" tabIndex={isOpen ? -1 : 0} onClick={() => open(active ?? 0)}>Pre-order now</button>
        </div>
      </div>

      <div className="rail__strip" aria-hidden="true">
        <div className="rail__strip-track">
          {[0, 1].map((k) => (
            <div className="rail__strip-set" key={k}>
              {[...STRIP, ...STRIP].map((t, n) => <span key={n}>{t} •</span>)}
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <RailDetail items={items} index={detail} setIndex={setDetailIndex} railRect={railRect} reduced={reduced} onClosed={onClosed} />
      )}
    </section>
  );
}
