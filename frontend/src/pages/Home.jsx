import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import ClothingRail from '../components/ClothingRail.jsx';
import ProductCard, { CardSkeletons } from '../components/ProductCard.jsx';
import { useProducts, productsIn, imagesOf, imgSrc, imgFallback, idOf, rupees, COLLECTIONS, Reveal } from '../api.js';

const TILE_LABELS = { 'Oversized T-Shirts': 'Oversized Tees', Hoodies: 'Hoodies', Accessories: 'Accessories' };
const TICKER = ['Pre-orders open', 'Oversized fits', 'Prints on the back', 'Tees, hoodies and hats', 'Sizes S to XL'];

export default function Home() {
  const { products, loading } = useProducts();

  const fresh = useMemo(() => productsIn(products, 'New').slice(0, 8), [products]);
  const best = useMemo(() => productsIn(products, 'Best Sellers').slice(0, 4), [products]);

  // Category tiles: "New" first, then every collection that has products.
  const tiles = useMemo(() => {
    const out = [];
    if (fresh[0]) out.push({ name: 'New', label: 'New', count: fresh.length, cover: imagesOf(fresh[0])[1] || imagesOf(fresh[0])[0] });
    for (const name of COLLECTIONS) {
      const items = productsIn(products, name);
      if (items.length) out.push({ name, label: TILE_LABELS[name] || name, count: items.length, cover: imagesOf(items[items.length > 1 ? 1 : 0])[0] });
    }
    return out;
  }, [products, fresh]);

  // One product shown front and back for the "clean front, loud back" feature.
  const feature = useMemo(() => productsIn(products, 'Best Sellers').find((p) => imagesOf(p)[1]), [products]);
  const hoodie = useMemo(() => productsIn(products, 'Hoodies')[0], [products]);
  const hoodiePics = imagesOf(hoodie);

  // Lookbook: back prints only, one large and four small.
  const look = useMemo(
    () => products.filter((p) => imagesOf(p)[1] && p !== feature).slice(0, 5)
      .map((p) => ({ id: idOf(p), name: p.name, price: p.price, src: imagesOf(p)[1] })),
    [products, feature]
  );

  return (
    <main>
      <Hero />

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((k) => (
            <div className="ticker__set" key={k}>
              {TICKER.map((t) => <React.Fragment key={t}><span>{t}</span><i /></React.Fragment>)}
            </div>
          ))}
        </div>
      </div>

      <ClothingRail />

      {tiles.length > 0 && (
        <section className={`tiles tiles--${tiles.length}`} aria-label="Shop by category">
          {tiles.map((t) => (
            <Link key={t.name} to={`/collections/${encodeURIComponent(t.name)}`} className="tile">
              {t.cover && <img src={imgSrc(t.cover)} onError={imgFallback(t.cover)} alt="" loading="lazy" width="800" height="1200" />}
              <span className="tile__body">
                <span className="h-display tile__label">{t.label}</span>
                <span className="tile__cta">Shop {t.count} {t.count === 1 ? 'style' : 'styles'}</span>
              </span>
            </Link>
          ))}
        </section>
      )}

      <Reveal as="section" className="section">
        <div className="section__head">
          <h2 className="h-display h-2">New arrivals</h2>
          <Link to="/collections/New" className="textlink">Shop all new</Link>
        </div>
        <div className="grid">
          {loading ? <CardSkeletons count={4} /> : fresh.map((p, i) => <ProductCard key={idOf(p)} product={p} eager={i < 4} />)}
        </div>
      </Reveal>

      {feature && (
        <Reveal as="section" className="duo">
          <Link to={`/product/${encodeURIComponent(idOf(feature))}`} className="duo__shot" aria-label={`${feature.name}, front`}>
            <img src={imgSrc(imagesOf(feature)[0])} onError={imgFallback(imagesOf(feature)[0])} alt="" loading="lazy" width="800" height="1200" />
            <span className="duo__tag">Front</span>
          </Link>
          <div className="duo__copy">
            <h2 className="h-display duo__title"><span>Clean front.</span><span>Loud back.</span></h2>
            <p>A small mark on the chest. The full artwork is on the back, where an oversized fit gives it room.</p>
            <p className="duo__product">{feature.name}<span>{rupees(feature.price)}</span></p>
            <Link className="btn btn--solid" to={`/product/${encodeURIComponent(idOf(feature))}`}>Pre-order this tee</Link>
          </div>
          <Link to={`/product/${encodeURIComponent(idOf(feature))}`} className="duo__shot" aria-label={`${feature.name}, back`}>
            <img src={imgSrc(imagesOf(feature)[1])} onError={imgFallback(imagesOf(feature)[1])} alt="" loading="lazy" width="800" height="1200" />
            <span className="duo__tag">Back</span>
          </Link>
        </Reveal>
      )}

      {best.length > 0 && (
        <Reveal as="section" className="section">
          <div className="section__head">
            <h2 className="h-display h-2">Best sellers</h2>
            <Link to="/collections/Best%20Sellers" className="textlink">Shop best sellers</Link>
          </div>
          <div className="grid">
            {best.map((p) => <ProductCard key={idOf(p)} product={p} />)}
          </div>
        </Reveal>
      )}

      {hoodie && hoodiePics.length > 0 && (
        <Reveal as="section" className="banner">
          <img className="banner__bg" src={imgSrc(hoodiePics[1] || hoodiePics[0])} onError={imgFallback(hoodiePics[1] || hoodiePics[0])} alt="" loading="lazy" width="800" height="1200" />
          <img className="banner__bg banner__bg--b" src={imgSrc(hoodiePics[0])} onError={imgFallback(hoodiePics[0])} alt="" loading="lazy" width="800" height="1200" />
          <div className="banner__copy">
            <h2 className="h-display banner__title">Hoodies</h2>
            <p>Fleece hoodies with a print on the chest and a bigger one on the back.</p>
            <Link className="btn btn--light" to="/collections/Hoodies">Shop hoodies</Link>
          </div>
        </Reveal>
      )}

      {look.length === 5 && (
        <Reveal as="section" className="section">
          <div className="section__head">
            <h2 className="h-display h-2">The back prints</h2>
            <Link to="/collections/All" className="textlink">See every print</Link>
          </div>
          <div className="look">
            {look.map((w) => (
              <Link key={w.id} to={`/product/${encodeURIComponent(w.id)}`} className="look__item">
                <img src={imgSrc(w.src)} onError={imgFallback(w.src)} alt="" loading="lazy" width="800" height="1200" />
                <span className="look__cap"><span>{w.name}</span><span>{rupees(w.price)}</span></span>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal as="section" className="section">
        <div className="how" id="about">
          <h2 className="h-display h-2">How pre-order works</h2>
          <ol className="how__steps">
            <li><span className="how__n">1</span><h3>Pick your print</h3><p>Flip any product to see the back, then choose your size and colour.</p></li>
            <li><span className="how__n">2</span><h3>Place the pre-order</h3><p>Sign in and confirm. No payment is taken on this site.</p></li>
            <li><span className="how__n">3</span><h3>Track the status</h3><p>Every pre-order and its status is listed under My pre-orders.</p></li>
          </ol>
        </div>
      </Reveal>
    </main>
  );
}
