import { useEffect, useState } from 'react';
import { loadExamples, type Example } from '../lib/lexicon';
import { Speak } from './Speak';

/** 辞書の例文 (Tatoeba・Wiktionary) */
export function Examples({ pos, w }: { pos: string; w: string }) {
  const [list, setList] = useState<Example[] | null>(null);
  useEffect(() => {
    let alive = true;
    setList(null);
    void loadExamples(pos, w).then((x) => alive && setList(x));
    return () => {
      alive = false;
    };
  }, [pos, w]);
  if (!list || list.length === 0) return null;
  return (
    <div className="card">
      <h3>例文</h3>
      <div className="examples">
        {list.map(([de, ja, en]) => (
          <div key={de} className="ex-item">
            <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 8 }}>
              <div className="de" style={{ flex: 1 }}>
                {de}
              </div>
              <Speak small text={de} />
            </div>
            {ja ? <div className="ja small">{ja}</div> : en ? <div className="small muted">英訳: {en}</div> : null}
          </div>
        ))}
      </div>
      <div className="tiny muted" style={{ marginTop: 8 }}>
        出典: Tatoeba（CC BY 2.0 FR）・Wiktionary（CC BY-SA 4.0）
      </div>
    </div>
  );
}
