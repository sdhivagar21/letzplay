import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api.js";
import PreorderModal from "../components/PreorderModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const idOf = (x) => x?.sku || x?.ProductID || x?.productId || x?._id;
const imagesOf = (x) => x?.images || x?.imageUrls || x?.ImageURLs || [];

export default function ProductPage() {
  const { sku } = useParams();
  const [prod, setProd] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPre, setShowPre] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let off = false;
    (async () => {
      setLoading(true);
      try {
        const r = await api.get(`/api/products/${encodeURIComponent(sku)}`, { params: { _ts: Date.now() } });
        if (!off) setProd(r.data || null);
      } catch {
        try {
          const r2 = await api.get("/api/products", { params: { _ts: Date.now() } });
          const list = Array.isArray(r2.data) ? r2.data : [];
          const found = list.find((x) => String(idOf(x)) === String(sku));
          if (!off) setProd(found || null);
        } catch (e2) {
          if (!off) setProd(null);
          console.error("Failed to load product:", e2);
        }
      } finally {
        if (!off) setLoading(false);
        window.scrollTo(0, 0);
      }
    })();
    return () => { off = true; };
  }, [sku]);

  const imgs = imagesOf(prod);
  const mainSrc = imgs[active] || imgs[0] || "/images/placeholder-1.jpg";

  const priceText = useMemo(() => {
    if (!prod?.price && prod?.price !== 0) return "";
    const n = Number(prod.price);
    if (Number.isNaN(n)) return String(prod.price);
    return `₹${n.toLocaleString("en-IN")}`;
  }, [prod]);

  if (loading) return <div className="page-wrap"><p className="muted">Loading…</p></div>;
  if (!prod) return (
    <div className="page-wrap">
      <h1>Not found</h1>
      <p className="muted">We couldn’t find that product.</p>
      <p><Link to="/">Back to home</Link></p>
    </div>
  );

  const openPreorder = () => {
    if (!user) {
      nav(`/login?next=${encodeURIComponent(loc.pathname)}`);
      return;
    }
    setShowPre(true);
  };

  return (
    <div className="page-wrap">
      <nav className="crumbs" style={{marginBottom: 12}}>
        <Link to="/">Home</Link> <span>›</span>{" "}
        <Link to={`/collections/${encodeURIComponent(prod.collection || "All")}`}>{prod.collection || "All"}</Link> <span>›</span>{" "}
        <span>{prod.name}</span>
      </nav>

      <div style={{display: "grid", gap: 16, gridTemplateColumns: "1fr", alignItems: "start"}}>
        {/* Gallery */}
        <div>
          <div style={{position:"relative", width:"100%", aspectRatio:"4/5", borderRadius:12, overflow:"hidden", border:"1px solid #eee"}}>
            <img src={mainSrc} alt={prod.name} style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}} loading="eager" />
          </div>

          {imgs.length > 1 && (
            <div style={{display:"flex", gap:8, marginTop:10, overflowX:"auto"}}>
              {imgs.map((src, i) => (
                <button key={src + i} onClick={() => setActive(i)} aria-label={`Image ${i+1}`}
                        style={{flex:"0 0 auto", width:72, height:90, borderRadius:10, overflow:"hidden", border: i===active ? "2px solid #111" : "1px solid #e6e6e6", padding:0, background:"#fff", cursor:"pointer"}}>
                  <img src={src} alt="" style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 style={{margin:"0 0 6px"}}>{prod.name}</h1>
          <div style={{fontWeight:600, marginBottom:12}}>{priceText}</div>
          {prod.description && <p style={{opacity:.85}}>{prod.description}</p>}

          {!!(prod.sizes?.length) && (
            <>
              <div style={{marginTop:14, marginBottom:6, fontWeight:600}}>Size</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {prod.sizes.map(s => <span key={s} style={{border:"1px solid #e6e6e6", padding:"8px 12px", borderRadius:999}}>{s}</span>)}
              </div>
            </>
          )}

          {!!(prod.colors?.length) && (
            <>
              <div style={{marginTop:14, marginBottom:6, fontWeight:600}}>Color</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {prod.colors.map(c => <span key={c} style={{border:"1px solid #e6e6e6", padding:"8px 12px", borderRadius:999}}>{c}</span>)}
              </div>
            </>
          )}

          <div className="sticky-cta" style={{marginTop:16}}>
            <button className="btn-solid" style={{width:"100%", height:46}} onClick={openPreorder}>
              Pre-order
            </button>
          </div>
        </div>
      </div>

      {showPre && (
        <PreorderModal
          product={prod}
          onClose={() => setShowPre(false)}
          onSuccess={() => setShowPre(false)}
        />
      )}
    </div>
  );
}
