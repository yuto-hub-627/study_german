import type { Gender, Pos, VerbForms } from './types';

export interface LexEntry {
  w: string;
  p: Pos;
  r: number;
  ja?: string;
  en?: string[];
  g?: Gender;
  pl?: string;
  gen?: string;
  po?: number;
  wk?: number;
  v?: VerbForms;
  c?: (string | null)[];
  ipa?: string;
  /** 正規化キー (検索用) */
  k?: string;
  /** 熟語の各語の正規化キー */
  t?: string[];
}

/** 検索用の正規化: 小文字化 / ä→a ö→o ü→u ß→ss / ae,oe,ue→a,o,u 表記ゆれ吸収 */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
    .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u')
    .replace(/[^a-z]/g, '');
}

let cache: Promise<LexEntry[]> | null = null;

export function loadLexicon(): Promise<LexEntry[]> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}dict/lexicon.json`)
      .then((r) => {
        if (!r.ok) throw new Error('辞書を読み込めませんでした');
        return r.json() as Promise<LexEntry[]>;
      })
      .then((list) => {
        for (const e of list) {
          e.k = fold(e.w);
          if (e.p === 'phrase') e.t = e.w.split(/\s+/).map(fold).filter(Boolean);
        }
        return list;
      })
      .catch((e) => {
        cache = null;
        throw e;
      });
  }
  return cache;
}

/** 編集距離 (上限 max を超えたら打ち切り) */
export function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let prev2: number[] = [];
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, (prev2[j - 2] ?? v) + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

export interface Suggestion {
  e: LexEntry;
  kind: 'exact' | 'prefix' | 'fuzzy' | 'ja';
  dist?: number;
}

const SEP_PREFIXES = ['ab', 'an', 'auf', 'aus', 'bei', 'ein', 'fern', 'fest', 'her', 'hin', 'los', 'mit', 'nach', 'vor', 'weg', 'zu', 'zurück', 'zusammen', 'statt', 'teil', 'kennen', 'spazieren'];

/** 入力 q に対する予測候補 */
export function suggest(list: LexEntry[], q: string, limit = 8): Suggestion[] {
  let raw = q.trim();
  if (!raw) return [];
  // 日本語で検索
  if (/[぀-ヿ一-鿿]/.test(raw)) {
    const out: Suggestion[] = [];
    for (const e of list) {
      if (e.ja && e.ja.includes(raw)) {
        out.push({ e, kind: 'ja' });
        if (out.length >= limit * 3) break;
      }
    }
    out.sort((a, b) => (a.e.ja!.startsWith(raw) ? 0 : 1) - (b.e.ja!.startsWith(raw) ? 0 : 1) || a.e.r - b.e.r);
    return out.slice(0, limit);
  }
  raw = raw.replace(/^(der|die|das|sich)\s+/i, '');
  const k = fold(raw);
  if (!k) return [];
  const exact: Suggestion[] = [];
  const prefix: Suggestion[] = [];
  for (const e of list) {
    const ek = e.k!;
    if (ek === k) exact.push({ e, kind: 'exact' });
    else if (ek.startsWith(k)) prefix.push({ e, kind: 'prefix' });
  }
  // 原文と大文字小文字まで一致するものを先頭に
  exact.sort((a, b) => (a.e.w === raw ? 0 : 1) - (b.e.w === raw ? 0 : 1) || a.e.r - b.e.r);
  // 日本語訳のない熟語は後ろへ
  const score = (e: LexEntry) => e.r + (e.p === 'phrase' && !e.ja ? 30000 : 0);
  prefix.sort((a, b) => score(a.e) - score(b.e) || a.e.w.length - b.e.w.length);
  // 単語を含む熟語 (例: "Hause" → zu Hause, nach Hause)
  const phrases: Suggestion[] = [];
  if (k.length >= 3) {
    const seen = new Set([...exact, ...prefix].map((s) => s.e));
    for (const e of list) {
      if (e.p !== 'phrase' || seen.has(e)) continue;
      if (e.t!.some((t) => t.startsWith(k))) phrases.push({ e, kind: 'prefix' });
    }
    phrases.sort((a, b) => (a.e.ja ? 0 : 1) - (b.e.ja ? 0 : 1) || a.e.r - b.e.r);
  }
  const nPh = Math.min(3, phrases.length);
  let out = [...[...exact, ...prefix].slice(0, limit - nPh), ...phrases.slice(0, nPh)];
  if (out.length === 0 && k.length >= 3) {
    // スペルミス候補
    const max = k.length <= 4 ? 1 : k.length <= 7 ? 2 : 3;
    const fuzzy: Suggestion[] = [];
    for (const e of list) {
      const ek = e.k!;
      if (Math.abs(ek.length - k.length) > max) continue;
      if (ek === k || ek.startsWith(k)) continue;
      const d = editDistance(k, ek, max);
      if (d <= max) fuzzy.push({ e, kind: 'fuzzy', dist: d });
    }
    fuzzy.sort((a, b) => a.dist! - b.dist! || a.e.r - b.e.r);
    out = [...out, ...fuzzy.slice(0, limit - out.length)];
  }
  return out;
}

export function detectSeparable(w: string, e?: LexEntry): string | undefined {
  if (!e?.v?.pr) return undefined;
  const f = e.v.pr[2] || '';
  const parts = f.split(' ');
  if (parts.length === 2 && SEP_PREFIXES.includes(parts[1]) && w.startsWith(parts[1])) return parts[1];
  if (parts.length === 2 && w.startsWith(parts[1])) return parts[1];
  return undefined;
}
