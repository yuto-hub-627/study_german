import { useEffect, useMemo, useState } from 'react';
import { GermanInput, useLexicon } from '../components/GermanInput';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { detectSeparable, fold, suggest, type LexEntry } from '../lib/lexicon';
import { go } from '../lib/router';
import { saveWord, setBookWords, useStore } from '../lib/store';
import { POS_LABEL, POS_ORDER, type Gender, type Pos, type Word } from '../lib/types';

const ARTS: Record<string, Gender> = { der: 'm', die: 'f', das: 'n' };

function blank(): Word {
  return { id: '', de: '', pos: 'noun', ja: '', src: 'user' };
}

export function EditWord({ id, bookId }: { id?: string; bookId?: string }) {
  const book = useStore((s) => (bookId ? s.books.find((b) => b.id === bookId) : undefined));
  const existing = useStore((s) => (id ? s.wordMap.get(id) : undefined));
  const words = useStore((s) => s.words);
  const { lex, err } = useLexicon();
  const [w, setW] = useState<Word>(() => (existing ? { ...existing } : blank()));
  const [input, setInput] = useState(() => (existing ? (existing.refl ? 'sich ' : '') + existing.de : ''));
  const [picked, setPicked] = useState<LexEntry | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing && !w.id) {
      setW({ ...existing });
      setInput((existing.refl ? 'sich ' : '') + existing.de);
    }
  }, [existing, w.id]);

  const up = (p: Partial<Word>) => setW((cur) => ({ ...cur, ...p }));

  const applyEntry = (e: LexEntry, art?: Gender) => {
    setPicked(e);
    const refl = !!e.v?.rf || /^sich\s/i.test(input);
    setInput((refl ? 'sich ' : '') + e.w);
    up({
      de: e.w,
      pos: e.p,
      g: e.p === 'noun' ? art || e.g : undefined,
      pl: e.p === 'noun' ? e.pl : undefined,
      gen: e.p === 'noun' ? e.gen : undefined,
      plOnly: e.p === 'noun' && !!e.po && !e.g,
      weak: e.p === 'noun' && !!e.wk,
      v: e.p === 'verb' ? e.v : undefined,
      sep: e.p === 'verb' ? detectSeparable(e.w, e) : undefined,
      refl: e.p === 'verb' ? refl : undefined,
      c: e.p === 'adj' ? e.c : undefined,
      ipa: e.ipa,
      en: e.en?.[0],
      ja: w.ja && existing ? w.ja : e.ja || w.ja,
    });
  };

  // 入力文字列と辞書の照合
  const check = useMemo(() => {
    const raw = input.trim();
    if (!raw || !lex) return null;
    const m = raw.match(/^(der|die|das)\s+(.+)$/i);
    const word = (m ? m[2] : raw).replace(/^sich\s+/i, '');
    const exact = lex.filter((e) => e.w === word);
    if (exact.length) return { ok: true as const, exact, word };
    const ci = lex.filter((e) => e.w.toLowerCase() === word.toLowerCase());
    if (ci.length) return { ok: false as const, kind: 'case' as const, cands: ci, word };
    const cands = suggest(lex, word, 5).filter((s) => s.kind !== 'prefix' || fold(s.e.w) === fold(word));
    return { ok: false as const, kind: 'unknown' as const, cands: cands.map((c) => c.e), word };
  }, [input, lex]);

  const dup = useMemo(() => {
    const d = w.de.trim();
    if (!d) return null;
    return words.find((x) => x.id !== w.id && x.de === d && x.pos === w.pos) || null;
  }, [w.de, w.pos, w.id, words]);
  // 追加先の単語帳にすでに同じ単語があるか (1単語帳に同じ単語は1つまで)
  const dupInBook = useMemo(() => {
    if (!book) return null;
    const d = w.de.trim();
    if (!d) return null;
    const ids = new Set(book.wordIds || []);
    return words.find((x) => ids.has(x.id) && x.id !== w.id && x.de === d && x.pos === w.pos) || null;
  }, [book, w.de, w.pos, w.id, words]);

  const onInput = (v: string) => {
    setInput(v);
    const m = v.trim().match(/^(der|die|das)\s+(.+)$/i);
    const word = (m ? m[2] : v.trim()).replace(/^sich\s+/i, '');
    up({ de: word, ...(m ? { g: ARTS[m[1].toLowerCase()], pos: 'noun' as Pos } : {}), ...(/^sich\s/i.test(v.trim()) ? { refl: true, pos: 'verb' as Pos } : {}) });
    if (picked && picked.w !== word) setPicked(null);
  };

  const canSave = w.de.trim() && w.ja.trim() && !saving && !dupInBook;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    // 単語帳への追加で、同じ単語がすでに登録済みなら新しく作らずにそれを入れる
    if (book && !existing && dup) {
      await setBookWords(book.id, (ids) => [...ids, dup.id]);
      go(`/my/${encodeURIComponent(book.id)}`);
      return;
    }
    const rec: Word = { ...w, de: w.de.trim(), ja: w.ja.trim() };
    if (!rec.id) rec.id = `u:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    if (rec.pos !== 'noun') {
      delete rec.g;
      delete rec.pl;
      delete rec.gen;
      delete rec.plOnly;
      delete rec.weak;
    }
    if (rec.pos !== 'verb') {
      delete rec.v;
      delete rec.sep;
      delete rec.refl;
    }
    await saveWord(rec);
    if (book) {
      await setBookWords(book.id, (ids) => [...ids, rec.id]);
      go(`/my/${encodeURIComponent(book.id)}`);
    } else go(`/word/${encodeURIComponent(rec.id)}`);
  };

  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => history.back()}>
          <Icon name="back" size={18} /> 戻る
        </button>
        <h1 style={{ fontSize: '1.15rem' }}>{existing ? '単語を編集' : book ? `「${book.name}」に追加` : '単語を追加'}</h1>
        <span style={{ width: 60 }} />
      </div>

      <div className="card stack">
        <div className="field">
          <label htmlFor="de">ドイツ語</label>
          <GermanInput value={input} onChange={onInput} onPick={(e) => applyEntry(e)} lex={lex} autoFocus={!existing} placeholder="例: Tisch / der Tisch / fahren / sich freuen" />
          {!lex && !err && <div className="tiny muted">辞書を読み込み中…</div>}
          {err && <div className="alert ng small">{err}（オフラインでは初回のみ辞書を利用できません）</div>}
          {check && !check.ok && (
            <div className="alert warn small">
              {check.kind === 'case' ? '大文字・小文字が違うようです。' : '辞書に見つかりません。スペルを確認してください。'}
              {check.cands.length > 0 && (
                <div className="row" style={{ marginTop: 6 }}>
                  もしかして：
                  {check.cands.slice(0, 5).map((c) => (
                    <button key={c.w + c.p} className="chip" onClick={() => applyEntry(c)}>
                      <span className="de">{c.w}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {book && dupInBook && (
            <div className="alert warn small">
              「{book.name}」にはすでに <b className="de">{dupInBook.de}</b>（{dupInBook.ja}）が入っています。同じ単語は追加できません。
            </div>
          )}
          {!book && dup && (
            <div className="alert info small">
              すでに登録済みの単語です：<a href={`#/word/${encodeURIComponent(dup.id)}`}>{dup.de}（{dup.ja}）</a>
            </div>
          )}
        </div>

        <div className="field">
          <label>品詞（自動判定・変更可）</label>
          <select className="input" value={w.pos} onChange={(e) => up({ pos: e.target.value as Pos })}>
            {POS_ORDER.map((p) => (
              <option key={p} value={p}>
                {POS_LABEL[p]}
              </option>
            ))}
          </select>
        </div>

        {w.pos === 'noun' && (
          <div className="grid grid-2">
            <div className="field">
              <label>性</label>
              <div className="segmented">
                {(['m', 'f', 'n'] as Gender[]).map((g) => (
                  <button key={g} type="button" className={w.g === g && !w.plOnly ? 'on' : ''} onClick={() => up({ g, plOnly: false })}>
                    <span className={`g-${g}`}>{g === 'm' ? 'der' : g === 'f' ? 'die' : 'das'}</span>
                  </button>
                ))}
                <button type="button" className={w.plOnly ? 'on' : ''} onClick={() => up({ plOnly: true, g: undefined })}>
                  複数のみ
                </button>
              </div>
            </div>
            {!w.plOnly && (
              <div className="field">
                <label>複数形</label>
                <input className="input de" value={w.pl || ''} onChange={(e) => up({ pl: e.target.value })} placeholder="例: Tische" />
              </div>
            )}
          </div>
        )}

        {w.pos === 'verb' && (
          <div className="grid grid-2">
            <div className="field">
              <label>分離前つづり</label>
              <input className="input de" value={w.sep || ''} onChange={(e) => up({ sep: e.target.value || undefined })} placeholder="例: an（an|fangen）" />
            </div>
            <div className="field">
              <label>再帰動詞</label>
              <label className="row" style={{ minHeight: 46 }}>
                <input type="checkbox" checked={!!w.refl} onChange={(e) => up({ refl: e.target.checked })} /> sich ～
              </label>
            </div>
            {w.v?.pp && (
              <div className="small muted" style={{ gridColumn: '1 / -1' }}>
                活用データ: {w.v.pr?.[2]} ・ {w.v.pt?.[0]} ・ {w.v.pp}（{w.v.ax}）
              </div>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="ja">日本語の意味</label>
          <input id="ja" className="input" value={w.ja} onChange={(e) => up({ ja: e.target.value })} placeholder="辞書から自動入力されます（編集可）" />
          {w.en && <div className="tiny muted">英語: {w.en}</div>}
        </div>

        <div className="field">
          <label htmlFor="ex">例文（任意）</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input id="ex" className="input de" value={w.example || ''} onChange={(e) => up({ example: e.target.value })} placeholder="例: Ich kaufe einen Tisch." />
            {w.example && <Speak small text={w.example} />}
          </div>
        </div>
        <div className="field">
          <label htmlFor="note">メモ（任意）</label>
          <textarea id="note" className="input" value={w.note || ''} onChange={(e) => up({ note: e.target.value })} />
        </div>

        <button className="btn primary block" disabled={!canSave} onClick={save}>
          {existing ? '保存する' : '単語帳に追加'}
        </button>
        {!w.ja.trim() && w.de.trim() && <div className="tiny muted center">日本語の意味を入力すると保存できます</div>}
      </div>
    </div>
  );
}
