import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
function Showcase({ design, index, total, onTry, dragTees }) {
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
                     loading="lazy" decoding="async" width="760" height="950" draggable={dragTees ? 'true' : 'false'} data-tee={design.sku} data-side="back" />
                <img className="show__face show__face--front" src={imgSrc(design.images[0])} srcSet={teeSrcSet(design.images[0])} sizes={SHOW_SIZES} onError={imgFallback(design.images[0])} alt=""
                     loading="lazy" decoding="async" width="760" height="950" draggable={dragTees ? 'true' : 'false'} data-tee={design.sku} data-side="front" />
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

// Saves a canvas as a JPEG: the phone's share sheet when it can, else a download.
const shareCanvas = (canvas, name, title) => new Promise((done) => {
  canvas.toBlob(async (blob) => {
    if (!blob) { done(); return; }
    const file = new File([blob], name, { type: 'image/jpeg' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
        done();
        return;
      }
    } catch (e) { if (e?.name === 'AbortError') { done(); return; } }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    done();
  }, 'image/jpeg', 0.92);
});

function TryOn({ sku, onSku, onLive }) {
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
  // Phones allow one camera at a time: the live AI panel takes it over.
  useEffect(() => {
    const free = () => { if (run.current.stream) stop(); };
    window.addEventListener('aw:live-open', free);
    return () => window.removeEventListener('aw:live-open', free);
  }, [stop]);

  const savePhoto = () => {
    if (canvasRef.current) shareCanvas(canvasRef.current, `aura-wears-${design.sku}.jpg`, `Aura Wears · ${design.name}`);
  };

  const showing = mode === 'live' || mode === 'photo';
  const shownSide = turned ? 'back' : side;

  return (
    <section className="tryon" id="try-on" aria-labelledby="tryon-title" ref={secRef}>
      <div className="tryon__head">
        <p className="tryon__kicker">Live try-on</p>
        <h2 className="tryon__title" id="tryon-title">Try it <span>on you</span></h2>
        <p className="tryon__lede">
          {onLive
            ? 'Live AI puts the tee on you as you move, folds and all. Or use the quick preview: free, and it never leaves your phone.'
            : 'Open your camera and the tee sits on you as you move. Turn around to see the back print.'}
        </p>
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
              {onLive && (
                <button type="button" className="rail-pill rail-pill--solid tryon__live" onClick={() => onLive(design.sku)}>
                  <span className="tryon__spark" aria-hidden="true" />Live AI try-on
                </button>
              )}
              <button type="button" className={`rail-pill ${onLive ? '' : 'rail-pill--solid'}`} onClick={startCamera}>
                {onLive ? 'Quick preview' : 'Start camera'}
              </button>
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
                  <img src={imgSmall(d.images[0])} onError={imgFallback(d.images[0])} alt="" width="480" height="600" loading="lazy"
                       draggable={onLive ? 'true' : 'false'} data-tee={d.sku} data-side="front" />
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

/* ------------------------------------------------------------------
   Live AI try-on, like the Anywear extension (anywear.decart.ai).
   Decart's Lucy VTON model redraws the chosen tee onto the visitor's
   live camera, with real fabric movement, a second or two after it is
   picked. Drag any tee on the page (or any clothing picture) onto the
   panel, or pick one from its strip; switching keeps the same session.
   - The SDK loads from jsDelivr only when someone taps Start camera.
   - netlify/functions/tryon-token.mjs hands out a one-session token and
     caps length, daily total and per-visitor use (billed per second).
   - Without DECART_API_KEY on Netlify the panel never shows and every
     "Try it on" opens the free quick preview instead.
   ------------------------------------------------------------------ */
const DECART_SDK = 'https://cdn.jsdelivr.net/npm/@decartai/sdk@0.2.14/+esm';
const TOKEN_URL = '/.netlify/functions/tryon-token';
const ANY_TOP = 'Substitute the current top with the garment in the reference image, keeping its exact colour, print, fabric and fit';
const TEE_DRAG = 'application/x-aura-tee';

let liveStatusPromise = null;
const getLiveStatus = () => {
  if (!liveStatusPromise) {
    liveStatusPromise = fetch(TOKEN_URL, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .catch(() => ({ enabled: false }));
  }
  return liveStatusPromise;
};
const useLiveStatus = () => {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    let alive = true;
    getLiveStatus().then((s) => { if (alive) setStatus(s); });
    return () => { alive = false; };
  }, []);
  return status;
};

// A garment picture as the model likes it: JPEG on white, at most 1024 px.
const garmentBlob = async (src) => {
  const img = await loadImage(src);
  const k = Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('image'))), 'image/jpeg', 0.92));
};

