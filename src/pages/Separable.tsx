import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { PREFIX_MEANING, SEPARABLE, type SepGroup } from '../data/separable';
import { loadLexicon } from '../lib/lexicon';
import { go } from '../lib/router';
import { saveWord, setBookWords, useStore } from '../lib/store';
import type { Word } from '../lib/types';

interface Item {
  prefix: string;
  base: string;
  ja: string;
  full: string;
  er: string;
  pp: string;
  zu: string;
}

function itemsOf(g: SepGroup): Item[] {
  return g.items.map(([prefix, ja]) => ({
    prefix,
    base: g.base,
    ja,
    full: prefix + g.base,
    er: `${g.er} … ${prefix}`,
    pp: prefix + g.pp,
    zu: `${prefix}zu${g.base}`,
  }));
}

export function Separable() {
  const words = useStore((s) => s.words);
  const allBooks = useStore((s) => s.books);
  const books = useMemo(() => allBooks.filter((b) => b.kind === 'book'), [allBooks]);
  const [view, setView] = useState<'base' | 'prefix'>('base');
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [onlyTb, setOnlyTb] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const textbookIds = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of words) if (w.pos === 'verb' && w.sep) m.set(w.de, w.id);
    return m;
  }, [words]);

  const groups = useMemo(() => {
    const all = SEPARABLE.map((g) => ({ key: g.base, title: g.base, sub: g.ja, items: itemsOf(g) }));
    if (view === 'base') return all;
    const byPrefix = new Map<string, Item[]>();
    for (const g of all) for (const it of g.items) byPrefix.set(it.prefix, [...(byPrefix.get(it.prefix) || []), it]);
    const meaning = new Map(PREFIX_MEANING.flatMap(([p, m]) => p.split(' / ').map((x, i) => [x, m.split(' / ')[i] ?? m] as [string, string])));
    return Array.from(byPrefix.entries())
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .map(([p, items]) => ({ key: p, title: `${p}-`, sub: meaning.get(p) || '', items }));
  }, [view]);

  const visible = groups
    .map((g) => ({ ...g, items: onlyTb ? g.items.filter((it) => textbookIds.has(it.full)) : g.items }))
    .filter((g) => g.items.length);

  const addToBook = async (items: Item[], bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const ids: string[] = [];
    let lex: Awaited<ReturnType<typeof loadLexicon>> | null = null;
    try {
      lex = await loadLexicon();
    } catch {
      lex = null;
    }
    for (const it of items) {
      const existing = textbookIds.get(it.full) || words.find((w) => w.pos === 'verb' && w.de === it.full)?.id;
      if (existing) {
        ids.push(existing);
        continue;
      }
      const e = lex?.find((x) => x.w === it.full && x.p === 'verb');
      const w: Word = {
        id: `u:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        de: it.full,
        pos: 'verb',
        ja: it.ja,
        src: 'user',
        sep: it.prefix,
        v: e?.v,
        en: e?.en?.[0],
        ipa: e?.ipa,
      };
      await saveWord(w);
      ids.push(w.id);
    }
    await setBookWords(book.id, (cur) => [...cur, ...ids]);
    setMsg(`${items.length}語を「${book.name}」に追加しました`);
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => history.back()}>
          <Icon name="back" size={18} /> 戻る
        </button>
      </div>
      <div>
        <h1 className="scribble">分離動詞の一覧</h1>
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          本体の動詞に前つづりがついた動詞。文の中では前つづりが離れて<b>文末</b>に行きます。
        </p>
      </div>

      <div className="card small">
        <div className="row" style={{ gap: 16 }}>
          <span>
            現在形：Der Zug <b>fährt</b> um 8 Uhr <b style={{ color: 'var(--red)' }}>ab</b>.
          </span>
          <span>
            完了：ist <b style={{ color: 'var(--red)' }}>ab</b>gefahren
          </span>
          <span>
            zu不定詞：<b style={{ color: 'var(--red)' }}>ab</b>zufahren
          </span>
          <span>
            助動詞と：Ich muss jetzt <b style={{ color: 'var(--red)' }}>ab</b>fahren.
          </span>
        </div>
      </div>

      <div className="row">
        <div className="segmented">
          <button className={view === 'base' ? 'on' : ''} onClick={() => setView('base')}>
            動詞別
          </button>
          <button className={view === 'prefix' ? 'on' : ''} onClick={() => setView('prefix')}>
            前つづり別
          </button>
        </div>
        <button className={`chip${hide ? ' on' : ''}`} onClick={() => { setHide(!hide); setShown({}); }}>
          🙈 意味を隠す
        </button>
        <button className={`chip${onlyTb ? ' on' : ''}`} onClick={() => setOnlyTb(!onlyTb)}>
          教科書に出てくる語だけ
        </button>
      </div>
      {hide && <div className="tiny muted">意味を隠しています。行をタップすると表示されます。</div>}

      {view === 'prefix' && (
        <details className="card">
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>前つづりのイメージ一覧</summary>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table className="t">
              <tbody>
                {PREFIX_MEANING.map(([p, m]) => (
                  <tr key={p}>
                    <td className="de hl" style={{ color: 'var(--red)' }}>{p}-</td>
                    <td>{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <div className="sep-grid">
        {visible.map((g) => (
          <div key={g.key} className="card sep-card">
            <div className="row" style={{ flexWrap: 'nowrap', marginBottom: 6 }}>
              <h3 className="de" style={{ margin: 0, fontSize: '1.5rem' }}>
                {g.title}
              </h3>
              <span className="small muted" style={{ flex: 1 }}>
                {g.sub}
              </span>
              {books.length > 0 ? (
                <select
                  className="input"
                  style={{ width: 'auto', minHeight: 34, fontSize: 13, padding: '4px 8px' }}
                  value=""
                  aria-label="このグループを単語帳に追加"
                  onChange={(e) => e.target.value && void addToBook(g.items, e.target.value)}
                >
                  <option value="">＋単語帳へ</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <button className="btn small ghost" onClick={() => go('/my')} title="単語帳を作成">
                  ＋単語帳
                </button>
              )}
            </div>
            {g.items.map((it) => {
              const k = g.key + it.full;
              const reveal = !hide || shown[k];
              const tbId = textbookIds.get(it.full);
              return (
                <div key={k} className="sep-row" onClick={() => hide && setShown({ ...shown, [k]: !shown[k] })}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="de" style={{ fontSize: '1.2rem' }}>
                        <span style={{ color: 'var(--red)' }}>{it.prefix}</span>|{it.base}
                      </span>
                      {tbId && (
                        <a href={`#/word/${encodeURIComponent(tbId)}`} className="tag" onClick={(e) => e.stopPropagation()}>
                          教科書
                        </a>
                      )}
                    </div>
                    <div className={`small${reveal ? '' : ' hidden-ja'}`}>{reveal ? it.ja : 'タップで表示'}</div>
                    {reveal && (
                      <div className="tiny muted de">
                        er {it.er} ・ {it.pp}
                      </div>
                    )}
                  </div>
                  <Speak small text={it.full} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {books.length === 0 && <div className="tiny muted center">MY単語帳を作ると、グループごとまとめて単語帳に追加できます。</div>}
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
