import { useEffect, useMemo, useState } from 'react';
import { useLexicon } from '../components/GermanInput';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { AdjTable, GenderTag, NounTable, VerbPrincipal, VerbTable } from '../components/WordTables';
import { ARTICLE, GENDER_LABEL, headword, speechText } from '../lib/german';
import { detectSeparable, fold, suggest, type LexEntry } from '../lib/lexicon';
import { go } from '../lib/router';
import { saveWord, setBookWords, useStore } from '../lib/store';
import { POS_LABEL, type Word } from '../lib/types';

/** 辞書エントリーを単語データに変換 (活用表などの表示・単語帳への追加用) */
function toWord(e: LexEntry): Word {
  const refl = e.p === 'verb' && !!e.v?.rf;
  return {
    id: `lex:${e.p}:${e.w}`,
    de: e.w,
    pos: e.p,
    ja: e.ja || '',
    en: e.en?.join(' / '),
    ipa: e.ipa,
    src: 'user',
    g: e.p === 'noun' ? e.g : undefined,
    pl: e.p === 'noun' ? e.pl : undefined,
    gen: e.p === 'noun' ? e.gen : undefined,
    plOnly: e.p === 'noun' && !!e.po && !e.g,
    weak: e.p === 'noun' && !!e.wk,
    v: e.p === 'verb' ? e.v : undefined,
    sep: e.p === 'verb' ? detectSeparable(e.w, e) : undefined,
    refl: refl || undefined,
    c: e.p === 'adj' ? e.c : undefined,
  };
}

const dictPath = (e: { p: string; w: string }) => `/dict/${e.p}/${encodeURIComponent(e.w)}`;

