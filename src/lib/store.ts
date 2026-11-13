import { useEffect, useState, useSyncExternalStore } from 'react';
import textbook from '../data/textbook.json';
import * as db from './db';
import { newProgress, review } from './srs';
import type { Book, Grade, Progress, QuizResult, ReviewLog, Settings, Word } from './types';

const TEXTBOOK = textbook as Word[];

const DEFAULT_SETTINGS: Settings = { rate: 0.9, dailyNew: 15, direction: 'de-ja', lessonsFilter: [] };

interface State {
  ready: boolean;
  words: Word[]; // 教科書 + ユーザー (削除済み除く)
  wordMap: Map<string, Word>;
  progress: Map<string, Progress>;
  reviews: ReviewLog[];
  quiz: Map<string, QuizResult>;
  settings: Settings;
  books: Book[];
  syncStatus: { state: 'idle' | 'syncing' | 'error' | 'off'; message?: string; at?: number };
}

let state: State = {
  ready: false,
  words: TEXTBOOK,
  wordMap: new Map(TEXTBOOK.map((w) => [w.id, w])),
  progress: new Map(),
  reviews: [],
  quiz: new Map(),
  settings: DEFAULT_SETTINGS,
  books: [],
  syncStatus: { state: 'off' },
};
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function set(p: Partial<State>) {
  state = { ...state, ...p };
  emit();
}
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function getState() {
  return state;
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state));
}

let changeHook: (() => void) | null = null;
export function onLocalChange(fn: () => void) {
  changeHook = fn;
}
function changed() {
  changeHook?.();
}

function mergeWords(user: Word[]): Word[] {
  const over = new Map(user.map((w) => [w.id, w]));
  const out: Word[] = [];
  for (const t of TEXTBOOK) {
    const o = over.get(t.id);
    if (o) {
      over.delete(t.id);
      if (!o.deleted) out.push({ ...t, ...o, src: 'textbook' });
    } else out.push(t);
  }
  for (const w of over.values()) if (!w.deleted) out.push(w);
  return out;
}

export async function reload() {
  const [user, prog, revs, quiz, kv, books] = await Promise.all([
    db.getAll<Word>('words'),
    db.getAll<Progress>('progress'),
    db.getAll<ReviewLog>('reviews'),
    db.getAll<QuizResult>('quiz'),
    db.getAll<{ id: string; value: unknown; updatedAt: number }>('kv'),
    db.getAll<Book>('books'),
  ]);
  const words = mergeWords(user);
  // 最初から「MY単語」フォルダーを用意 (固定IDなので端末間で重複しない)
  if (!books.some((b) => b.id === DEFAULT_FOLDER)) {
    const def: Book = { id: DEFAULT_FOLDER, kind: 'folder', name: 'MY単語', createdAt: 0, updatedAt: 1 };
    await db.put('books', def);
    books.push(def);
  }
  const s = kv.find((x) => x.id === 'settings')?.value as Partial<Settings> | undefined;
  set({
    ready: true,
    words,
    wordMap: new Map(words.map((w) => [w.id, w])),
    progress: new Map(prog.map((p) => [p.id, p])),
    reviews: revs.sort((a, b) => a.at - b.at),
    quiz: new Map(quiz.map((q) => [q.id, q])),
    settings: { ...DEFAULT_SETTINGS, ...(s || {}) },
    books: books.filter((b) => !b.deleted).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)),
  });
}

export const DEFAULT_FOLDER = 'f:default';

/** 単語帳の所属フォルダー (未設定・存在しない場合は「MY単語」) */
export function folderOf(b: Book, books: Book[]): string {
  return b.folderId && books.some((f) => f.kind === 'folder' && f.id === b.folderId) ? b.folderId : DEFAULT_FOLDER;
}

