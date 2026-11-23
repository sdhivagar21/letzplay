import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';

// Live AI try-on (Home.jsx, LiveTryOn): hands the page a short-lived Decart
// client token, so the secret DECART_API_KEY never reaches the browser.
//
// It also keeps the bill under control. Settings (Netlify environment variables):
//   DECART_API_KEY          your key from platform.decart.ai (try-on is off without it)
//   TRYON_SESSION_SECONDS   longest single try-on, enforced by Decart (default 65;
//                           the page ends it 5 s earlier, so visitors see 1:00)
//   TRYON_DAILY_LIMIT       try-ons per day for the whole site (default 50)
//   TRYON_PER_VISITOR       try-ons per day for one visitor (default 4)
// Each token only works for the try-on model, only from this site's own pages,
// and only for one capped session. Days are counted in India time.
//
// GET  → { enabled, seconds }  (no token, nothing counted)
// POST → { apiKey, expiresAt, seconds } or { code, message } with 429 / 503 / 502
const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const setting = (name, fallback) => {
  const n = parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export default async (req, context) => {
  const key = process.env.DECART_API_KEY;
  const seconds = Math.max(10, setting('TRYON_SESSION_SECONDS', 65));
  const daily = setting('TRYON_DAILY_LIMIT', 50);
  const perVisitor = setting('TRYON_PER_VISITOR', 4);
  const store = getStore({ name: 'tryon', consistency: 'strong' });

  let usage = { days: {} };
  try {
    usage = (await store.get('usage', { type: 'json' })) || usage;
  } catch (err) {
    console.error('tryon_usage_read_failed', err?.message);
  }
  const day = today();
  const count = usage.days?.[day] || { total: 0, who: {} };

  if (req.method === 'GET') {
    return reply({ enabled: Boolean(key) && count.total < daily, seconds });
  }
  if (req.method !== 'POST') return reply({ code: 'method', message: 'Method not allowed' }, 405);
  if (!key) return reply({ code: 'off', message: 'Live try-on is not switched on yet.' }, 503);

  // Only this site's own pages may ask for a token.
  const site = new URL(req.url).origin;
  if (req.headers.get('origin') !== site) return reply({ code: 'origin', message: 'Not allowed' }, 403);

  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown';
  const who = createHash('sha256').update(`${day}:${ip}`).digest('hex').slice(0, 16);
  if (count.total >= daily) {
    return reply({ code: 'daily', message: 'Live try-on is fully booked for today.' }, 429);
  }
  if ((count.who?.[who] || 0) >= perVisitor) {
    return reply({ code: 'visitor', message: 'You’ve used today’s live try-ons.' }, 429);
  }

  let token;
  try {
    const res = await fetch('https://api.decart.ai/v1/client/tokens', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        expiresIn: seconds + 60,
        allowedModels: ['lucy-vton-latest', 'lucy-vton-3.6'],
        allowedOrigins: [site],
        constraints: { realtime: { maxSessionDuration: seconds } },
        metadata: { site: 'aura-wears' },
      }),
    });
    if (!res.ok) {
      console.error('tryon_token_failed', res.status, (await res.text().catch(() => '')).slice(0, 300));
      return reply({ code: 'unavailable', message: 'Live try-on is unavailable right now.' }, 502);
    }
    token = await res.json();
  } catch (err) {
    console.error('tryon_token_error', err?.message);
    return reply({ code: 'unavailable', message: 'Live try-on is unavailable right now.' }, 502);
  }

  // Count it. Visitor ids are kept for today only; older days keep just the total.
  try {
    count.total = (count.total || 0) + 1;
    count.who = { ...(count.who || {}), [who]: (count.who?.[who] || 0) + 1 };
    const days = { ...(usage.days || {}), [day]: count };
    const keep = Object.keys(days).sort().slice(-60);
    usage.days = Object.fromEntries(keep.map((d) => [d, d === day ? days[d] : { total: days[d].total || 0 }]));
    await store.setJSON('usage', usage);
  } catch (err) {
    console.error('tryon_usage_write_failed', err?.message);
  }

  return reply({ apiKey: token.apiKey, expiresAt: token.expiresAt, seconds });
};
