import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { TOPICS, type WGroup } from '../data/wordgroups';
import { loadLexicon, type LexEntry } from '../lib/lexicon';
import { go } from '../lib/router';
import { saveWord, setBookWords, useStore } from '../lib/store';
import type { Word } from '../lib/types';
import { toWord } from './Dictionary';

interface Item {
  de: string;
  ja: string;
  x?: string;
}
const parse = (s: string): Item => {
  const [de, ja, x] = s.split('|');
  return { de, ja, x };
};

const CATS = ['文法', '名詞', '意味・テーマ'] as const;

/** 単語グループの一覧 (#/groups) */
export function WordGroups() {
  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => history.back()}>
          <Icon name="back" size={18} /> 戻る
        </button>
      </div>
      <div>
        <h1 className="scribble">単語グループ</h1>
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          同じ種類の語をまとめて覚えます。グループごと MY単語帳に追加することもできます。
        </p>
      </div>
      {CATS.map((c) => (
        <div key={c} className="stack" style={{ gap: 10 }}>
          <div className="section-title">{c}</div>
          <div className="sep-grid">
            {(c === '文法' ? [{ id: 'separable', title: '分離動詞', sub: 'an|kommen, auf|stehen… 本体の動詞ごと', n: 250 }] : []).map((t) => (
              <a key={t.id} href="#/separable" className="card lesson-card" style={{ color: 'inherit' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{t.title}</div>
                  <div className="small muted">{t.sub}</div>
                </div>
                <Icon name="chevron" size={18} />
              </a>
            ))}
            {TOPICS.filter((t) => t.cat === c).map((t) => (
              <a key={t.id} href={`#/groups/${t.id}`} className="card lesson-card" style={{ color: 'inherit' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{t.title}</div>
                  <div className="small muted">
                    {t.sub}・{t.groups.reduce((n, g) => n + g.items.length, 0)}語
                  </div>
                </div>
                <Icon name="chevron" size={18} />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 1つのテーマ (#/groups/:id) */
export function WordGroupTopic({ id }: { id: string }) {
  const topic = TOPICS.find((t) => t.id === id);
  const words = useStore((s) => s.words);
  const allBooks = useStore((s) => s.books);
  const books = useMemo(() => allBooks.filter((b) => b.kind === 'book'), [allBooks]);
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  if (!topic) return <div className="empty">見つかりませんでした</div>;

  const addToBook = async (g: WGroup, bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    let lex: LexEntry[] | null = null;
    try {
      lex = await loadLexicon();
    } catch {
      lex = null;
    }
    const ids: string[] = [];
    for (const it of g.items.map(parse)) {
      // 見出し語: 冠詞・sich を外す (die Zeitung → Zeitung, sich freuen → freuen)
      const m = it.de.match(/^(der|die|das) (.+)$/);
      const lemma = (m ? m[2] : it.de).replace(/^sich /, '');
      const isNoun = !!m;
      let e: LexEntry | undefined;
      if (lex && !/\s/.test(lemma)) for (const x of lex) if (x.w === lemma && (!isNoun || x.p === 'noun') && x.p !== 'phrase' && (!e || x.r < e.r)) e = x;
      const pos = e?.p ?? (isNoun ? 'noun' : /\s/.test(lemma) ? 'phrase' : 'adv');
      const de = e ? e.w : pos === 'phrase' ? it.de : lemma;
      const existing = words.find((w) => w.de === de && w.pos === pos);
      if (existing) {
        if (!ids.includes(existing.id)) ids.push(existing.id);
        continue;
      }
      const base: Partial<Word> = e ? toWord(e) : { de, pos };
      const w: Word = { ...(base as Word), id: `u:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, src: 'user', ja: it.ja, refl: it.de.startsWith('sich ') || base.refl || undefined };
      await saveWord(w);
      ids.push(w.id);
    }
    const have = new Set(book.wordIds || []);
    const add = ids.filter((x) => !have.has(x));
    await setBookWords(book.id, (cur) => [...cur, ...add]);
    setMsg(`${add.length}語を「${book.name}」に追加しました`);
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => go('/groups')}>
          <Icon name="back" size={18} /> 単語グループ
        </button>
      </div>
      <div>
        <h1 className="scribble">{topic.title}</h1>
        {topic.note && (
          <p className="small muted" style={{ margin: '8px 0 0' }}>
            {topic.note}
          </p>
        )}
      </div>
      <div className="row">
        <button
          className={`chip${hide ? ' on' : ''}`}
          onClick={() => {
            setHide(!hide);
            setShown({});
          }}
        >
          意味を隠す
        </button>
        {hide && <span className="tiny muted">行をタップすると表示されます</span>}
      </div>

      <div className="sep-grid">
        {topic.groups.map((g) => {
          const items = g.items.map(parse);
          return (
            <div key={g.title} className="card sep-card">
              <div className="row" style={{ flexWrap: 'nowrap', marginBottom: 4 }}>
                <h3 style={{ margin: 0, flex: 1 }}>{g.title}</h3>
                {books.length > 0 ? (
                  <select
                    className="input"
                    style={{ width: 'auto', minHeight: 34, fontSize: 13, padding: '4px 8px' }}
                    value=""
                    aria-label="このグループを単語帳に追加"
                    onChange={(e) => e.target.value && void addToBook(g, e.target.value)}
                  >
                    <option value="">＋単語帳へ</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button className="btn small ghost" onClick={() => go('/my')}>
                    ＋単語帳
                  </button>
                )}
              </div>
              {g.note && <div className="small muted" style={{ marginBottom: 6 }}>{g.note}</div>}
              <div className={g.pair ? 'wg-pairs' : ''}>
                {items.map((it, i) => {
                  const k = g.title + i;
                  const reveal = !hide || shown[k];
                  return (
                    <div key={k} className="sep-row" onClick={() => hide && setShown({ ...shown, [k]: !shown[k] })}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="de" style={{ fontSize: '1.15rem' }}>
                          {it.de}
                        </div>
                        <div className={`small${reveal ? '' : ' hidden-ja'}`}>{reveal ? it.ja : 'タップで表示'}</div>
                        {reveal && it.x && <div className="tiny muted de">{it.x}</div>}
                      </div>
                      <Speak small text={it.de} />
                      {g.pair && i % 2 === 0 && <span className="wg-arrow">↔</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {books.length === 0 && <div className="tiny muted center">MY単語帳を作ると、グループごとまとめて単語帳に追加できます。</div>}
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