// Which of our tees a dragged picture's address points at, if any.
const teeFromUrl = (url) => {
  if (!url) return null;
  for (const d of DESIGNS) {
    for (let i = 0; i < 2; i += 1) {
      const stem = d.images[i].replace(/\.v2\.png$/, '');
      if (url.includes(stem)) return { sku: d.sku, side: i ? 'back' : 'front' };
    }
  }
  return null;
};

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const garmentKey = (g) => (g.custom ? `custom:${g.custom.url}` : `${g.sku}:${g.side}`);

function LiveTryOn({ request, onClose, onFallback }) {
  const { picks, pick, unpick } = usePicks();
  const [garment, setGarment] = useState({ sku: request.sku, side: 'front', custom: null });
  const [phase, setPhase] = useState('idle');        // idle | camera | connecting | live | ended
  const [message, setMessage] = useState('');        // why it ended
  const [offerPreview, setOfferPreview] = useState(false);
  const [queue, setQueue] = useState(null);
  const [left, setLeft] = useState(0);
  const [weak, setWeak] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [note, setNote] = useState('');
  const [pos, setPos] = useState(null);

  const panelRef = useRef(null);
  const stripRef = useRef(null);
  const startRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const returnFocus = useRef(null);
  const run = useRef({ rt: null, stream: null, timer: 0, token: 0, limit: 60, began: 0, applied: '' });
  const garmentRef = useRef(garment);
  garmentRef.current = garment;

  const design = DESIGNS.find((d) => d.sku === garment.sku) || DESIGNS[0];
  const picked = picks[design.sku];
  const live = phase === 'live';

  // A newer "Try it on" click while open swaps the tee.
  useEffect(() => { setGarment({ sku: request.sku, side: 'front', custom: null }); }, [request]);

  // Keep the chosen tee (or a dropped picture, at the end) in view in the strip.
  useEffect(() => {
    const strip = stripRef.current;
    const on = strip?.querySelector('.is-active');
    if (on) strip.scrollTo({ left: on.offsetLeft - strip.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' });
  }, [garment]);

  const flash = useCallback((text) => {
    setNote(text);
    clearTimeout(run.current.noteTimer);
    run.current.noteTimer = setTimeout(() => setNote(''), 4200);
  }, []);

  const inputFor = useCallback(async (g) => {
    if (g.custom) return { image: g.custom.blob, prompt: ANY_TOP, enhance: true };
    const d = DESIGNS.find((x) => x.sku === g.sku) || DESIGNS[0];
    const i = g.side === 'back' ? 1 : 0;
    const image = await garmentBlob(imgSrc(d.images[i])).catch(() => garmentBlob(d.images[i]));
    const prompt = d.tryOn?.[g.side] || ANY_TOP;
    return { image, prompt, enhance: !d.tryOn?.[g.side] };
  }, []);

  // Stops everything that costs money or holds the camera.
  const teardown = useCallback(() => {
    const r = run.current;
    r.token += 1;
    clearInterval(r.timer);
    r.timer = 0;
    try { r.rt?.disconnect(); } catch { /* already closed */ }
    r.rt = null;
    r.stream?.getTracks().forEach((t) => t.stop());
    r.stream = null;
    [localRef, remoteRef].forEach((v) => { if (v.current) v.current.srcObject = null; });
    setQueue(null);
    setWeak(false);
    setReconnecting(false);
    setSwitching(false);
  }, []);

  const end = useCallback((text, preview = false) => {
    teardown();
    setPhase(text ? 'ended' : 'idle');
    setMessage(text || '');
    setOfferPreview(preview);
  }, [teardown]);

  const goLive = useCallback(() => {
    const r = run.current;
    if (r.timer) return;
    r.began = performance.now();
    setLeft(r.limit);
    setPhase('live');
    setQueue(null);
    r.timer = setInterval(() => {
      const remain = Math.max(0, Math.ceil(r.limit - (performance.now() - r.began) / 1000));
      setLeft(remain);
      if (!remain) end('That’s your minute. Start again to try another look.');
    }, 250);
  }, [end]);

  const start = async () => {
    const r = run.current;
    teardown();
    const id = run.current.token;
    setMessage('');
    setOfferPreview(false);
    if (!navigator.mediaDevices?.getUserMedia) { end('This browser can’t open the camera here.', true); return; }
    setPhase('camera');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } },
      });
    } catch (e) {
      if (id !== r.token) return;
      end(e?.name === 'NotAllowedError' || e?.name === 'SecurityError'
        ? 'Camera access was blocked. Allow the camera for this site, then start again.'
        : 'No camera found on this device.', true);
      return;
    }
    if (id !== r.token) { stream.getTracks().forEach((t) => t.stop()); return; }
    r.stream = stream;
    if (localRef.current) { localRef.current.srcObject = stream; localRef.current.play().catch(() => {}); }
    setPhase('connecting');
    try {
      const startGarment = garmentRef.current;
      const [token, sdk, input] = await Promise.all([
        fetch(TOKEN_URL, { method: 'POST' }).then(async (res) => ({ ok: res.ok, ...(await res.json().catch(() => ({}))) })),
        import(/* @vite-ignore */ DECART_SDK),
        inputFor(startGarment),
      ]);
      if (id !== r.token) return;
      if (!token.ok || !token.apiKey) { end(token.message || 'Live try-on is unavailable right now.', true); return; }
      r.limit = Math.max(10, (token.seconds || 65) - 5);
      const client = sdk.createDecartClient({ apiKey: token.apiKey });
      const rt = await client.realtime.connect(stream, {
        model: sdk.models.realtime('lucy-vton-latest'),
        mirror: 'auto',
        retries: 2,
        capacityRetryBudgetMs: 25000,
        initialState: { image: input.image, prompt: { text: input.prompt, enhance: input.enhance } },
        onRemoteStream: (s) => {
          if (id !== run.current.token) return;
          const v = remoteRef.current;
          if (v) { v.srcObject = s; v.play().catch(() => {}); }
        },
        onQueuePosition: (q) => { if (id === run.current.token) setQueue(q); },
        onCapacityWait: () => { if (id === run.current.token) setQueue((q) => q || { position: 0, queueSize: 0 }); },
        onConnectionQuality: (q) => { if (id === run.current.token) setWeak(!q.warmingUp && (q.quality === 'poor' || q.quality === 'critical')); },
      });
      if (id !== r.token) { rt.disconnect(); return; }
      r.rt = rt;
      r.applied = garmentKey(startGarment);
      rt.on('connectionChange', (state) => {
        if (id !== run.current.token) return;
        setReconnecting(state === 'reconnecting');
        if (state === 'generating') goLive();
      });
      rt.on('sessionEnded', ({ reason }) => {
        if (id !== run.current.token) return;
        if (reason === 'insufficient_credits') end('Live try-on is resting for now. Try the quick preview.', true);
        else if (reason === 'session_limit') end('Lots of people are trying on right now. Try again in a minute.', true);
        else if (reason === 'moderation_violation') end('The try-on stopped. Start again, facing the camera.');
        else end('That’s your minute. Start again to try another look.');
      });
      rt.on('error', () => {
        if (id === run.current.token && !rt.isConnected()) end('The connection dropped. Start again to keep trying on.', true);
      });
      if (rt.getConnectionState() === 'generating') goLive();
    } catch (e) {
      if (id !== r.token) return;
      const text = /api key|token/i.test(String(e?.message)) ? 'Live try-on is unavailable right now.' : 'Couldn’t reach the try-on. Check your connection and start again.';
      end(text, true);
    }
  };

  // Put on the chosen tee without reconnecting.
  useEffect(() => {
    const r = run.current;
    if (!live || !r.rt) return undefined;
    const key = garmentKey(garment);
    if (r.applied === key) return undefined;
    r.applied = key;
    let alive = true;
    setSwitching(true);
    inputFor(garment)
      .then((input) => (alive && r.rt ? r.rt.setImage(input.image, { prompt: input.prompt, enhance: input.enhance }) : null))
      .catch(() => { if (alive) flash('Couldn’t put that on. Try another one.'); })
      .finally(() => { if (alive) setSwitching(false); });
    return () => { alive = false; };
  }, [garment, live, inputFor, flash]);

  const close = useCallback(() => {
    teardown();
    onClose();
  }, [teardown, onClose]);

  // Tees on the page carry data-tee; dragging one tells the drop which tee it is.
  useEffect(() => {
    const onDragStart = (e) => {
      const el = e.target?.closest?.('[data-tee]');
      if (el && e.dataTransfer) e.dataTransfer.setData(TEE_DRAG, `${el.dataset.tee}|${el.dataset.side || 'front'}`);
    };
    document.addEventListener('dragstart', onDragStart);
    return () => document.removeEventListener('dragstart', onDragStart);
  }, []);

  // Leaving the page pauses it (no paying for a hidden tab). Esc closes.
  useEffect(() => {
    const onHide = () => { if (document.hidden && run.current.stream) end('Paused while you were away. Start again when you’re back.'); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('visibilitychange', onHide); window.removeEventListener('keydown', onKey); };
  }, [end, close]);

  // Focus moves into the panel, and back to the button that opened it.
  useEffect(() => {
    returnFocus.current = document.activeElement;
    startRef.current?.focus({ preventScroll: true });
    const back = returnFocus.current;
    return () => {
      teardown();
      clearTimeout(run.current.noteTimer);
      if (back && document.contains(back)) back.focus({ preventScroll: true });
    };
  }, [teardown]);

  // Drag the panel around by its top bar (desktop).
  const dragPanel = (e) => {
    if (e.target.closest('button') || window.matchMedia('(max-width: 640px)').matches) return;
    const el = panelRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const dx = e.clientX - box.left;
    const dy = e.clientY - box.top;
    const move = (ev) => {
      const x = Math.min(Math.max(8, ev.clientX - dx), window.innerWidth - box.width - 8);
      const y = Math.min(Math.max(8, ev.clientY - dy), window.innerHeight - 80);
      setPos({ x, y });
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Dropping a tee from the page, a picture file, or a picture from another site.
  const canDrop = (dt) => dt && [...dt.types].some((t) => t === TEE_DRAG || t === 'Files' || t === 'text/uri-list');
  const onDragOver = (e) => {
    if (!canDrop(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropping(true);
  };
  const onDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDropping(false); };
  const onDrop = async (e) => {
    e.preventDefault();
    setDropping(false);
    const dt = e.dataTransfer;
    const own = dt.getData(TEE_DRAG);
    if (own) {
      const [s, side] = own.split('|');
      if (DESIGNS.some((d) => d.sku === s)) { setGarment({ sku: s, side: side === 'back' ? 'back' : 'front', custom: null }); return; }
    }
    const url = (dt.getData('text/uri-list') || dt.getData('text/plain') || '').split('\n')[0].trim();
    const ours = teeFromUrl(url);
    if (ours) { setGarment({ ...ours, custom: null }); return; }
    let blob = [...(dt.files || [])].find((f) => f.type.startsWith('image/')) || null;
    if (!blob && /^https?:\/\//.test(url)) {
      try {
        const res = await fetch(url, { mode: 'cors' });
        const b = res.ok ? await res.blob() : null;
        if (b?.type.startsWith('image/')) blob = b;
      } catch { /* the other site does not share its pictures */ }
    }
    if (!blob) { flash('Couldn’t read that picture. Save it, then drop the file here.'); return; }
    const preview = URL.createObjectURL(blob);
    try {
      const jpg = await garmentBlob(preview);
      setGarment((g) => ({ sku: g.sku, side: 'front', custom: { blob: jpg, url: preview } }));
    } catch {
      flash('Couldn’t read that picture. Try another one.');
    }
  };

  const photo = async () => {
    const v = remoteRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(v, 0, 0, c.width, c.height);
    try {
      const lg = await loadImage(LOGO);
      const w = Math.min(c.width, c.height) * 0.26;
      ctx.globalAlpha = 0.92;
      ctx.drawImage(lg, c.width - w - c.width * 0.04, c.height - w * (lg.naturalHeight / lg.naturalWidth) - c.height * 0.03, w, w * (lg.naturalHeight / lg.naturalWidth));
    } catch { /* photo without the logo */ }
    shareCanvas(c, `aura-wears-${garment.custom ? 'try-on' : design.sku}.jpg`, `Aura Wears · ${garment.custom ? 'Try-on' : design.name}`);
  };

  const busy = phase === 'camera' || phase === 'connecting';
  const name = garment.custom ? 'your pick' : design.name;
  const poster = garment.custom ? garment.custom.url : imgSrc(design.images[garment.side === 'back' ? 1 : 0]);

  return createPortal(
    <div ref={panelRef} className={`lv lv--${phase} ${pos ? 'is-moved' : ''}`} role="dialog" aria-modal="false" aria-labelledby="lv-title"
         style={pos ? { left: `${pos.x}px`, top: `${pos.y}px` } : undefined}>
      <div className="lv__bar" onPointerDown={dragPanel}>
        <img className="lv__logo" src={LOGO} alt="" width="900" height="368" draggable="false" />
        <p className="lv__title" id="lv-title">Try-On <span>· Live AI</span></p>
        {live && <span className="lv__clock" aria-label={`${left} seconds left`}>{clock(left)}</span>}
        <button type="button" className="lv__x" onClick={close} aria-label="Close the try-on">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className={`lv__stage ${dropping ? 'is-drop' : ''}`} onDragEnter={onDragOver} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <video ref={localRef} className={`lv__local ${busy ? 'is-on' : ''}`} playsInline muted aria-hidden="true" />
        <video ref={remoteRef} className={`lv__remote ${live ? 'is-on' : ''}`} playsInline muted aria-label={`You wearing ${name}, live`} />

        {(phase === 'idle' || phase === 'ended') && (
          <div className="lv__poster">
            <img key={poster} src={poster} alt="" draggable="false" />
          </div>
        )}
        {phase === 'idle' && (
          <div className="lv__cue">
            <button ref={startRef} type="button" className="rail-pill rail-pill--solid" onClick={start}>Start camera</button>
            <p>See it on you in about a second. Move, turn, raise your arms.</p>
          </div>
        )}
        {phase === 'ended' && (
          <div className="lv__cue lv__cue--ended" role="status">
            <p className="lv__ended">{message}</p>
            <button ref={startRef} type="button" className="rail-pill rail-pill--solid" onClick={start}>Start again</button>
            {offerPreview && <button type="button" className="lv__link" onClick={() => onFallback(garment.sku)}>Use the quick preview</button>}
          </div>
        )}
        {busy && (
          <p className="lv__status" role="status">
            {queue
              ? (queue.position > 0 ? `You’re number ${queue.position} in line…` : 'Busy right now. Waiting for a free spot…')
              : phase === 'camera' ? 'Opening your camera…' : 'Getting your fitting room ready…'}
          </p>
        )}
        {live && <span className="lv__badge">Live</span>}
        {live && (weak || reconnecting) && <span className="lv__weak" role="status">{reconnecting ? 'Reconnecting…' : 'Weak connection'}</span>}
        {live && switching && <p className="lv__status lv__status--top" role="status">Putting on {name}…</p>}
        {dropping && <div className="lv__drop" aria-hidden="true"><span>Drop to try it on</span></div>}
        {note && <p className="lv__note-flash" role="status">{note}</p>}
        {live && !note && !switching && <p className="lv__hint">Drag any tee here</p>}
      </div>

      <div className="lv__panel">
        <div className="lv__strip" role="group" aria-label="Tee to try on" ref={stripRef}>
          {DESIGNS.map((d) => (
            <button key={d.sku} type="button" className={`lv__tee ${!garment.custom && d.sku === garment.sku ? 'is-active' : ''}`}
                    aria-pressed={!garment.custom && d.sku === garment.sku} aria-label={d.name}
                    onClick={() => setGarment((g) => ({ sku: d.sku, side: g.custom ? 'front' : g.side, custom: null }))}>
              <img src={imgSmall(d.images[0])} onError={imgFallback(d.images[0])} alt="" width="480" height="600" loading="lazy" draggable="false" />
            </button>
          ))}
          {garment.custom && (
            <span className="lv__tee is-active lv__tee--own" title="Your picture">
              <img src={garment.custom.url} alt="Your picture" draggable="false" />
            </span>
          )}
        </div>

        <div className="lv__row">
          <div className="tryon__seg lv__seg" role="group" aria-label="Which print">
            {['front', 'back'].map((s) => (
              <button key={s} type="button" className={!garment.custom && garment.side === s ? 'is-active' : ''} aria-pressed={!garment.custom && garment.side === s}
                      disabled={Boolean(garment.custom)} onClick={() => setGarment((g) => ({ ...g, side: s }))}>
                {s === 'front' ? 'Front' : 'Back'}
              </button>
            ))}
          </div>
          <button type="button" className="rail-pill rail-pill--solid lv__shot" onClick={photo} disabled={!live}>Take photo</button>
        </div>

        {!garment.custom && (
          <div className="lv__size">
            <p><b>{design.name}</b>{picked ? <span> · In your picks · {picked}</span> : <span> · pick a size to pre-order</span>}</p>
            <div className="lv__sizes" role="group" aria-label={`Size for ${design.name}`}>
              {design.sizes.map((s) => (
                <button key={s} type="button" className={s === picked ? 'is-active' : ''} aria-pressed={s === picked}
                        onClick={() => (s === picked ? unpick(design.sku) : pick(design.sku, s))}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <p className="lv__legal">AI by Decart. Your camera video goes to Decart to draw the tee on you; Aura Wears doesn’t record it. Up to a minute per try-on.</p>
      </div>
    </div>,
    document.body,
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
  const live = useLiveStatus();                        // { enabled } once the site has answered
  const liveOn = Boolean(live?.enabled);
  const [liveAsk, setLiveAsk] = useState(null);        // { sku, n } while the live panel is open
  const openLive = useCallback((sku) => {
    window.dispatchEvent(new Event('aw:live-open'));
    setLiveAsk((a) => ({ sku, n: (a?.n || 0) + 1 }));
  }, []);
  const openPreview = useCallback((sku) => { setTryOn(sku); goTo('try-on'); }, []);
  const openTryOn = useCallback((sku) => (liveOn ? openLive(sku) : openPreview(sku)), [liveOn, openLive, openPreview]);
  const closeLive = useCallback(() => setLiveAsk(null), []);
  const liveToPreview = useCallback((sku) => { setLiveAsk(null); openPreview(sku); }, [openPreview]);
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
        {DESIGNS.map((d, i) => <Showcase key={d.sku} design={d} index={i} total={DESIGNS.length} onTry={openTryOn} dragTees={liveOn} />)}
      </section>

      <TryOn sku={tryOn} onSku={setTryOn} onLive={liveOn ? openLive : null} />
      {liveAsk && <LiveTryOn request={liveAsk} onClose={closeLive} onFallback={liveToPreview} />}

      <InterestForm />
      <PickBar />
    </main>
  );
}
