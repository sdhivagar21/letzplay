import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import PreorderModal from "../components/PreorderModal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useProducts, idOf, imagesOf, imgSrc, imgFallback, rupees, collOf, sameColl, isNew, swatch } from "../api.js";

const VIEW_NAMES = ["Front", "Back"];

export default function ProductPage() {
  const { sku } = useParams();
  const { products, loading } = useProducts();
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
    setQty(1); setNeedSize(false); setShowPre(false);
    setSize(prod?.sizes?.length === 1 ? prod.sizes[0] : "");
    setColor(prod?.colors?.[0] || "");
  }, [prod]);

  const related = useMemo(
    () => (prod ? products.filter((p) => p !== prod && sameColl(collOf(p), collOf(prod))).slice(0, 4) : []),
    [products, prod]
  );

  if (loading) {
    return (
      <main className="page">
        <div className="pdp pdp--loading" aria-busy="true"><div className="pdp__shot sk-block" /><div><div className="sk-line" /><div className="sk-line sk-line--short" /></div></div>
      </main>
    );
  }
  if (!prod) {
    return (
      <main className="page page--narrow empty">
        <h1 className="h-display h-2">That print isn’t in the shop</h1>
        <p className="muted">It may have been renamed or retired.</p>
        <Link className="btn btn--solid" to="/collections/All">Browse everything</Link>
      </main>
    );
  }

  const imgs = imagesOf(prod);
  const hasSizes = !!prod.sizes?.length;
  const collection = collOf(prod);

  const openPreorder = () => {
    if (hasSizes && !size) { setNeedSize(true); return; }
    if (!user) { nav(`/login?next=${encodeURIComponent(loc.pathname)}`); return; }
    setShowPre(true);
  };

  return (
    <main className="page">
      <Breadcrumbs items={[
        { label: "Home", to: "/" },
        { label: collection, to: `/collections/${encodeURIComponent(collection)}` },
        { label: prod.name },
      ]} />

      <div className="pdp">
        {/* Gallery: front and back side by side; swipeable on phones */}
        <div className={`pdp__gallery pdp__gallery--${Math.min(imgs.length, 2) || 1}`}>
          {imgs.length ? imgs.map((src, i) => (
            <figure key={src + i} className="pdp__shot">
              <img src={imgSrc(src)} onError={imgFallback(src)} alt={`${prod.name}, ${(VIEW_NAMES[i] || `view ${i + 1}`).toLowerCase()}`}
                   loading={i === 0 ? "eager" : "lazy"} width="800" height="1200" />
              {imgs.length > 1 && VIEW_NAMES[i] && <figcaption>{VIEW_NAMES[i]}</figcaption>}
            </figure>
          )) : <div className="pdp__shot"><span className="pc__noimg">Photo coming soon</span></div>}
        </div>

        {/* Details */}
        <div className="pdp__info">
          {isNew(prod) && <span className="chip">New drop</span>}
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
                          onClick={() => setColor(c)}>{swatch(c) && <i className="dot" style={{ background: swatch(c) }} />}{c}</button>
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
            <button type="button" className="btn btn--solid btn--lg btn--block" onClick={openPreorder}>
              Pre-order for {rupees(Number(prod.price) * qty)}
            </button>
            <p className="tiny muted">{user ? "No payment is taken now." : "You’ll be asked to sign in first. No payment is taken now."}</p>
          </div>

          <div className="pdp__acc">
            {!sameColl(collection, "Accessories") && (
              <details open>
                <summary>Fit</summary>
                <p>Oversized, with dropped shoulders.</p>
              </details>
            )}
            {imgs.length > 1 && (
              <details>
                <summary>Print</summary>
                <p>A small mark on the front. The main artwork is on the back.</p>
              </details>
            )}
            <details>
              <summary>Pre-order</summary>
              <p>Confirming saves the pre-order to your account. No payment is taken on this site, and its status shows under My pre-orders.</p>
            </details>
          </div>
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
