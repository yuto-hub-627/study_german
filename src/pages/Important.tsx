import { useMemo, useState } from 'react';
import { Speak } from '../components/Speak';
import { IMPORTANT_NOTES } from '../lib/important';
import { LESSONS } from '../lib/types';

const CAT_CLASS: Record<string, string> = { 文法: 'cat-grammar', 単語: 'cat-word', 発音: 'cat-sound', テスト: 'cat-test' };

/** 例文の「 / 」区切りと（ ）内の補足を分けて、ドイツ語部分を読み上げ可能にする */
function examples(ex: string) {
  return ex
    .split(/\s*\/\s*/)
    .flatMap((part) => {
      const m = part.match(/^(.*?)（(.*)）$/);
      return m ? [m[1], m[2].replace(/^[^:：]*[:：]\s*/, '')] : [part];
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

export function Important() {
  const [cat, setCat] = useState('all');
  const [lesson, setLesson] = useState('all');
  const [q, setQ] = useState('');
  const cats = useMemo(() => Array.from(new Set(IMPORTANT_NOTES.map((n) => n.category))), []);
  const lessons = useMemo(() => LESSONS.filter((l) => IMPORTANT_NOTES.some((n) => n.lesson === l)), []);
  const list = IMPORTANT_NOTES.filter(
    (n) =>
      (cat === 'all' || n.category === cat) &&
      (lesson === 'all' || n.lesson === lesson) &&
      (!q || [n.title, n.content, n.example, n.memo].some((x) => x?.toLowerCase().includes(q.toLowerCase()))),
  ).slice().reverse();

  return (
    <div className="stack">
      <div className="topbar">
        <h1>重要なこと</h1>
        <span className="small muted">{IMPORTANT_NOTES.length} 件</span>
      </div>
      <p className="small muted" style={{ marginTop: -8 }}>
        授業で先生が「重要」と言ったことのまとめ。新しいものが先頭です。
      </p>
      {IMPORTANT_NOTES.length > 1 && (
        <>
          <input className="input" placeholder="検索" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chips">
            <button className={`chip${cat === 'all' ? ' on' : ''}`} onClick={() => setCat('all')}>
              すべて
            </button>
            {cats.map((c) => (
              <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
            {lessons.length > 0 && <span className="tiny muted" style={{ alignSelf: 'center', margin: '0 4px' }}>｜</span>}
            {lessons.length > 0 && (
              <button className={`chip${lesson === 'all' ? ' on' : ''}`} onClick={() => setLesson('all')}>
                全課
              </button>
            )}
            {lessons.map((l) => (
              <button key={l} className={`chip${lesson === l ? ' on' : ''}`} onClick={() => setLesson(l)}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}
      {list.length === 0 ? (
        <div className="empty">まだ登録がありません</div>
      ) : (
        <div className="note-grid">
          {list.map((n, i) => (
            <article key={n.id} className={`note-card ${CAT_CLASS[n.category] || 'cat-other'}`} style={{ ['--tilt' as string]: `${[-1.2, 0.8, -0.5, 1.1][i % 4]}deg` }}>
              <span className="pin" aria-hidden="true" />
              <div className="row" style={{ gap: 6 }}>
                <span className="tag cat-tag">{n.category}</span>
                {n.lesson && <a className="tag" href={`#/grammar/${n.lesson}`}>Lektion {n.lesson}</a>}
                <span className="spacer" />
                <span className="tiny muted">{n.id}{n.date ? ` ・ ${n.date}` : ''}</span>
              </div>
              <h3 className="note-title">{n.title}</h3>
              <p className="note-body">{n.content}</p>
              {n.example && (
                <div className="note-ex">
                  {examples(n.example).map((e) => (
                    <div key={e} className="row" style={{ flexWrap: 'nowrap', gap: 8 }}>
                      <span className="de" style={{ flex: 1 }}>{e}</span>
                      {/[A-Za-zÄÖÜäöüß]/.test(e) && <Speak small text={e} />}
                    </div>
                  ))}
                </div>
              )}
              {n.memo && <p className="tiny muted" style={{ margin: '8px 0 0' }}>※ {n.memo}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
