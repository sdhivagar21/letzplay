import React, { useEffect, useRef, useState } from 'react';
import ClothingRail from '../components/ClothingRail.jsx';
import InterestForm from '../components/InterestForm.jsx';
import { usePicks, goTo } from '../context/PicksContext.jsx';
import { imgSrc, imgFallback, teeSrcSet } from '../img.js';
import { isLite } from '../perf.js';
import { DESIGNS } from '../data/railProducts.js';

const pad2 = (n) => String(n).padStart(2, '0');
const SHOW_SIZES = '(max-width: 860px) 84vw, 500px';

// True while the element is on (or near) the screen.
const useOnScreen = (ref) => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '120px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
};

// True once the element has scrolled into view (stays true).
const useSeen = (ref, margin = '0px 0px -18% 0px') => {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { rootMargin: margin, threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return seen;
};

// One design, full width: a floating tee that flips front/back in 3D and
// leans towards the mouse, next to its name and a row of sizes.
function Showcase({ design, index, total }) {
  const { picks, pick, unpick } = usePicks();
  const [front, setFront] = useState(false);       // starts on the back, where the artwork is
  const ref = useRef(null);
  const stage = useRef(null);
  const frame = useRef(0);
  const seen = useSeen(ref);
  const live = useOnScreen(ref);
  const picked = picks[design.sku];

  // Lean the tee towards the pointer (mouse only; transform only).
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || frame.current || isLite()) return;
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', `${(((clientX - r.left) / r.width) - 0.5) * 22}deg`);
      el.style.setProperty('--rx', `${(0.5 - ((clientY - r.top) / r.height)) * 14}deg`);
    });
  };
  const onLeave = () => { stage.current?.style.setProperty('--ry', '0deg'); stage.current?.style.setProperty('--rx', '0deg'); };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <article ref={ref} className={`show ${index % 2 ? 'show--alt' : ''} ${seen ? 'is-in' : ''} ${live ? 'is-live' : ''} ${picked ? 'is-picked' : ''}`}
             style={{ '--accent': design.accent, '--n': index }}>
      <div className="show__stage" ref={stage} onPointerMove={onMove} onPointerLeave={onLeave}>
        <span className="show__no" aria-hidden="true">{pad2(index + 1)}</span>
        <span className="show__glow" aria-hidden="true" />
        <div className="show__enter">
          <div className="show__float">
            <div className="show__tilt">
              <button type="button" className={`show__card ${front ? 'is-front' : ''}`} onClick={() => setFront((v) => !v)}
                      aria-label={`${design.name}: showing the ${front ? 'front' : 'back'}. Flip to see the ${front ? 'back' : 'front'}`}>
                <img className="show__face show__face--back" src={imgSrc(design.images[1])} srcSet={teeSrcSet(design.images[1])} sizes={SHOW_SIZES} onError={imgFallback(design.images[1])} alt=""
                     loading="lazy" decoding="async" width="760" height="950" draggable="false" />
                <img className="show__face show__face--front" src={imgSrc(design.images[0])} srcSet={teeSrcSet(design.images[0])} sizes={SHOW_SIZES} onError={imgFallback(design.images[0])} alt=""
                     loading="lazy" decoding="async" width="760" height="950" draggable="false" />
              </button>
            </div>
          </div>
        </div>
        <button type="button" className="show__flip" onClick={() => setFront((v) => !v)} aria-hidden="true" tabIndex={-1}>
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 12a8 8 0 0 1 13.7-5.700L20 8.500M20 4v4.500h-4.500M20 12a8 8 0 0 1-13.700 5.700L4 15.500M4 20v-4.500h4.500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {front ? 'Front' : 'Back'}
        </button>
      </div>

      <div className="show__info">
        <p className="show__index"><b>{pad2(index + 1)}</b> / {pad2(total)}</p>
        <h3 className="show__name">{design.name}</h3>
        <div className="show__sizes" role="group" aria-label={`Size for ${design.name}`}>
          {design.sizes.map((s) => (
            <button key={s} type="button" className={`show__size ${s === picked ? 'is-active' : ''}`} aria-pressed={s === picked}
                    onClick={() => (s === picked ? unpick(design.sku) : pick(design.sku, s))}>{s}</button>
          ))}
        </div>
        <p className="show__state" aria-live="polite">
          {picked
            ? <><span className="show__added">In your picks · {picked}</span><button type="button" onClick={() => unpick(design.sku)}>Remove</button></>
            : <span className="show__prompt">Select your size</span>}
        </p>
      </div>
    </article>
  );
}

// Follows the visitor once something is picked, until the form is on screen.
function PickBar() {
  const { count } = usePicks();
  const [formSeen, setFormSeen] = useState(false);
  useEffect(() => {
    const el = document.getElementById('preorder');
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setFormSeen(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [count]);
  if (!count || formSeen) return null;
  return (
    <button type="button" className="pickbar" onClick={() => goTo('preorder')}>
      <span key={count} className="pickbar__n">{count}</span>
      <span>{count === 1 ? 'tee' : 'tees'} picked</span>
      <b>Pre-order</b>
    </button>
  );
}

export default function Home() {
  return (
    <main>
      <ClothingRail />

      <section className="drop" id="designs" aria-labelledby="drop-title">
        <h2 className="sr-only" id="drop-title">The drop: five designs</h2>
        <div className="drop__band" aria-hidden="true">
          <div className="drop__band-track">
            {[0, 1].map((k) => (
              <div className="drop__band-set" key={k}>
                {[0, 1].map((n) => <span key={n}>The drop <i>05</i></span>)}
              </div>
            ))}
          </div>
        </div>
        {DESIGNS.map((d, i) => <Showcase key={d.sku} design={d} index={i} total={DESIGNS.length} />)}
      </section>

      <InterestForm />
      <PickBar />
    </main>
  );
}
