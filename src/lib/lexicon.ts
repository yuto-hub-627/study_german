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
  kind: 'exact' | 'prefix' | 'fuzzy' | 'ja' | 'form';
  dist?: number;
  /** kind === 'form' のとき: 入力した形が何形か (例: "du・er/sie/es の現在形") */
  why?: string;
  /** kind === 'form' のとき: 入力された形 (辞書の綴り) */
  form?: string;
}

// ---------- 活用形 → 基本形 ----------
const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
interface FormHit {
  e: LexEntry;
  form: string;
  why: string;
}
const formIdx = new WeakMap<LexEntry[], Map<string, FormHit[]>>();

function personLabel(arr: (string | null | undefined)[] | undefined, form: string): string {
  const ps = (arr || []).map((f, i) => (f === form ? PERSONS[i] : null)).filter(Boolean) as string[];
  return ps.join('・');
}

function getFormIndex(list: LexEntry[]): Map<string, FormHit[]> {
  let m = formIdx.get(list);
  if (m) return m;
  m = new Map();
  const add = (form: string | null | undefined, e: LexEntry, why: string) => {
    if (!form) return;
    const k = fold(form);
    if (!k || k === e.k) return;
    let a = m!.get(k);
    if (!a) m!.set(k, (a = []));
    const same = a.find((h) => h.e === e && h.form === form);
    if (same) {
      if (!same.why.includes(why)) same.why += ' / ' + why;
      return;
    }
    a.push({ e, form, why });
  };
  for (const e of list) {
    if (e.p === 'verb' && e.v) {
      const v = e.v;
      const tense = (arr: (string | null)[] | undefined, name: string) => {
        if (!arr) return;
        const seen = new Set<string>();
        for (const f of arr) {
          if (!f || seen.has(f)) continue;
          seen.add(f);
          const parts = f.split(' ');
          const who = personLabel(arr, f);
          if (parts.length === 2) {
            // 分離動詞: fängt an → "fängt" でも "fängt an" でも引ける
            add(parts[0], e, `${name}（${who}）※分離動詞：文では「${parts[0]} … ${parts[1]}」`);
            add(f, e, `${name}（${who}）`);
          } else add(f, e, `${name}（${who}）`);
        }
      };
      tense(v.pr, '現在形');
      tense(v.pt, '過去形');
      tense(v.k2, '接続法第2式');
      if (v.im) {
        if (v.im[0]) add(v.im[0].split(' ')[0], e, 'du に対する命令形');
        if (v.im[1] && v.im[1] !== (v.pr?.[4] || '')) add(v.im[1].split(' ')[0], e, 'ihr に対する命令形');
      }
      if (v.pp) {
        const aux = (v.ax || 'haben').split('/')[0];
        add(v.pp, e, `過去分詞（完了形は ${aux} ＋ ${v.pp}）`);
      }
      // 分離動詞の zu不定詞 (anzufangen)
      const sep = v.pr?.[2]?.split(' ')[1];
      if (sep && e.w.startsWith(sep)) add(sep + 'zu' + e.w.slice(sep.length), e, 'zu不定詞');
    } else if (e.p === 'noun') {
      if (e.pl && e.pl !== e.w) {
        add(e.pl, e, '複数形');
        if (!/[ns]$/.test(e.pl)) add(e.pl + 'n', e, '複数3格（与格）');
      }
      if (e.gen && e.gen !== e.w) add(e.gen, e, e.wk ? '単数2格（男性弱変化：2・3・4格は -en/-n）' : '単数2格（属格）');
    } else if (e.p === 'adj' && e.c) {
      if (e.c[0]) add(e.c[0], e, '比較級');
      const sup = e.c[1]?.replace(/^am /, '');
      if (sup) {
        add(sup, e, '最上級（am 〜sten）');
        if (sup.endsWith('en')) add(sup.slice(0, -2), e, '最上級');
      }
    }
  }
  formIdx.set(list, m);
  return m;
}

const adjIdx = new WeakMap<LexEntry[], Map<string, LexEntry[]>>();
const ADJ_END = ['en', 'em', 'er', 'es', 'e', 'n', 'm', 'r', 's'];

