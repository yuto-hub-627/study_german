import * as db from './db';
import { getState, reload, setSyncStatus } from './store';

const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateCode(): string {
  const a = new Uint8Array(20);
  crypto.getRandomValues(a);
  const s = Array.from(a, (x) => ALPH[x % ALPH.length]).join('');
  return s.match(/.{5}/g)!.join('-');
}
export function normalizeCode(c: string): string {
  const s = c.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return s.match(/.{1,5}/g)?.join('-') ?? '';
}
export function isValidCode(c: string) {
  return /^[A-Z2-9]{5}(-[A-Z2-9]{5}){3}$/.test(c);
}

export async function getCode() {
  return db.getLocal<string>('syncCode');
}
export async function setCode(code: string | null) {
  await db.setLocal('syncCode', code);
  await db.setLocal('cursor', 0);
}

let running: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSync(delay = 2500) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void syncNow(), delay);
}

export async function syncNow(): Promise<void> {
  if (running) return running;
  running = (async () => {
    const code = await getCode();
    if (!code) {
      setSyncStatus({ state: 'off' });
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus({ state: 'error', message: 'オフラインです' });
      return;
    }
    setSyncStatus({ state: 'syncing' });
    try {
      let cursor = (await db.getLocal<number>('cursor')) ?? 0;
      const items = await db.outbox();
      let pending = await db.readRecords(items);
      let applied = 0;
      for (let round = 0; round < 50; round++) {
        const batch = pending.slice(0, 500);
        pending = pending.slice(500);
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${code}` },
          body: JSON.stringify({ cursor, changes: batch.map((c) => ({ store: c.store, id: c.id, updatedAt: c.updatedAt, data: c.data })) }),
        });
        if (!res.ok) throw new Error(`サーバーエラー (${res.status})`);
        const body = (await res.json()) as { cursor: number; more: boolean; changes: { store: db.StoreName; id: string; data: { id: string; updatedAt?: number } }[] };
        applied += await db.applyRemote(body.changes);
        await db.clearOutbox(batch);
        cursor = body.cursor;
        await db.setLocal('cursor', cursor);
        if (!body.more && pending.length === 0) break;
      }
      if (applied) await reload();
      setSyncStatus({ state: 'idle', at: Date.now(), message: applied ? `${applied}件を受信` : undefined });
    } catch (e) {
      setSyncStatus({ state: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  })().finally(() => {
    running = null;
  });
  return running;
}

export function syncState() {
  return getState().syncStatus;
}
