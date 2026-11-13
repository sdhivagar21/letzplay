import { getStore } from '@netlify/blobs';

// Counts one visit. The page calls this once per browser per day.
// Stored as { total, days: { 'YYYY-MM-DD': n } } with days in India time.
const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const store = getStore({ name: 'stats', consistency: 'strong' });
    const data = (await store.get('visits', { type: 'json' })) || { total: 0, days: {} };
    const day = today();
    data.total = (data.total || 0) + 1;
    data.days = data.days || {};
    data.days[day] = (data.days[day] || 0) + 1;
    // keep the daily breakdown to the last 120 days; the total keeps everything
    const keep = Object.keys(data.days).sort().slice(-120);
    data.days = Object.fromEntries(keep.map((k) => [k, data.days[k]]));
    await store.setJSON('visits', data);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('visit_failed', err?.message);
    return Response.json({ ok: false }, { status: 500 });
  }
};
