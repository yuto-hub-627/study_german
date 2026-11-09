import type { Gender, VerbForms, Word } from './types';

export const ARTICLE: Record<Gender, string> = { m: 'der', f: 'die', n: 'das' };
export const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
export const REFL_ACC = ['mich', 'dich', 'sich', 'uns', 'euch', 'sich'];

const CASES = ['1格 (Nom.)', '2格 (Gen.)', '3格 (Dat.)', '4格 (Akk.)'];
export { CASES };

export const DEF: Record<Gender | 'pl', string[]> = {
  m: ['der', 'des', 'dem', 'den'],
  f: ['die', 'der', 'der', 'die'],
  n: ['das', 'des', 'dem', 'das'],
  pl: ['die', 'der', 'den', 'die'],
};
export const INDEF: Record<Gender, string[]> = {
  m: ['ein', 'eines', 'einem', 'einen'],
  f: ['eine', 'einer', 'einer', 'eine'],
  n: ['ein', 'eines', 'einem', 'ein'],
};
export const KEIN_PL = ['keine', 'keiner', 'keinen', 'keine'];

/** 名詞の格変化表 [格][単数, 複数] */
export function declineNoun(w: Word): { sg?: string[]; pl?: string[] } {
  const res: { sg?: string[]; pl?: string[] } = {};
  if (!w.plOnly && w.g) {
    const g = w.g;
    const d = DEF[g];
    let gen = w.gen || w.de;
    let dat = w.de;
    let acc = w.de;
    if (w.weak) {
      dat = acc = w.gen && w.gen !== w.de ? w.gen.replace(/s$/, '') : w.de + (/e$/.test(w.de) ? 'n' : 'en');
      if (w.de === 'Herr') dat = acc = 'Herrn';
    } else if (g !== 'f' && !w.gen) {
      gen = w.de + (/(s|ß|x|z|sch)$/.test(w.de) ? 'es' : 's');
    }
    if (g === 'f') gen = w.de;
    res.sg = [`${d[0]} ${w.de}`, `${d[1]} ${gen}`, `${d[2]} ${dat}`, `${d[3]} ${acc}`];
  }
  const pl = w.plOnly ? w.de : w.pl;
  if (pl && pl !== '-') {
    const datPl = /[ns]$/.test(pl) ? pl : pl + 'n';
    res.pl = [`die ${pl}`, `der ${pl}`, `den ${datPl}`, `die ${pl}`];
  }
  return res;
}

function stemOf(inf: string): string {
  if (/[^e]n$/.test(inf) && /(el|er)n$/.test(inf)) return inf.slice(0, -1);
  return inf.replace(/e?n$/, '');
}

/** Wiktionaryにない動詞の規則変化(弱変化)による推定 */
export function regularVerb(inf: string, sep?: string): VerbForms {
  const base = sep ? inf.slice(sep.length) : inf;
  const st = stemOf(base);
  const needE = /([td]|[^aeiouälmnrh][mn])$/.test(st);
  const sib = /(s|ß|x|z)$/.test(st);
  const e = needE ? 'e' : '';
  const pr = [
    st + 'e',
    st + (sib ? 't' : e + 'st'),
    st + e + 't',
    base,
    st + e + 't',
    base,
  ];
  const ptBase = st + e + 'te';
  const pt = [ptBase, ptBase + 'st', ptBase, ptBase + 'n', ptBase + 't', ptBase + 'n'];
  const noGe = /^(be|er|ge|ver|zer|ent|emp|miss)/.test(base) || /ieren$/.test(base);
  const pp = (sep || '') + (noGe ? '' : 'ge') + st + e + 't';
  const s = (x: string) => (sep ? `${x} ${sep}` : x);
  return {
    pr: pr.map(s),
    pt: pt.map(s),
    k2: pt.map(s),
    im: [s(st + (needE ? 'e' : '')), s(st + e + 't')],
    pp,
    ax: 'haben',
  };
}

