import { openDB, type IDBPDatabase } from 'idb';
import type { Progress, QuizResult, ReviewLog, Settings, Word } from './types';

export type StoreName = 'words' | 'progress' | 'reviews' | 'quiz' | 'kv';
export const SYNC_STORES: StoreName[] = ['words', 'progress', 'reviews', 'quiz', 'kv'];

interface OutboxItem {
  key: string; // `${store}:${id}`
  store: StoreName;
  id: string;
  updatedAt: number;
}

let dbp: Promise<IDBPDatabase> | null = null;
export function db() {
  if (!dbp) {
    dbp = openDB('study-german', 1, {
      upgrade(d) {
        d.createObjectStore('words', { keyPath: 'id' });
        d.createObjectStore('progress', { keyPath: 'id' });
        const r = d.createObjectStore('reviews', { keyPath: 'id' });
        r.createIndex('at', 'at');
        d.createObjectStore('quiz', { keyPath: 'id' });
        d.createObjectStore('kv', { keyPath: 'id' });
        d.createObjectStore('outbox', { keyPath: 'key' });
        d.createObjectStore('local', { keyPath: 'id' });
      },
    });
  }
  return dbp;
}

type Rec = { id: string; updatedAt?: number };

export async function getAll<T>(store: StoreName): Promise<T[]> {
  return (await db()).getAll(store) as Promise<T[]>;
}

/** 書き込み (同期対象として outbox に記録) */
export async function put<T extends Rec>(store: StoreName, rec: T) {
  const d = await db();
  const tx = d.transaction([store, 'outbox'], 'readwrite');
  await tx.objectStore(store).put(rec);
  await tx.objectStore('outbox').put({ key: `${store}:${rec.id}`, store, id: rec.id, updatedAt: rec.updatedAt ?? Date.now() } satisfies OutboxItem);
  await tx.done;
}

export async function putMany<T extends Rec>(store: StoreName, recs: T[]) {
  const d = await db();
  const tx = d.transaction([store, 'outbox'], 'readwrite');
  for (const rec of recs) {
    await tx.objectStore(store).put(rec);
    await tx.objectStore('outbox').put({ key: `${store}:${rec.id}`, store, id: rec.id, updatedAt: rec.updatedAt ?? Date.now() });
  }
  await tx.done;
}

/** サーバーから受け取った変更を適用 (新しいものだけ、outbox には積まない) */
export async function applyRemote(changes: { store: StoreName; id: string; data: Rec }[]): Promise<number> {
  if (!changes.length) return 0;
  const d = await db();
  const stores = Array.from(new Set(changes.map((c) => c.store))).filter((s) => SYNC_STORES.includes(s));
  if (!stores.length) return 0;
  const tx = d.transaction(stores, 'readwrite');
  let n = 0;
  for (const c of changes) {
    if (!stores.includes(c.store)) continue;
    const os = tx.objectStore(c.store);
    const cur = (await os.get(c.id)) as Rec | undefined;
    if (!cur || (c.data.updatedAt ?? 0) > (cur.updatedAt ?? 0)) {
      await os.put(c.data);
      n++;
    }
  }
  await tx.done;
  return n;
}

export async function outbox(): Promise<OutboxItem[]> {
  return (await db()).getAll('outbox');
}

export async function readRecords(items: OutboxItem[]) {
  const d = await db();
  const out: { store: StoreName; id: string; data: Rec; updatedAt: number }[] = [];
  for (const it of items) {
    const data = (await d.get(it.store, it.id)) as Rec | undefined;
    if (data) out.push({ store: it.store, id: it.id, data, updatedAt: data.updatedAt ?? it.updatedAt });
  }
  return out;
}

export async function clearOutbox(items: { store: StoreName; id: string; updatedAt: number }[]) {
  const d = await db();
  const tx = d.transaction('outbox', 'readwrite');
  for (const it of items) {
    const key = `${it.store}:${it.id}`;
    const cur = (await tx.store.get(key)) as OutboxItem | undefined;
    if (cur && cur.updatedAt <= it.updatedAt) await tx.store.delete(key);
  }
  await tx.done;
}

/** 端末ローカルの設定 (同期しない: 同期コードやカーソル) */
export async function getLocal<T>(id: string): Promise<T | undefined> {
  const r = await (await db()).get('local', id);
  return r?.value as T | undefined;
}
export async function setLocal(id: string, value: unknown) {
  await (await db()).put('local', { id, value });
}

export async function exportAll() {
  const d = await db();
  const res: Record<string, unknown[]> = {};
  for (const s of SYNC_STORES) res[s] = await d.getAll(s);
  return { app: 'study-german', version: 1, exportedAt: Date.now(), data: res };
}

export async function importAll(json: { data: Record<string, Rec[]> }) {
  const changes: { store: StoreName; id: string; data: Rec }[] = [];
  for (const s of SYNC_STORES) for (const r of json.data[s] || []) changes.push({ store: s, id: r.id, data: r });
  const n = await applyRemote(changes);
  // インポートしたものは他端末にも送る
  const d = await db();
  const tx = d.transaction('outbox', 'readwrite');
  for (const c of changes) await tx.store.put({ key: `${c.store}:${c.id}`, store: c.store, id: c.id, updatedAt: c.data.updatedAt });
  await tx.done;
  return n;
}

export type { Word, Progress, ReviewLog, QuizResult, Settings };
