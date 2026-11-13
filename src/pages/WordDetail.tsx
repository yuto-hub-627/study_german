import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { AdjTable, GenderTag, NounTable, VerbPrincipal, VerbTable } from '../components/WordTables';
import { GENDER_LABEL, headword, speechText } from '../lib/german';
import { go } from '../lib/router';
import { retrievability, stage, STAGE_LABEL } from '../lib/srs';
import { deleteWord, setBookWords, useStore } from '../lib/store';
import { POS_LABEL } from '../lib/types';

export function WordDetail({ id }: { id: string }) {
  const w = useStore((s) => s.wordMap.get(id));
  const p = useStore((s) => s.progress.get(id));
  const reviews = useStore((s) => s.reviews);
  const allBooks = useStore((s) => s.books);
  const books = useMemo(() => allBooks.filter((b) => b.kind === 'book'), [allBooks]);
  if (!w) return <div className="empty">単語が見つかりません</div>;
  const st = stage(p);
  const logs = reviews.filter((r) => r.wordId === id);
  const ok = logs.filter((r) => r.grade > 0).length;
  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => history.back()}>
          <Icon name="back" size={18} /> 戻る
        </button>
        <div className="row">
          <button className="btn small" onClick={() => go(`/edit/${encodeURIComponent(w.id)}`)}>
            <Icon name="edit" size={16} /> 編集
          </button>
          <button
            className="btn small danger"
            onClick={async () => {
              if (confirm(`「${w.de}」を単語帳から削除しますか？`)) {
                await deleteWord(w);
                history.back();
              }
            }}
          >
            <Icon name="trash" size={16} />
          </button>
        </div>
      </div>
      <div className="card hero">
        <div className="row" style={{ gap: 6, marginBottom: 6 }}>
          <span className="tag accent">{POS_LABEL[w.pos]}</span>
          <GenderTag w={w} />
          {w.pos === 'noun' && w.g && <span className="tiny muted">{GENDER_LABEL[w.g]}名詞</span>}
          {w.weak && <span className="tag warn">男性弱変化</span>}
          {w.sep && <span className="tag warn">分離動詞</span>}
          {w.refl && <span className="tag warn">再帰動詞</span>}
          {w.lesson && <span className="tag">Lektion {w.lesson}</span>}
          {w.src === 'user' && <span className="tag">自分で追加</span>}
        </div>
        <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <div className={`head de${w.pos === 'noun' && w.g ? ' g-' + w.g : ''}`} style={{ flex: 1 }}>
            {headword(w)}
          </div>
          <Speak text={speechText(w)} />
        </div>
        {w.ipa && <div className="muted small de">{w.ipa}</div>}
        <div className="ja">{w.ja}</div>
        {w.en && <div className="small muted">EN: {w.en}</div>}
        {w.pos === 'noun' && (w.pl || w.plOnly) && (
          <div className="row small" style={{ marginTop: 8 }}>
            <span className="muted">複数形</span>
            <b className="de g-pl">die {w.plOnly ? w.de : w.pl}</b>
            <Speak small text={`die ${w.plOnly ? w.de : w.pl}`} />
          </div>
        )}
      </div>

      {w.pos === 'verb' && (
        <>
          <div className="card">
            <h3>3基本形と要点</h3>
            <VerbPrincipal w={w} />
          </div>
          <div className="card">
            <h3>人称変化</h3>
            <VerbTable w={w} />
          </div>
        </>
      )}
      {w.pos === 'noun' && (
        <div className="card">
          <h3>格変化</h3>
          <NounTable w={w} />
        </div>
      )}
      {w.pos === 'adj' && (
        <div className="card">
          <h3>比較・語尾変化</h3>
          <AdjTable w={w} />
        </div>
      )}
      {(w.example || w.note) && (
        <div className="card">
          {w.example && (
            <div className="ex">
              <div style={{ flex: 1 }} className="de">
                {w.example}
              </div>
              <Speak small text={w.example} />
            </div>
          )}
          {w.note && <p className="small" style={{ whiteSpace: 'pre-wrap' }}>{w.note}</p>}
        </div>
      )}
      <div className="card">
        <h3>MY単語帳</h3>
        <div className="chips">
          {books.filter((b) => b.wordIds?.includes(w.id)).map((b) => (
            <span key={b.id} className="chip on" style={{ cursor: 'default' }}>
              📘 {b.name}
              <button className="btn ghost small" style={{ minHeight: 0, padding: '0 0 0 4px', boxShadow: 'none', color: 'inherit' }} aria-label={`${b.name}から外す`} onClick={() => void setBookWords(b.id, (ids) => ids.filter((x) => x !== w.id))}>
                ✕
              </button>
            </span>
          ))}
          {books.some((b) => !b.wordIds?.includes(w.id)) ? (
            <select className="input" style={{ width: 'auto', minHeight: 36 }} value="" onChange={(e) => e.target.value && void setBookWords(e.target.value, (ids) => [...ids, w.id])} aria-label="単語帳に追加">
              <option value="">＋ 単語帳に追加…</option>
              {books.filter((b) => !b.wordIds?.includes(w.id)).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : books.length === 0 ? (
            <a href="#/my" className="small">MY単語帳を作成する →</a>
          ) : null}
        </div>
      </div>
      <div className="card">
        <h3>学習状況</h3>
        <div className="row small">
          <span className={`dot ${st}`} /> {STAGE_LABEL[st]}
          {p?.last && (
            <>
              <span className="muted">・ 次回 {new Date(p.due).toLocaleDateString('ja-JP')}</span>
              <span className="muted">・ 想起率 {Math.round(retrievability(p) * 100)}%</span>
            </>
          )}
          {logs.length > 0 && (
            <span className="muted">
              ・ 正解 {ok}/{logs.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