export function verbForms(w: Word): VerbForms & { estimated?: boolean } {
  const v = w.v || {};
  if (v.pr && v.pt && v.pp) return v;
  const r = regularVerb(w.de, w.sep);
  return { ...r, ...Object.fromEntries(Object.entries(v).filter(([, x]) => x)), estimated: !v.pr || !v.pt };
}

/** 現在完了形 (ich habe gemacht) */
export function perfect(w: Word): string[] {
  const f = verbForms(w);
  const aux = (f.ax || 'haben').startsWith('sein') ? 'sein' : 'haben';
  const forms = aux === 'sein' ? ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'] : ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
  return forms.map((a, i) => `${a}${w.refl ? ' ' + REFL_ACC[i] : ''} … ${f.pp}`);
}

export function withRefl(forms: string[] | undefined, w: Word): string[] | undefined {
  if (!forms || !w.refl) return forms;
  return forms.map((f, i) => {
    const parts = f.split(' ');
    if (parts.length > 1) return `${parts[0]} ${REFL_ACC[i]} ${parts.slice(1).join(' ')}`;
    return `${f} ${REFL_ACC[i]}`;
  });
}

/** 見出し語の表示 (der Tisch / an|fangen / sich erkälten) */
export function headword(w: Word): string {
  if (w.pos === 'noun') {
    if (w.plOnly) return `die ${w.de}`;
    if (w.g) return `${ARTICLE[w.g]} ${w.de}`;
  }
  if (w.pos === 'verb') {
    let s = w.sep ? `${w.sep}|${w.de.slice(w.sep.length)}` : w.de;
    if (w.refl) s = 'sich ' + s;
    return s;
  }
  return w.de;
}

/** 読み上げ用テキスト */
export function speechText(w: Word): string {
  if (w.pos === 'noun') {
    if (w.plOnly) return `die ${w.de}`;
    if (w.g) return `${ARTICLE[w.g]} ${w.de}`;
  }
  if (w.pos === 'verb' && w.refl) return `sich ${w.de}`;
  return w.de;
}

export const GENDER_LABEL: Record<Gender, string> = { m: '男性', f: '女性', n: '中性' };

/** 形容詞の語尾表 */
export const ADJ_ENDINGS = {
  weak: { m: ['e', 'en', 'en', 'en'], f: ['e', 'en', 'en', 'e'], n: ['e', 'en', 'en', 'e'], pl: ['en', 'en', 'en', 'en'] },
  mixed: { m: ['er', 'en', 'en', 'en'], f: ['e', 'en', 'en', 'e'], n: ['es', 'en', 'en', 'es'], pl: ['en', 'en', 'en', 'en'] },
  strong: { m: ['er', 'en', 'em', 'en'], f: ['e', 'er', 'er', 'e'], n: ['es', 'en', 'em', 'es'], pl: ['e', 'er', 'en', 'e'] },
} as const;

/** 比較級・最上級 (辞書になければ規則で推定) */
export function comparison(w: Word): [string, string] {
  const c = w.c || [];
  const base = w.de;
  const cmp = c[0] || base + (base.endsWith('e') ? 'r' : 'er');
  let sup = c[1] || '';
  if (!sup) sup = 'am ' + base + (/(d|t|s|ß|x|z|sch)$/.test(base) ? 'esten' : 'sten');
  return [cmp, sup];
}

/** 付加語として変化する形容詞の語幹 (hoch -> hoh, teuer -> teur, dunkel -> dunkl) */
export function adjStem(a: string): string {
  if (a === 'hoch') return 'hoh';
  if (/[^aeiou]el$/.test(a)) return a.slice(0, -2) + 'l';
  if (/euer$|auer$/.test(a)) return a.slice(0, -2) + 'r';
  if (a.endsWith('e')) return a.slice(0, -1);
  return a;
}
