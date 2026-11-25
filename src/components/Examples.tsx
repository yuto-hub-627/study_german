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
  // 日本語訳のある例文だけ出す
  const ja = (list || []).filter((x) => x[1]);
  if (ja.length === 0) return null;
  return (
    <div className="card">
      <h3>例文</h3>
      <div className="examples">
        {ja.map(([de, jaText]) => (
          <div key={de} className="ex-item">
            <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 8 }}>
              <div className="de" style={{ flex: 1 }}>
                {de}
              </div>
              <Speak small text={de} />
            </div>
            <div className="ja small">{jaText}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