/** 入力が活用形なら、その基本形と「何形か」を返す */
export function lookupForm(list: LexEntry[], q: string): Suggestion[] {
  const k = fold(q.trim());
  if (k.length < 2) return [];
  const idx = getFormIndex(list);
  const word = q.trim();
  // fängt と fangt のようにウムラウトだけ違う形は、綴りが一致する方を採用
  const hits = idx.get(k) || [];
  const out: Suggestion[] = hits
    .filter((h) => h.form === word || !hits.some((o) => o.e === h.e && o.form === word))
    .filter((h, i, arr) => arr.findIndex((o) => o.e === h.e) === i)
    .map((h) => ({ e: h.e, kind: 'form' as const, why: h.why, form: h.form }));
  // 形容詞の語尾変化 (großen → groß, größeren → größer → groß, dunkle → dunkel)
  let adjs = adjIdx.get(list);
  if (!adjs) {
    adjs = new Map();
    for (const e of list) if (e.p === 'adj') (adjs.get(e.k!) || adjs.set(e.k!, []).get(e.k!)!).push(e);
    adjIdx.set(list, adjs);
  }
  const adjOf = (key: string) => adjs!.get(key) || [];
  for (const end of ADJ_END) {
    if (!k.endsWith(end) || k.length - end.length < 2) continue;
    const stem = k.slice(0, -end.length);
    const label = `に格語尾 -${word.toLowerCase().endsWith(end) ? word.slice(-end.length) : end} がついた形`;
    const cands: [string, string][] = [[stem, '']];
    // dunkel → dunkle / teuer → teure
    if (/[lr]$/.test(stem)) cands.push([stem.slice(0, -1) + 'e' + stem.slice(-1), '']);
    for (const [s] of cands) {
      for (const e of adjOf(s)) if (!out.some((o) => o.e === e)) out.push({ e, kind: 'form', why: `原級${label}`, form: word });
      for (const h of idx.get(s) || []) {
        if (h.e.p !== 'adj' || out.some((o) => o.e === h.e)) continue;
        out.push({ e: h.e, kind: 'form', why: `${h.why.replace(/（.*$/, '')}「${h.form}」${label}`, form: word });
      }
    }
    // müde → müden (語幹が e で終わる)
    for (const e of adjOf(stem + 'e')) if (end.length === 1 && !out.some((o) => o.e === e)) out.push({ e, kind: 'form', why: `原級${label}`, form: word });
  }
  // 綴りが完全に一致するもの → 分離動詞でないもの → よく使う語 の順
  const sepRank = (s: Suggestion) => (s.why?.includes('分離動詞') ? 1 : 0);
  out.sort((a, b) => (a.form === word ? 0 : 1) - (b.form === word ? 0 : 1) || sepRank(a) - sepRank(b) || a.e.r - b.e.r);
  return out;
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
  // 活用形 → 基本形 (isst → essen)
  let forms = lookupForm(list, raw).filter((f) => !exact.some((x) => x.e === f.e));
  const fset = new Set(forms.map((f) => f.e));
  const prefix2 = prefix.filter((p) => !fset.has(p.e));
  const nPh = Math.min(3, phrases.length);
  // 綴りどおりの見出し語 → 活用形 → ウムラウト等を無視して一致した見出し語 (Häuser → Haus を Hauser より先に)
  const exact1 = exact.filter((x) => x.e.w === raw || x.e.w.toLowerCase() === raw.toLowerCase());
  const exact2 = exact.filter((x) => !exact1.includes(x));
  // 見出し語そのものを打ったときは、分離動詞の活用形 (essen → aufessen) は出さない
  if (exact1.length) forms = forms.filter((f) => !f.why?.includes('分離動詞')).slice(0, 2);
  else forms = forms.slice(0, 3);
  let out = [...[...exact1, ...forms, ...exact2, ...prefix2].slice(0, limit - nPh), ...phrases.slice(0, nPh)];
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

// ---------- 例文 ----------
/** [ドイツ語, 日本語訳 | null, 英訳?] */
export type Example = [string, string | null, string?];
const shardCache = new Map<string, Promise<Record<string, unknown>>>();

/** public/dict/<dir>/<頭文字>.json から 1 語分を読む */
async function loadShard<T>(dir: string, pos: string, w: string): Promise<T | undefined> {
  const c = fold(w)[0] || '_';
  const key = dir + '/' + c;
  let p = shardCache.get(key);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}dict/${key}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, unknown>>) : {}))
      .catch(() => {
        shardCache.delete(key);
        return {};
      });
    shardCache.set(key, p);
  }
  return (await p)[`${pos}:${w}`] as T | undefined;
}

/** 単語の例文 (Tatoeba の日本語訳つき / Wiktionary の英訳つき) */
export async function loadExamples(pos: string, w: string): Promise<Example[]> {
  return (await loadShard<Example[]>('ex', pos, w)) || [];
}

/** 語源・成り立ち・関連語 (Wiktionary) */
export interface WordInfo {
  /** 成り立ち [部品, 英語の意味?] */
  pt?: [string, string?][];
  /** 由来 [言語コード, 語, i=受け継いだ / b=借用 / d=由来] */
  o?: [string, string, 'i' | 'b' | 'd'][];
  /** 同じ語源の英単語 */
  en?: string[];
  sy?: string[];
  an?: string[];
  dv?: string[];
  /** 語源の原文 (英語) */
  tx?: string;
}
export async function loadInfo(pos: string, w: string): Promise<WordInfo | undefined> {
  return loadShard<WordInfo>('info', pos, w);
}
