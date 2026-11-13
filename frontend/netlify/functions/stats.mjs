import { getStore } from '@netlify/blobs';

// Visitor numbers for the admin page. Needs the passcode stored in the
// ADMIN_KEY environment variable of the Netlify site.
const dayAt = (offset) => new Date(Date.now() + 5.5 * 3600e3 - offset * 864e5).toISOString().slice(0, 10);

export default async (req) => {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return Response.json({ message: 'ADMIN_KEY is not set on the site' }, { status: 503 });
  if (req.headers.get('x-admin-key') !== expected) return Response.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const store = getStore({ name: 'stats', consistency: 'strong' });
    const data = (await store.get('visits', { type: 'json' })) || { total: 0, days: {} };
    const days = Array.from({ length: 14 }, (_, i) => ({ date: dayAt(i), count: data.days?.[dayAt(i)] || 0 }));
    return Response.json({
      total: data.total || 0,
      today: days[0].count,
      week: days.slice(0, 7).reduce((n, d) => n + d.count, 0),
      days,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('stats_failed', err?.message);
    return Response.json({ message: 'Could not read the count' }, { status: 500 });
  }
};
