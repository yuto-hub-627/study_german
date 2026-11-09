/// <reference types="@cloudflare/workers-types" />
/**
 * Cloudflare Worker: 静的ファイル(PWA)の配信 + /api/sync (D1)
 */
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

const STORES = new Set(['words', 'progress', 'reviews', 'quiz', 'kv']);
const MAX_CHANGES = 500;
const PAGE = 1000;
const MAX_BODY = 2_000_000;

interface Change {
  store: string;
  id: string;
  updatedAt: number;
  data: unknown;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function handleSync(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  const auth = req.headers.get('authorization') || '';
  const code = auth.replace(/^Bearer\s+/i, '').trim().toUpperCase();
  if (!/^[A-Z2-9]{5}(-[A-Z2-9]{5}){3}$/.test(code)) return json({ error: 'invalid sync code' }, 401);
  const len = Number(req.headers.get('content-length') || 0);
  if (len > MAX_BODY) return json({ error: 'payload too large' }, 413);
  let body: { cursor?: number; changes?: Change[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const cursor = Number.isFinite(body.cursor) ? Number(body.cursor) : 0;
  const changes = (Array.isArray(body.changes) ? body.changes : []).filter(
    (c) => c && STORES.has(c.store) && typeof c.id === 'string' && c.id.length <= 200 && Number.isFinite(c.updatedAt),
  );
  if (changes.length > MAX_CHANGES) return json({ error: 'too many changes' }, 413);

  const user = await sha256('study-german:' + code);
  const now = Date.now();
  await env.DB.prepare('INSERT OR IGNORE INTO users (id, seq, created_at) VALUES (?, 0, ?)').bind(user, now).run();

  let pushedMax = 0;
  if (changes.length) {
    const row = await env.DB.prepare('UPDATE users SET seq = seq + ? WHERE id = ? RETURNING seq')
      .bind(changes.length, user)
      .first<{ seq: number }>();
    const end = row!.seq;
    const start = end - changes.length + 1;
    const stmt = env.DB.prepare(
      `INSERT INTO records (user_id, store, id, data, updated_at, seq) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, store, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at, seq = excluded.seq
       WHERE excluded.updated_at > records.updated_at`,
    );
    await env.DB.batch(
      changes.map((c, i) => stmt.bind(user, c.store, c.id, JSON.stringify(c.data).slice(0, 100_000), c.updatedAt, start + i)),
    );
    pushedMax = end;
  }

  // cursor より新しいもの (自分が今送ったものは除く) を返す
  const sent = new Set(changes.map((c) => `${c.store}:${c.id}:${c.updatedAt}`));
  const { results } = await env.DB.prepare(
    'SELECT store, id, data, updated_at, seq FROM records WHERE user_id = ? AND seq > ? ORDER BY seq LIMIT ?',
  )
    .bind(user, cursor, PAGE + 1)
    .all<{ store: string; id: string; data: string; updated_at: number; seq: number }>();
  const more = results.length > PAGE;
  const page = results.slice(0, PAGE);
  const out = page
    .filter((r) => !sent.has(`${r.store}:${r.id}:${r.updated_at}`))
    .map((r) => ({ store: r.store, id: r.id, data: JSON.parse(r.data) }));
  const last = page.length ? page[page.length - 1].seq : cursor;
  const newCursor = more ? last : Math.max(last, pushedMax, cursor);
  return json({ cursor: newCursor, more, changes: out });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/sync') {
      try {
        return await handleSync(req, env);
      } catch (e) {
        return json({ error: 'internal error', detail: String(e) }, 500);
      }
    }
    if (url.pathname === '/api/health') return json({ ok: true });
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
