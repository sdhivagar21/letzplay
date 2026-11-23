import React, { useCallback, useEffect, useRef, useState } from 'react';
import ClothingRail from '../components/ClothingRail.jsx';
import InterestForm from '../components/InterestForm.jsx';
import { usePicks, goTo } from '../context/PicksContext.jsx';
import { imgSrc, imgSmall, imgFallback, teeSrcSet } from '../img.js';
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
function Showcase({ design, index, total, onTry }) {
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
        <button type="button" className="show__try" onClick={() => onTry(design.sku)}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          Try it on
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------
   Try it on: a live camera try-on that runs entirely in the browser.
   Google's MediaPipe pose model finds the shoulders (and hips when
   they are in view) and the tee picture is drawn over them, following
   every move. Nothing is uploaded: the video stays on the device.
   The model (~6 MB) and its engine (~5 MB compressed) load only when
   someone taps Start camera, then stay in the browser cache.
   ------------------------------------------------------------------ */
const MP_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3';
const POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const LOGO = '/images/aura-wears-logo.webp';

// Where the wearer's shoulders sit on the tee pictures (fractions of the picture).
const TEE_SHOULDER_Y = 0.125;          // shoulder line, down from the top
const TEE_SHOULDER_SPAN = 0.4;         // distance between the two shoulder joints, of the width
// How much bigger each size looks than M (a preview, not a measurement).
const SIZE_FIT = { S: 0.93, M: 1, L: 1.06, XL: 1.12, XXL: 1.18 };

let landmarkerPromise = null;
const loadLandmarker = () => {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await import(/* @vite-ignore */ `${MP_BASE}/vision_bundle.mjs`);
      const files = await vision.FilesetResolver.forVisionTasks(`${MP_BASE}/wasm`);
      const make = (delegate) => vision.PoseLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: POSE_MODEL, delegate },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      try { return await make('GPU'); } catch { return make('CPU'); }
    })();
    landmarkerPromise.catch(() => { landmarkerPromise = null; });
  }
  return landmarkerPromise;
};

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

// Shoulders, hips and facing from one pose, in canvas pixels.
// `mirror` is true for the selfie camera (drawn like a mirror).
const readPose = (lm, W, H, mirror) => {
  if (!lm) return null;
  const P = (i) => ({ x: (mirror ? 1 - lm[i].x : lm[i].x) * W, y: lm[i].y * H, v: lm[i].visibility ?? 1 });
  const ls = P(11); const rs = P(12); const lh = P(23); const rh = P(24);
  if (Math.min(ls.v, rs.v) < 0.5) return null;
  const sw = Math.hypot(ls.x - rs.x, ls.y - rs.y);
  if (sw < Math.min(W, H) * 0.08) return null;
  const [a, b] = ls.x < rs.x ? [ls, rs] : [rs, ls];
  const mid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const torso = Math.min(lh.v, rh.v) > 0.6 ? Math.hypot((lh.x + rh.x) / 2 - mid.x, (lh.y + rh.y) / 2 - mid.y) : 0;
  const face = Math.max(lm[0].visibility ?? 1, lm[2].visibility ?? 1, lm[5].visibility ?? 1);
  return { x: mid.x, y: mid.y, sw, angle: Math.atan2(b.y - a.y, b.x - a.x), torso, away: face < 0.3 };
};

// Puts the tee over the shoulders; `fit` is the size preview scale.
const placeTee = (pose, img, fit) => {
  const s = (pose.sw / (TEE_SHOULDER_SPAN * img.naturalWidth)) * fit;
  let squash = 0.86;                                   // no hips in view: a usual length
  if (pose.torso) {
    const hem = pose.torso * 1.18;                     // hem a little below the hips
    squash = Math.min(1.08, Math.max(0.72, hem / ((1 - TEE_SHOULDER_Y) * img.naturalHeight * s)));
  }
  return { x: pose.x, y: pose.y + pose.sw * 0.05, angle: pose.angle, sx: s, sy: s * squash };
};

const ease = (from, to, k) => (from == null ? to : from + (to - from) * k);

