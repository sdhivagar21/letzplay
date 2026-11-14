/* ------------------------------------------------------------------
   Lite mode for weak devices.
   Adds the class "lite" to <html>, which switches off the looping
   animations and the costly shadows (see "LITE MODE" in index.css).

   It turns on when the device reports little memory, few processor
   cores or data-saver, or when the page is measured running slowly
   during its first seconds.
   ------------------------------------------------------------------ */
const root = document.documentElement;
export const isLite = () => root.classList.contains('lite');

export function initPerf() {
  const nav = navigator;
  const conn = nav.connection || {};
  const weak =
    (nav.deviceMemory && nav.deviceMemory <= 2) ||
    (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) ||
    conn.saveData === true ||
    /(^|-)2g$/.test(conn.effectiveType || '');
  if (weak) { root.classList.add('lite'); return; }

  // Measure: count frames that take longer than ~30 fps over about a second.
  let last = 0;
  let frames = 0;
  let slow = 0;
  const tick = (t) => {
    if (document.visibilityState !== 'visible') return;       // a hidden tab is not a slow device
    if (last) { frames += 1; if (t - last > 34) slow += 1; }
    last = t;
    if (frames < 60) requestAnimationFrame(tick);
    else if (slow / frames > 0.3) root.classList.add('lite');
  };
  const start = () => setTimeout(() => requestAnimationFrame(tick), 1800);   // after the entrance animations
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
