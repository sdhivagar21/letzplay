import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import PreorderModal from "../components/PreorderModal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useProducts, idOf, imagesOf, imgSrc, imgFallback, rupees, collOf, sameColl, isNew } from "../api.js";

const VIEW_NAMES = ["Front", "Back"];

export default function ProductPage() {
  const { sku } = useParams();
  const { products, loading } = useProducts();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [showPre, setShowPre] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const prod = useMemo(() => products.find((x) => idOf(x) === String(sku)) || null, [products, sku]);

  useEffect(() => {
    setActive(0); setQty(1); setNeedSize(false); setShowPre(false);
    setSize(prod?.sizes?.length === 1 ? prod.sizes[0] : "");
    setColor(prod?.colors?.[0] || "");
  }, [prod]);

  const related = useMemo(
    () => (prod ? products.filter((p) => p !== prod && sameColl(collOf(p), collOf(prod))).slice(0, 4) : []),
    [products, prod]
  );

  if (loading) {
    return (
      <main className="page container">
        <div className="pdp pdp--loading" aria-busy="true"><div className="pdp__main sk-block" /><div><div className="sk-line" /><div className="sk-line sk-line--short" /></div></div>
      </main>
    );
  }
  if (!prod) {
    return (
      <main className="page page--narrow empty">
        <h1 className="h-display h-2">That print isn’t in the shop</h1>
        <p className="muted">It may have been renamed or retired.</p>
        <Link className="btn btn--coin" to="/collections/All">Browse everything</Link>
      </main>
    );
  }

  const imgs = imagesOf(prod);
  const mainSrc = imgs[active] || imgs[0];
  const hasSizes = !!prod.sizes?.length;
  const collection = collOf(prod);

  const openPreorder = () => {
    if (hasSizes && !size) { setNeedSize(true); return; }
    if (!user) { nav(`/login?next=${encodeURIComponent(loc.pathname)}`); return; }
    setShowPre(true);
  };

  return (
    <main className="page container">
      <Breadcrumbs items={[
        { label: "Home", to: "/" },
        { label: collection, to: `/collections/${encodeURIComponent(collection)}` },
        { label: prod.name },
      ]} />

      <div className="pdp">
        {/* Gallery */}
        <div className="pdp__gallery">
          {imgs.length > 1 && (
            <div className="pdp__thumbs">
              {imgs.map((src, i) => (
                <button key={src + i} type="button" onClick={() => setActive(i)} aria-label={`${VIEW_NAMES[i] || `Image ${i + 1}`} view`}
                        aria-pressed={i === active} className={`pdp__thumb ${i === active ? "is-active" : ""}`}>
                  <img src={imgSrc(src)} onError={imgFallback(src)} alt="" loading="lazy" width="80" height="120" />
                </button>
              ))}
            </div>
          )}
          <div className="pdp__main">
            {mainSrc
              ? <img key={mainSrc} src={imgSrc(mainSrc)} onError={imgFallback(mainSrc)} alt={`${prod.name}, ${(VIEW_NAMES[active] || "view").toLowerCase()}`} width="800" height="1200" />
              : <span className="pc__noimg">Photo coming soon</span>}
            {imgs.length > 1 && (
              <div className="pdp__toggle" role="group" aria-label="View">
                {imgs.slice(0, 2).map((_, i) => (
                  <button key={i} type="button" className={i === active ? "is-active" : ""} aria-pressed={i === active} onClick={() => setActive(i)}>{VIEW_NAMES[i]}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="pdp__info">
          {isNew(prod) && <span className="chip chip--coin">New drop</span>}
          <h1 className="h-display h-2 pdp__name">{prod.name}</h1>
          <p className="pdp__price">{rupees(prod.price)}</p>
          {prod.description && <p className="pdp__desc">{prod.description}</p>}

          {hasSizes && (
            <fieldset className={`opt ${needSize && !size ? "is-missing" : ""}`}>
              <legend>Size{size ? `: ${size}` : ""}</legend>
              <div className="opt__row">
                {prod.sizes.map((s) => (
                  <button key={s} type="button" className={`opt__btn ${s === size ? "is-active" : ""}`} aria-pressed={s === size}
                          onClick={() => { setSize(s); setNeedSize(false); }}>{s}</button>
                ))}
              </div>
              {needSize && !size && <p className="opt__error" role="alert">Choose a size to continue.</p>}
            </fieldset>
          )}

          {!!prod.colors?.length && (
            <fieldset className="opt">
              <legend>Colour{color ? `: ${color}` : ""}</legend>
              <div className="opt__row">
                {prod.colors.map((c) => (
                  <button key={c} type="button" className={`opt__btn opt__btn--wide ${c === color ? "is-active" : ""}`} aria-pressed={c === color}
                          onClick={() => setColor(c)}>{c}</button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="opt">
            <legend>Quantity</legend>
            <div className="stepper">
              <button type="button" aria-label="One less" onClick={() => setQty((n) => Math.max(1, n - 1))} disabled={qty <= 1}>−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" aria-label="One more" onClick={() => setQty((n) => Math.min(20, n + 1))}>+</button>
            </div>
          </fieldset>

          <div className="pdp__cta">
            <button type="button" className="btn btn--coin btn--lg btn--block" onClick={openPreorder}>
              <span className="pad pad--a">A</span>Pre-order for {rupees(Number(prod.price) * qty)}
            </button>
            <p className="tiny muted">{user ? "No payment is taken now." : "You’ll be asked to sign in first. No payment is taken now."}</p>
          </div>

          <ul className="pdp__facts">
            {!sameColl(collection, "Accessories") && <li>Oversized, dropped-shoulder fit</li>}
            {imgs.length > 1 && <li>The main print is on the back. Switch to the Back view to see it.</li>}
            <li>Track every pre-order under My pre-orders</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--tight">
          <div className="section__head">
            <h2 className="h-display h-3">More {collection.toLowerCase()}</h2>
            <Link className="link" to={`/collections/${encodeURIComponent(collection)}`}>See all</Link>
          </div>
          <div className="grid">
            {related.map((p) => <ProductCard key={idOf(p)} product={p} />)}
          </div>
        </section>
      )}

      {showPre && (
        <PreorderModal
          product={prod}
          initial={{ size, color, qty }}
          onClose={() => setShowPre(false)}
        />
      )}
    </main>
  );
}