function TryOn({ sku, onSku }) {
  const { picks, pick, unpick } = usePicks();
  const design = DESIGNS.find((d) => d.sku === sku) || DESIGNS[0];
  const picked = picks[design.sku];
  const [side, setSide] = useState('front');        // which print goes on the body
  const [mode, setMode] = useState('idle');          // idle | loading | live | photo
  const [note, setNote] = useState('');              // hint over the picture
  const [error, setError] = useState('');
  const [turned, setTurned] = useState(false);

  const secRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const run = useRef({ raf: 0, stream: null, lmk: null, place: null, alpha: 0, seen: 0, lastVideo: -1, away: 0, photo: null, pose: null });
  const tees = useRef({});                           // loaded tee pictures by url
  const logo = useRef(null);
  const live = useRef({ design, side, fit: SIZE_FIT[picked || 'M'], turned: false });
  live.current = { design, side, fit: SIZE_FIT[picked || 'M'], turned };

  const teeFor = (d, back) => tees.current[imgSrc(d.images[back ? 1 : 0])];

  // Keep the current tee's two pictures (and the logo) ready to draw.
  useEffect(() => {
    let alive = true;
    design.images.forEach((src) => {
      const url = imgSrc(src);
      if (tees.current[url]) return;
      loadImage(url).catch(() => loadImage(src)).then((img) => { if (alive) tees.current[url] = img; }).catch(() => {});
    });
    if (!logo.current) loadImage(LOGO).then((img) => { logo.current = img; }).catch(() => {});
    return () => { alive = false; };
  }, [design]);

  // Draws one frame: the picture underneath, then the tee on the body.
  const paint = useCallback((ctx, W, H, pose, smooth) => {
    const r = run.current;
    const { design: d, side: want, fit, turned: away } = live.current;
    const img = teeFor(d, away ? true : want === 'back');
    if (pose && img) {
      const t = placeTee(pose, img, fit);
      const k = smooth ? 0.45 : 1;
      const p = r.place || {};
      let da = t.angle - (p.angle ?? t.angle);
      if (da > Math.PI) da -= 2 * Math.PI;
      if (da < -Math.PI) da += 2 * Math.PI;
      r.place = { x: ease(p.x, t.x, k), y: ease(p.y, t.y, k), sx: ease(p.sx, t.sx, k), sy: ease(p.sy, t.sy, k), angle: (p.angle ?? t.angle) + da * k };
      r.alpha = smooth ? Math.min(1, r.alpha + 0.2) : 1;
    } else if (smooth) {
      r.alpha = Math.max(0, r.alpha - 0.08);
    }
    if (r.place && img && r.alpha > 0) {
      const q = r.place;
      ctx.save();
      ctx.globalAlpha = r.alpha;
      ctx.translate(q.x, q.y);
      ctx.rotate(q.angle);
      ctx.scale(q.sx, q.sy);
      ctx.shadowColor = 'rgba(11, 11, 12, 0.45)';
      ctx.shadowBlur = 24 / Math.max(q.sx, 0.01);
      ctx.shadowOffsetY = 8 / Math.max(q.sy, 0.01);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight * TEE_SHOULDER_Y);
      ctx.restore();
    }
    // Small logo in the corner, so saved photos carry the brand.
    const lg = logo.current;
    if (lg) {
      const w = Math.min(W, H) * 0.26;
      const h = w * (lg.naturalHeight / lg.naturalWidth);
      ctx.globalAlpha = 0.92;
      ctx.drawImage(lg, W - w - W * 0.04, H - h - H * 0.03, w, h);
      ctx.globalAlpha = 1;
    }
  }, []);

  const stopCamera = useCallback(() => {
    const r = run.current;
    cancelAnimationFrame(r.raf);
    r.raf = 0;
    r.stream?.getTracks().forEach((t) => t.stop());
    r.stream = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback(() => {
    stopCamera();
    run.current.place = null;
    run.current.photo = null;
    setMode('idle');
    setNote('');
    setTurned(false);
  }, [stopCamera]);

  // The camera loop: find the pose on each new video frame and draw.
  const loop = useCallback(() => {
    const r = run.current;
    r.raf = requestAnimationFrame(loop);
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2 || !r.lmk) return;
    const W = v.videoWidth;
    const H = v.videoHeight;
    if (!W || !H) return;
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    const ctx = c.getContext('2d');
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, W, H);
    ctx.restore();
    if (v.currentTime !== r.lastVideo) {
      r.lastVideo = v.currentTime;
      let lm = null;
      try { lm = r.lmk.detectForVideo(v, performance.now()).landmarks?.[0] || null; } catch { lm = null; }
      r.pose = readPose(lm, W, H, true);
      const now = performance.now();
      if (r.pose) r.seen = now;
      // Turned round for a few frames in a row: show the back print.
      r.away = r.pose?.away ? Math.min(r.away + 1, 12) : Math.max(r.away - 1, 0);
      const away = r.away > 6;
      if (away !== live.current.turned) setTurned(away);
      const lost = now - r.seen > 700;
      setNote(lost ? 'Step back so both shoulders are in view' : '');
    }
    paint(ctx, W, H, r.pose, true);
  }, [paint]);

  const startCamera = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser can’t open the camera here. Try a photo instead.');
      return;
    }
    setMode('loading');
    stopCamera();
    const model = loadLandmarker();                    // starts downloading while the camera opens
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
      run.current.stream = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();
      const lmk = await model;
      await lmk.setOptions({ runningMode: 'VIDEO' });
      Object.assign(run.current, { lmk, place: null, alpha: 0, seen: performance.now(), lastVideo: -1, away: 0, photo: null });
      setMode('live');
      cancelAnimationFrame(run.current.raf);
      loop();
    } catch (e) {
      stop();
      const name = e?.name || '';
      setError(name === 'NotAllowedError' || name === 'SecurityError'
        ? 'Camera access was blocked. Allow the camera for this site, or try a photo instead.'
        : name === 'NotFoundError' || name === 'OverconstrainedError'
          ? 'No camera found. Try a photo instead.'
          : 'The try-on couldn’t load. Check your connection and tap Start camera again.');
    }
  };

  // Draws a still photo with the tee on it (used for uploads).
  const paintPhoto = useCallback(() => {
    const r = run.current;
    const c = canvasRef.current;
    if (!r.photo || !c) return;
    const { img, W, H } = r.photo;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    r.place = null;
    paint(ctx, W, H, r.pose, false);
  }, [paint]);

  const openPhoto = async (file) => {
    if (!file) return;
    setError('');
    stopCamera();
    setMode('loading');
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      URL.revokeObjectURL(url);
      const big = Math.max(img.naturalWidth, img.naturalHeight);
      const k = Math.min(1, 1600 / big);
      const W = Math.round(img.naturalWidth * k);
      const H = Math.round(img.naturalHeight * k);
      const c = canvasRef.current;
      c.width = W;
      c.height = H;
      const lmk = await loadLandmarker();
      await lmk.setOptions({ runningMode: 'IMAGE' });
      const lm = lmk.detect(img).landmarks?.[0] || null;
      const pose = readPose(lm, W, H, false);
      Object.assign(run.current, { lmk, photo: { img, W, H }, pose, alpha: 1 });
      setTurned(Boolean(pose?.away));
      setMode('photo');
      setNote(pose ? '' : 'Couldn’t find shoulders in this photo. Try one from the waist up, facing the camera.');
    } catch {
      stop();
      setError('That photo couldn’t be opened. Try another one.');
    }
  };

  // Redraw the still photo when the tee, print or size changes.
  useEffect(() => { if (mode === 'photo') paintPhoto(); }, [mode, design, side, picked, turned, paintPhoto]);
  // The tee pictures may finish loading after the photo is drawn.
  useEffect(() => {
    if (mode !== 'photo') return undefined;
    const t = setTimeout(paintPhoto, 400);
    return () => clearTimeout(t);
  }, [mode, design, paintPhoto]);

  // Camera off when the section leaves the screen or the page unmounts.
  useEffect(() => {
    const el = secRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && run.current.stream) stop();
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [stop]);
  useEffect(() => () => stopCamera(), [stopCamera]);

  const savePhoto = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `aura-wears-${design.sku}.jpg`, { type: 'image/jpeg' });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `Aura Wears · ${design.name}` });
          return;
        }
      } catch (e) { if (e?.name === 'AbortError') return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/jpeg', 0.92);
  };

  const showing = mode === 'live' || mode === 'photo';
  const shownSide = turned ? 'back' : side;

  return (
    <section className="tryon" id="try-on" aria-labelledby="tryon-title" ref={secRef}>
      <div className="tryon__head">
        <p className="tryon__kicker">Live try-on</p>
        <h2 className="tryon__title" id="tryon-title">Try it <span>on you</span></h2>
        <p className="tryon__lede">Open your camera and the tee sits on you as you move. Turn around to see the back print.</p>
      </div>

      <div className="tryon__body">
        <div className={`tryon__stage ${showing ? 'is-on' : ''}`}>
          <canvas ref={canvasRef} className="tryon__canvas" aria-label={`You wearing the ${design.name} tee`} role="img" />
          <video ref={videoRef} className="tryon__video" playsInline muted aria-hidden="true" />
          {!showing && (
            <div className="tryon__poster">
              <img key={design.images[side === 'back' ? 1 : 0]} src={imgSrc(design.images[side === 'back' ? 1 : 0])}
                   onError={imgFallback(design.images[side === 'back' ? 1 : 0])} alt="" width="760" height="950" draggable="false" />
            </div>
          )}
          {mode === 'idle' && (
            <div className="tryon__cue">
              <button type="button" className="rail-pill rail-pill--solid" onClick={startCamera}>Start camera</button>
              <button type="button" className="tryon__link" onClick={() => fileRef.current?.click()}>Use a photo instead</button>
            </div>
          )}
          {mode === 'loading' && <p className="tryon__loading" role="status">Getting the try-on ready…</p>}
          {showing && note && <p className="tryon__hint" role="status">{note}</p>}
          {showing && !note && turned && <p className="tryon__hint" role="status">Back print</p>}
        </div>

        <div className="tryon__panel">
          <div>
            <p className="tryon__label">Pick a tee</p>
            <div className="tryon__picker" role="group" aria-label="Tee to try on">
              {DESIGNS.map((d) => (
                <button key={d.sku} type="button" className={`tryon__tee ${d.sku === design.sku ? 'is-active' : ''}`}
                        aria-pressed={d.sku === design.sku} aria-label={d.name} onClick={() => onSku(d.sku)}>
                  <img src={imgSmall(d.images[0])} onError={imgFallback(d.images[0])} alt="" width="480" height="600" loading="lazy" draggable="false" />
                </button>
              ))}
            </div>
            <h3 className="tryon__name">{design.name}</h3>
          </div>

          <div>
            <p className="tryon__label">Print on you</p>
            <div className="tryon__seg" role="group" aria-label="Which print to show">
              {['front', 'back'].map((s) => (
                <button key={s} type="button" className={shownSide === s ? 'is-active' : ''} aria-pressed={side === s} onClick={() => setSide(s)}>
                  {s === 'front' ? 'Front' : 'Back'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="tryon__label">Size {picked ? '' : '· the preview shows M'}</p>
            <div className="show__sizes tryon__sizes" role="group" aria-label={`Size for ${design.name}`}>
              {design.sizes.map((s) => (
                <button key={s} type="button" className={`show__size ${s === picked ? 'is-active' : ''}`} aria-pressed={s === picked}
                        onClick={() => (s === picked ? unpick(design.sku) : pick(design.sku, s))}>{s}</button>
              ))}
            </div>
            <p className="show__state" aria-live="polite">
              {picked
                ? <><span className="show__added">In your picks · {picked}</span><button type="button" onClick={() => unpick(design.sku)}>Remove</button></>
                : <span className="show__prompt">Pick a size to pre-order</span>}
            </p>
          </div>

          {showing && (
            <div className="tryon__actions">
              <button type="button" className="rail-pill rail-pill--solid" onClick={savePhoto}>{mode === 'live' ? 'Take photo' : 'Save photo'}</button>
              {mode === 'live'
                ? <button type="button" className="rail-pill" onClick={stop}>Stop camera</button>
                : <button type="button" className="rail-pill" onClick={startCamera}>Start camera</button>}
              <button type="button" className="tryon__link" onClick={() => fileRef.current?.click()}>
                {mode === 'photo' ? 'Use another photo' : 'Use a photo instead'}
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true"
                 onChange={(e) => { openPhoto(e.target.files?.[0]); e.target.value = ''; }} />

          {error && <p className="tryon__error" role="alert">{error}</p>}
          <p className="tryon__note">Runs on your phone. Your camera never leaves it and nothing is uploaded. The fit is a preview, not a measurement.</p>
        </div>
      </div>
    </section>
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
  const [tryOn, setTryOn] = useState(DESIGNS[0].sku);
  const openTryOn = useCallback((sku) => { setTryOn(sku); goTo('try-on'); }, []);
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
        {DESIGNS.map((d, i) => <Showcase key={d.sku} design={d} index={i} total={DESIGNS.length} onTry={openTryOn} />)}
      </section>

      <TryOn sku={tryOn} onSku={setTryOn} />

      <InterestForm />
      <PickBar />
    </main>
  );
}