export function Dictionary() {
  const { lex, err } = useLexicon();
  const words = useStore((s) => s.words);
  const [q, setQ] = useState(() => sessionStorage.getItem('dict-q') || '');
  useEffect(() => {
    try {
      sessionStorage.setItem('dict-q', q);
    } catch {
      /* noop */
    }
  }, [q]);

  // 教科書・自分の単語の訳を優先して表示
  const mine = useMemo(() => new Map(words.map((w) => [`${w.pos}:${w.de}`, w])), [words]);
  const results = useMemo(() => {
    if (!lex || !q.trim()) return [];
    const out = suggest(lex, q, 40);
    // 辞書にない教科書・自作の単語も検索
    const jp = /[぀-ヿ一-鿿]/.test(q);
    const fq = fold(q);
    const have = new Set(out.map((s) => `${s.e.p}:${s.e.w}`));
    const extra = words
      .filter((w) => !have.has(`${w.pos}:${w.de}`) && (jp ? w.ja.includes(q.trim()) : fold(w.de) === fq))
      .slice(0, 10)
      .map((w) => ({ e: { w: w.de, p: w.pos, r: 0, ja: w.ja, g: w.g } as LexEntry, kind: 'exact' as const }));
    return [...extra, ...out];
  }, [lex, q, words]);

  return (
    <div className="stack">
      <div className="topbar">
        <h1>辞書</h1>
        {lex && <span className="small muted">{lex.length.toLocaleString()} 語収録</span>}
      </div>
      <input className="input de" autoFocus placeholder="ドイツ語 または 日本語で検索（例: Haus / fahren / 家 / zu Hause）" value={q} onChange={(e) => setQ(e.target.value)} lang="de" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
      {!lex && !err && <div className="tiny muted">辞書を読み込み中…</div>}
      {err && <div className="alert ng small">{err}</div>}

      {q.trim() && lex && (
        <div className="card" style={{ padding: '4px 16px' }}>
          {results.length === 0 ? (
            <div className="empty small">見つかりませんでした</div>
          ) : (
            <div className="wlist">
              {results[0]?.kind === 'fuzzy' && <div className="tiny muted" style={{ padding: '8px 4px 0' }}>完全一致がありません。もしかして：</div>}
              {results.map(({ e, kind }) => {
                const m = mine.get(`${e.p}:${e.w}`);
                const ja = m?.ja || e.ja || e.en?.[0] || '';
                return (
                  <div key={e.p + e.w} className="witem" onClick={() => go(dictPath(e))}>
                    <div className="body">
                      <div className="row" style={{ gap: 6 }}>
                        <span className={`de${e.p === 'noun' && e.g ? ' g-' + e.g : ''}`}>
                          {e.p === 'noun' && e.g ? ARTICLE[e.g] + ' ' : ''}
                          {e.w}
                        </span>
                        {m?.lesson && <span className="tag">教科書 {m.lesson}</span>}
                        {kind === 'fuzzy' && <span className="tag warn">綴り違い?</span>}
                      </div>
                      <div className="ja">{ja}</div>
                    </div>
                    <span className="tag">{POS_LABEL[e.p] ?? e.p}</span>
                    <Icon name="chevron" size={18} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!q.trim() && (
        <>
          <div className="card small muted stack" style={{ gap: 4 }}>
            <div>・ドイツ語はウムラウトなしでも検索できます（schon → schön、strasse → Straße）。</div>
            <div>・日本語で引くこともできます（家 → Haus）。熟語も中の単語から探せます（Hause → zu Hause）。</div>
            <div>・単語を開くと、意味・発音・活用表・格変化を確認して、MY単語帳に追加できます。</div>
          </div>
          <a href="#/separable" className="card lesson-card" style={{ color: 'inherit' }}>
            <span className="lesson-badge" style={{ fontSize: '1rem' }}>an|</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>分離動詞の一覧</div>
              <div className="small muted">kommen → an|kommen, mit|kommen… 本体の動詞ごとにまとめて覚える</div>
            </div>
            <Icon name="chevron" size={18} />
          </a>
        </>
      )}
    </div>
  );
}

export function DictEntry({ pos, w }: { pos: string; w: string }) {
  const { lex, err } = useLexicon();
  const words = useStore((s) => s.words);
  const allBooks = useStore((s) => s.books);
  const books = useMemo(() => allBooks.filter((b) => b.kind === 'book'), [allBooks]);
  const [msg, setMsg] = useState<string | null>(null);

  const entry = useMemo(() => lex?.find((e) => e.p === pos && e.w === w), [lex, pos, w]);
  const mine = words.find((x) => x.pos === pos && x.de === w);
  const word: Word | undefined = mine ? { ...(entry ? toWord(entry) : {}), ...mine } : entry ? toWord(entry) : undefined;
  // 同じ綴りの別の品詞
  const others = useMemo(() => (lex ? lex.filter((e) => e.w.toLowerCase() === w.toLowerCase() && !(e.p === pos && e.w === w)) : []), [lex, pos, w]);

  if (!lex && !err && !mine) return <div className="empty">辞書を読み込み中…</div>;
  if (!word) return <div className="empty">見つかりませんでした</div>;

  const inBooks = mine ? books.filter((b) => b.wordIds?.includes(mine.id)) : [];

  const addTo = async (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    let id = mine?.id;
    if (!id) {
      const rec: Word = { ...word, id: `u:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, src: 'user', ja: word.ja || word.en?.split(' / ')[0] || '' };
      await saveWord(rec);
      id = rec.id;
    }
    await setBookWords(book.id, (ids) => [...ids, id!]);
    setMsg(`「${book.name}」に追加しました`);
    setTimeout(() => setMsg(null), 2500);
  };

  const meanings = entry?.en || [];

  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => history.back()}>
          <Icon name="back" size={18} /> 戻る
        </button>
        {mine && (
          <a href={`#/word/${encodeURIComponent(mine.id)}`} className="small">
            学習状況を見る →
          </a>
        )}
      </div>

      <div className="card hero">
        <div className="row" style={{ gap: 6, marginBottom: 6 }}>
          <span className="tag accent">{POS_LABEL[word.pos] ?? word.pos}</span>
          <GenderTag w={word} />
          {word.pos === 'noun' && word.g && <span className="tiny muted">{GENDER_LABEL[word.g]}名詞</span>}
          {word.weak && <span className="tag warn">男性弱変化</span>}
          {word.sep && <span className="tag warn">分離動詞</span>}
          {word.refl && <span className="tag warn">再帰動詞</span>}
          {mine?.lesson && <span className="tag">教科書 Lektion {mine.lesson}</span>}
        </div>
        <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <div className={`head de${word.pos === 'noun' && word.g ? ' g-' + word.g : ''}`} style={{ flex: 1 }}>
            {headword(word)}
          </div>
          <Speak text={speechText(word)} />
        </div>
        {word.ipa && <div className="muted small de">{word.ipa}</div>}
        {word.ja && <div className="ja">{word.ja}</div>}
        {word.pos === 'noun' && (word.pl || word.plOnly) && (
          <div className="row small" style={{ marginTop: 8 }}>
            <span className="muted">複数形</span>
            <b className="de g-pl">die {word.plOnly ? word.de : word.pl}</b>
            <Speak small text={`die ${word.plOnly ? word.de : word.pl}`} />
          </div>
        )}
      </div>

      {meanings.length > 0 && (
        <div className="card">
          <h3>意味（英語）</h3>
          <ol style={{ margin: 0, paddingLeft: '1.3em' }}>
            {meanings.map((m) => (
              <li key={m} className="small">
                {m}
              </li>
            ))}
          </ol>
        </div>
      )}

      {word.pos === 'verb' && (
        <>
          <div className="card">
            <h3>3基本形と要点</h3>
            <VerbPrincipal w={word} />
          </div>
          <div className="card">
            <h3>人称変化</h3>
            <VerbTable w={word} />
          </div>
        </>
      )}
      {word.pos === 'noun' && (
        <div className="card">
          <h3>格変化</h3>
          <NounTable w={word} />
        </div>
      )}
      {word.pos === 'adj' && (
        <div className="card">
          <h3>比較・語尾変化</h3>
          <AdjTable w={word} />
        </div>
      )}

      <div className="card">
        <h3>MY単語帳</h3>
        <div className="chips">
          {inBooks.map((b) => (
            <span key={b.id} className="chip on" style={{ cursor: 'default' }}>
              📘 {b.name}
            </span>
          ))}
          {books.some((b) => !inBooks.includes(b)) ? (
            <select className="input" style={{ width: 'auto', minHeight: 36 }} value="" onChange={(e) => e.target.value && void addTo(e.target.value)} aria-label="単語帳に追加">
              <option value="">＋ 単語帳に追加…</option>
              {books
                .filter((b) => !inBooks.includes(b))
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          ) : books.length === 0 ? (
            <a href="#/my" className="small">
              MY単語帳を作成する →
            </a>
          ) : null}
        </div>
      </div>

      {others.length > 0 && (
        <div className="card">
          <h3>同じ綴りの別の語</h3>
          <div className="wlist">
            {others.map((e) => (
              <div key={e.p + e.w} className="witem" onClick={() => go(dictPath(e))}>
                <div className="body">
                  <span className="de">
                    {e.p === 'noun' && e.g ? ARTICLE[e.g] + ' ' : ''}
                    {e.w}
                  </span>
                  <div className="ja">{e.ja || e.en?.[0]}</div>
                </div>
                <span className="tag">{POS_LABEL[e.p] ?? e.p}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="tiny muted center">出典: Wiktionary（CC BY-SA 4.0）</div>
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