function newId(prefix: string) {
  return `${prefix}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export async function saveBook(b: Partial<Book> & { kind: Book['kind']; name: string }): Promise<Book> {
  const now = Date.now();
  const rec: Book = { ...b, id: b.id || newId(b.kind === 'folder' ? 'f' : 'b'), createdAt: b.createdAt ?? now, updatedAt: now } as Book;
  if (rec.kind === 'book' && !rec.wordIds) rec.wordIds = [];
  await db.put('books', rec);
  await reload();
  changed();
  return rec;
}

export async function deleteBook(b: Book) {
  const now = Date.now();
  const recs: Book[] = [{ ...b, deleted: true, updatedAt: now }];
  if (b.id === DEFAULT_FOLDER) return;
  // フォルダーを消したら中の単語帳は「MY単語」フォルダーに移す
  if (b.kind === 'folder') for (const x of state.books) if (x.folderId === b.id) recs.push({ ...x, folderId: DEFAULT_FOLDER, updatedAt: now });
  await db.putMany('books', recs);
  await reload();
  changed();
}

export async function setBookWords(bookId: string, update: (ids: string[]) => string[]) {
  const b = state.books.find((x) => x.id === bookId);
  if (!b) return;
  const ids = Array.from(new Set(update(b.wordIds || [])));
  await saveBook({ ...b, wordIds: ids });
}

export async function saveWord(w: Word) {
  const now = Date.now();
  const rec: Word = { ...w, updatedAt: now, createdAt: w.createdAt ?? now };
  if (rec.src === 'textbook') {
    // 教科書語は差分のみ上書き保存
    const base = TEXTBOOK.find((t) => t.id === w.id);
    if (base) {
      const diff: Partial<Word> & { id: string; updatedAt: number; src: 'textbook' } = { id: w.id, updatedAt: now, src: 'textbook' };
      for (const k of Object.keys(rec) as (keyof Word)[]) {
        if (k === 'updatedAt' || k === 'createdAt') continue;
        if (JSON.stringify(rec[k]) !== JSON.stringify(base[k])) (diff as Record<string, unknown>)[k] = rec[k];
      }
      await db.put('words', diff as Word);
    }
  } else await db.put('words', rec);
  await reload();
  changed();
}

export async function deleteWord(w: Word) {
  await db.put('words', { id: w.id, src: w.src, de: w.de, pos: w.pos, ja: w.ja, deleted: true, updatedAt: Date.now() } as Word);
  await reload();
  changed();
}

export async function restoreTextbookWord(id: string) {
  await db.put('words', { id, src: 'textbook', updatedAt: Date.now() } as Word);
  await reload();
  changed();
}

export async function grade(wordId: string, g: Grade) {
  const now = Date.now();
  const p = state.progress.get(wordId) || newProgress(wordId, now);
  const np = review(p, g, now);
  const log: ReviewLog = { id: `${wordId}@${now}`, wordId, at: now, grade: g, updatedAt: now };
  await db.put('progress', np);
  await db.put('reviews', log);
  const progress = new Map(state.progress);
  progress.set(wordId, np);
  set({ progress, reviews: [...state.reviews, log] });
  changed();
  return np;
}

export async function saveQuiz(lessonId: string, score: number, wrong: string[]) {
  const cur = state.quiz.get(lessonId);
  const r: QuizResult = {
    id: lessonId,
    best: Math.max(cur?.best ?? 0, score),
    last: score,
    attempts: (cur?.attempts ?? 0) + 1,
    wrong,
    updatedAt: Date.now(),
  };
  await db.put('quiz', r);
  const quiz = new Map(state.quiz);
  quiz.set(lessonId, r);
  set({ quiz });
  changed();
}

export async function saveSettings(p: Partial<Settings>) {
  const settings = { ...state.settings, ...p };
  await db.put('kv', { id: 'settings', value: settings, updatedAt: Date.now() });
  set({ settings });
  changed();
}

export function setSyncStatus(s: State['syncStatus']) {
  set({ syncStatus: s });
}

export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export { TEXTBOOK };
