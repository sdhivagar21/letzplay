/* ------------------------------------------------------------------
   Image helpers (kept apart from api.js so the page does not have to
   load the API client just to show pictures).
   ------------------------------------------------------------------ */

// Local pictures have a small .webp twin next to each .png (see public/images).
export const imgSrc = (src) => {
  if (!src) return '';
  let s = String(src).trim();
  if (/^(https?:)?\/\//.test(s) || s.startsWith('data:')) return s;
  if (!s.startsWith('/')) s = `/${s}`;
  return s.startsWith('/images/') ? s.replace(/\.png$/i, '.webp') : s;
};

// If a .webp twin is missing, fall back to the original file once.
export const imgFallback = (original) => (e) => {
  const el = e.currentTarget;
  if (el.dataset.fellBack) return;
  el.dataset.fellBack = '1';
  el.removeAttribute('srcset');
  let s = String(original || '').trim();
  if (s && !/^(https?:)?\/\//.test(s) && !s.startsWith('/')) s = `/${s}`;
  if (s && el.getAttribute('src') !== s) el.src = s;
};

// Tee pictures also come in a 480px-wide version for small screens.
export const imgSmall = (src) => imgSrc(src).replace(/\.webp$/i, '-480.webp');
export const teeSrcSet = (src) => `${imgSmall(src)} 480w, ${imgSrc(src)} 760w`;
