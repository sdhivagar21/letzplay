import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Home page hero: start-screen headline next to the brand film.
export default function Hero() {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); return; }
    const p = v.play?.();
    if (p && typeof p.then === 'function') p.catch(() => {});
  }, []);

  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 className="h-display hero__title">
            <span className="hero__line">Press start</span>
            <span className="hero__line">on your fit.</span>
          </h1>
          <p className="hero__lede">
            Oversized tees and hoodies with anime and pop-culture prints across the back.
            Pick your print, lock your size, pre-order.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--coin btn--lg" to="/collections/Oversized%20T-Shirts"><span className="pad pad--a">A</span>Shop tees</Link>
            <Link className="btn btn--line btn--lg" to="/collections/Hoodies"><span className="pad pad--b">B</span>Shop hoodies</Link>
          </div>
        </div>

        <div className="hero__stage">
          <div className="hero__screen">
            <video ref={videoRef} className="hero__video" autoPlay loop muted playsInline preload="metadata"
                   poster="/images/hero-poster.jpg" aria-label="People wearing LET'Z PLAY tees outdoors and at the gym">
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
          </div>
          <Link to="/product/oversized-anime-3" className="hero__chip hero__chip--one" aria-label="Purple Shadow Oversized T-Shirt">
            <img src="/images/design12.webp" alt="" width="800" height="1200" />
          </Link>
          <Link to="/product/hoodie-anime-2" className="hero__chip hero__chip--two" aria-label="Pain Kanji Hoodie">
            <img src="/images/hoodie1-back.webp" alt="" width="800" height="1200" />
          </Link>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((k) => (
            <div className="ticker__set" key={k}>
              <span>Oversized fits</span><i />
              <span>Back prints that go hard</span><i />
              <span>Tees, hoodies and hats</span><i />
              <span>Pre-orders open</span><i />
              <span>Sizes S to XL</span><i />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
