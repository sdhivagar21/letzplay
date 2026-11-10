import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import ProductCard, { CardSkeletons } from '../components/ProductCard.jsx';
import { useProducts, productsIn, imagesOf, imgSrc, imgFallback, idOf, COLLECTIONS } from '../api.js';

const CLASS_COPY = {
  'Oversized T-Shirts': { label: 'Oversized tees', blurb: 'Boxy, dropped shoulders, print on the back.' },
  Hoodies: { label: 'Hoodies', blurb: 'Heavy fleece with chest and back prints.' },
  Accessories: { label: 'Accessories', blurb: 'Hats to finish the fit.' },
};

export default function Home() {
  const { products, loading } = useProducts();

  const fresh = useMemo(() => productsIn(products, 'New').slice(0, 8), [products]);
  const best = useMemo(() => productsIn(products, 'Best Sellers').slice(0, 4), [products]);
  const classes = useMemo(
    () => COLLECTIONS.map((name) => {
      const items = productsIn(products, name);
      return { name, count: items.length, cover: imagesOf(items[0])[0] };
    }).filter((c) => c.count > 0),
    [products]
  );
  // The print wall shows back prints only.
  const wall = useMemo(
    () => products.filter((p) => imagesOf(p)[1]).slice(0, 24).map((p) => ({ id: idOf(p), name: p.name, src: imagesOf(p)[1] })),
    [products]
  );

  return (
    <main>
      <Hero />

      <section className="section container">
        <div className="section__head">
          <h2 className="h-display h-2">Fresh drops</h2>
          <Link to="/collections/New" className="link">See all new</Link>
        </div>
        <div className="grid">
          {loading ? <CardSkeletons count={4} /> : fresh.map((p, i) => <ProductCard key={idOf(p)} product={p} eager={i < 4} />)}
        </div>
      </section>

      {classes.length > 0 && (
        <section className="section container">
          <div className="section__head">
            <h2 className="h-display h-2">Choose your class</h2>
          </div>
          <div className={`classes classes--${classes.length}`}>
            {classes.map((c) => (
              <Link key={c.name} to={`/collections/${encodeURIComponent(c.name)}`} className="class-tile">
                {c.cover && <img src={imgSrc(c.cover)} onError={imgFallback(c.cover)} alt="" loading="lazy" width="800" height="1200" />}
                <span className="class-tile__body">
                  <span className="h-display class-tile__name">{CLASS_COPY[c.name]?.label || c.name}</span>
                  <span className="class-tile__blurb">{CLASS_COPY[c.name]?.blurb}</span>
                  <span className="class-tile__count">{c.count} {c.count === 1 ? 'style' : 'styles'}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {wall.length > 3 && (
        <section className="wall">
          <div className="container section__head">
            <h2 className="h-display h-2">The print wall</h2>
            <p className="wall__note">Back prints from the shop. Scroll sideways and open any of them.</p>
          </div>
          <div className="wall__strip" tabIndex={0} aria-label="Back prints">
            {wall.map((w) => (
              <Link key={w.id} to={`/product/${encodeURIComponent(w.id)}`} className="wall__item" aria-label={w.name}>
                <img src={imgSrc(w.src)} onError={imgFallback(w.src)} alt="" loading="lazy" width="800" height="1200" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {best.length > 0 && (
        <section className="section container">
          <div className="section__head">
            <h2 className="h-display h-2">Best sellers</h2>
            <Link to="/collections/Best%20Sellers" className="link">See all best sellers</Link>
          </div>
          <div className="grid">
            {best.map((p) => <ProductCard key={idOf(p)} product={p} />)}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="how">
          <h2 className="h-display h-2">How pre-order works</h2>
          <ol className="how__steps">
            <li><span className="how__n">1</span><div><h3>Pick your print</h3><p>Flip any card to see the back, then choose your size and colour.</p></div></li>
            <li><span className="how__n">2</span><div><h3>Place the pre-order</h3><p>Sign in and confirm. No payment is taken on this site.</p></div></li>
            <li><span className="how__n">3</span><div><h3>Track the status</h3><p>Every pre-order and its status is listed under My pre-orders.</p></div></li>
          </ol>
        </div>
      </section>
    </main>
  );
}
