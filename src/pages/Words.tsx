import { useMemo, useState } from 'react';
import { Speak } from '../components/Speak';
import { GenderTag } from '../components/WordTables';
import { headword, speechText } from '../lib/german';
import { fold } from '../lib/lexicon';
import { go } from '../lib/router';
import { stage } from '../lib/srs';
import { useStore } from '../lib/store';
import { LESSONS, POS_LABEL, POS_ORDER, type Pos, type Word } from '../lib/types';

const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l, i]));

/** 教科書単語タブ: 品詞でまとめず、課の順の一覧＋絞り込み */
export function Words({ query }: { query: URLSearchParams }) {
  const all = useStore((s) => s.words);
  const progress = useStore((s) => s.progress);
  const words = useMemo(() => all.filter((w) => w.src === 'textbook'), [all]);
  const [q, setQ] = useState('');
  const [lesson, setLesson] = useState<string>(query.get('lesson') || 'all');
  const [pos, setPos] = useState<Pos | 'all'>((query.get('pos') as Pos) || 'all');

  const list = useMemo(() => {
    const fq = fold(q);
    return words
      .filter((w) => {
        if (lesson !== 'all' && w.lesson !== lesson) return false;
        if (pos !== 'all' && w.pos !== pos) return false;
        if (q) {
          if (/[぀-ヿ一-鿿]/.test(q)) return w.ja.includes(q);
          return fold(w.de).includes(fq) || (w.pl ? fold(w.pl).includes(fq) : false);
        }
        return true;
      })
      .sort((a, b) => (LESSON_INDEX.get(a.lesson || '') ?? 99) - (LESSON_INDEX.get(b.lesson || '') ?? 99) || a.de.localeCompare(b.de, 'de'));
  }, [words, q, lesson, pos]);

  return (
    <div className="stack">
      <div className="topbar">
        <h1>教科書単語</h1>
        <span className="small muted">{list.length} / {words.length} 語</span>
      </div>
      <a href="#/separable" className="card lesson-card" style={{ color: 'inherit' }}>
        <span className="lesson-badge" style={{ fontSize: '1rem' }}>an|</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>分離動詞の一覧</div>
          <div className="small muted">kommen → an|kommen, mit|kommen… 本体の動詞ごとにまとめて覚える</div>
        </div>
        <span style={{ display: 'inline-flex' }}>›</span>
      </a>
      <input className="input" placeholder="検索（ドイツ語 または 日本語）" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips" role="group" aria-label="課で絞り込み">
        <button className={`chip${lesson === 'all' ? ' on' : ''}`} onClick={() => setLesson('all')}>
          全課
        </button>
        {LESSONS.map((l) => (
          <button key={l} className={`chip${lesson === l ? ' on' : ''}`} onClick={() => setLesson(l)}>
            {l}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="品詞で絞り込み">
        <button className={`chip${pos === 'all' ? ' on' : ''}`} onClick={() => setPos('all')}>
          全品詞
        </button>
        {POS_ORDER.filter((p) => words.some((w) => w.pos === p)).map((p) => (
          <button key={p} className={`chip${pos === p ? ' on' : ''}`} onClick={() => setPos(p)}>
            {POS_LABEL[p]}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: '4px 16px' }}>
        {list.length === 0 ? <div className="empty">該当する単語がありません</div> : <WordList words={list} progress={progress} showLesson={lesson === 'all'} />}
      </div>
    </div>
  );
}

export function WordList({ words, progress, showLesson, action }: { words: Word[]; progress: Map<string, unknown>; showLesson?: boolean; action?: (w: Word) => React.ReactNode }) {
  return (
    <div className="wlist">
      {words.map((w) => (
        <WordRow key={w.id} w={w} st={stage(progress.get(w.id) as never)} showLesson={showLesson} action={action} />
      ))}
    </div>
  );
}

function WordRow({ w, st, showLesson, action }: { w: Word; st: string; showLesson?: boolean; action?: (w: Word) => React.ReactNode }) {
  return (
    <div className="witem" onClick={() => go(`/word/${encodeURIComponent(w.id)}`)}>
      <span className={`dot ${st}`} title={st} />
      <div className="body">
        <div className="row" style={{ gap: 6 }}>
          <span className={`de${w.pos === 'noun' && w.g ? ' g-' + w.g : ''}`}>{headword(w)}</span>
          <GenderTag w={w} />
          {w.pos === 'noun' && w.pl && <span className="tiny muted de">Pl. {w.pl}</span>}
          {w.pos === 'verb' && w.v?.pp && <span className="tiny muted de">{w.v.pt?.[0]} – {w.v.pp}</span>}
        </div>
        <div className="ja">{w.ja}</div>
      </div>
      <span className="tag">{POS_LABEL[w.pos]}</span>
      {showLesson && w.lesson && <span className="tag">{w.lesson}</span>}
      {w.src === 'user' && <span className="tag accent">追加</span>}
      <Speak small text={speechText(w)} />
      {action?.(w)}
    </div>
  );
}
