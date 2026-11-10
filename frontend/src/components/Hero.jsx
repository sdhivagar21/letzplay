import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Home page hero: the brand film beside two stills, edge to edge and
// one screen tall, with the headline over the bottom-left corner.
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
      <div className="hero__media">
        <video ref={videoRef} className="hero__video" autoPlay loop muted playsInline preload="metadata"
               poster="/images/hero-poster.jpg" aria-label="People wearing LET'Z PLAY tees outdoors and at the gym">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero__still"><img src="/images/design12.webp" alt="" width="800" height="1200" /></div>
        <div className="hero__still hero__still--b"><img src="/images/oversized26-back.webp" alt="" width="800" height="1200" /></div>
      </div>
      <div className="hero__copy">
        <p className="hero__kicker">The new drop is open for pre-order</p>
        <h1 className="h-display hero__title">
          <span>Clean front.</span>
          <span>Loud back.</span>
        </h1>
        <p className="hero__lede">Oversized tees and hoodies with anime and pop-culture prints across the back.</p>
        <div className="hero__actions">
          <Link className="btn btn--light btn--lg" to="/collections/New">Shop the drop</Link>
          <Link className="textlink textlink--light" to="/collections/Hoodies">Shop hoodies</Link>
        </div>
      </div>
    </section>
  );
}
