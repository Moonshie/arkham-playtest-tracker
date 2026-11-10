// Optional Cloudflare Pages Functions backend. Requires a D1 binding named DB
// and a secret environment variable named PLAYTEST_PASSWORD.
function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  });
}

export async function onRequest({ request, env }) {
  if (!env.DB || !env.PLAYTEST_PASSWORD) return json({ error: 'Shared sync is not configured.' }, 503);
  if (request.headers.get('Authorization') !== `Bearer ${env.PLAYTEST_PASSWORD}`) {
    return json({ error: 'Incorrect sharing password.' }, 401);
  }
  try {
    if (request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, data FROM progress').all();
      const cards = {};
      for (const row of results) {
        try { cards[row.id] = JSON.parse(row.data); } catch { /* ignore corrupt row */ }
      }
      return json({ cards });
    }
    if (request.method === 'PUT') {
      const body = await request.text();
      if (body.length > 50000) return json({ error: 'Entry is too large.' }, 413);
      let entry;
      try { entry = JSON.parse(body); } catch { return json({ error: 'Invalid JSON.' }, 400); }
      if (!entry || typeof entry.id !== 'string' || entry.id.length > 250 || !entry.id.length ||
          !entry.data || typeof entry.data !== 'object' || Array.isArray(entry.data)) {
        return json({ error: 'Invalid entry.' }, 400);
      }
      await env.DB.prepare('INSERT INTO progress (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
        .bind(entry.id, JSON.stringify(entry.data), Date.now()).run();
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed.' }, 405);
  } catch (err) {
    console.error(err);
    return json({ error: 'Sync storage error.' }, 500);
  }
}
