import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { idOf, imagesOf, imgSrc, imgFallback, rupees, isNew, swatch } from '../api.js';

// Most prints live on the back, so every card can be flipped:
// hover on desktop, or the Back button anywhere.
export default function ProductCard({ product, eager = false }) {
  const [flipped, setFlipped] = useState(false);
  const pics = imagesOf(product);
  const front = pics[0];
  const back = pics[1];
  const to = `/product/${encodeURIComponent(idOf(product))}`;
  const colours = (product.colors || []).filter(Boolean);
  const sizes = (product.sizes || []).filter(Boolean);

  return (
    <article className={`pc ${flipped ? 'is-flipped' : ''} ${back ? 'has-back' : ''}`}>
      <div className="pc__frame">
        <Link to={to} className="pc__media" aria-label={product.name}>
          {front ? (
            <img className="pc__img pc__img--front" src={imgSrc(front)} onError={imgFallback(front)} alt={product.name}
                 loading={eager ? 'eager' : 'lazy'} width="800" height="1200" />
          ) : (
            <span className="pc__noimg">Photo coming soon</span>
          )}
          {back && (
            <img className="pc__img pc__img--back" src={imgSrc(back)} onError={imgFallback(back)} alt="" loading="lazy" width="800" height="1200" />
          )}
          {/* sizes slide up on hover (desktop) */}
          {sizes.length > 0 && (
            <span className="pc__sizes" aria-hidden="true">
              <span>Pre-order</span>
              <span className="pc__sizes-list">{sizes.join('  ')}</span>
            </span>
          )}
        </Link>
        {isNew(product) && <span className="pc__tag">New</span>}
        {back && (
          <button type="button" className="pc__flip" aria-pressed={flipped} onClick={() => setFlipped((v) => !v)}>
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {flipped ? 'Front' : 'Back'}
          </button>
        )}
      </div>
      <div className="pc__info">
        <Link to={to} className="pc__name">{product.name}</Link>
        <span className="pc__price">{rupees(product.price)}</span>
      </div>
      {colours.length > 0 && (
        <p className="pc__sub">
          {colours.map((c) => swatch(c) && <i key={c} className="dot" style={{ background: swatch(c) }} />)}
          {colours.join(' / ')}
        </p>
      )}
    </article>
  );
}

// Placeholder tiles while the catalogue loads.
export const CardSkeletons = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div className="pc pc--skeleton" key={i} aria-hidden="true">
        <div className="pc__media" />
        <div className="sk-line" /><div className="sk-line sk-line--short" />
      </div>
    ))}
  </>
);
