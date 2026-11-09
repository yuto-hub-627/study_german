import { useState } from 'react';
import { Icon } from '../components/Icon';
import { QuizRunner } from '../components/Quiz';
import { Rich } from '../components/Rich';
import { Speak } from '../components/Speak';
import { LESSONS_GRAMMAR, type Block, type Question } from '../data/grammar';
import { go } from '../lib/router';
import { saveQuiz, useStore } from '../lib/store';

export function GrammarList() {
  const quiz = useStore((s) => s.quiz);
  return (
    <div className="stack">
      <div className="topbar">
        <h1>文法</h1>
      </div>
      <p className="muted small" style={{ marginTop: -8 }}>
        教科書の各課の文法事項を、要点と練習問題で確認できます。80%以上で合格です。
      </p>
      {LESSONS_GRAMMAR.map((l) => {
        const r = quiz.get(l.id);
        return (
          <div key={l.id} className="card lesson-card" onClick={() => go(`/grammar/${l.id}`)}>
            <div className="lesson-badge">{l.id}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{l.title}</div>
              <div className="small muted">{l.subtitle}</div>
            </div>
            {r ? <span className={`tag ${r.best >= 0.8 ? 'ok' : 'warn'}`}>{Math.round(r.best * 100)}%</span> : <span className="tag">未挑戦</span>}
            <Icon name="chevron" size={18} />
          </div>
        );
      })}
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'p':
      return (
        <p>
          <Rich text={b.text} />
        </p>
      );
    case 'note':
      return (
        <div className="note">
          💡 <Rich text={b.text} />
        </div>
      );
    case 'list':
      return (
        <ul>
          {b.items.map((it, i) => (
            <li key={i}>
              <Rich text={it} />
            </li>
          ))}
        </ul>
      );
    case 'ex':
      return (
        <div className="ex">
          <div style={{ flex: 1 }}>
            <div className="de">{b.de}</div>
            <div className="ja">{b.ja}</div>
          </div>
          <Speak small text={b.de} />
        </div>
      );
    case 'table':
      return (
        <div className="table-wrap">
          <table className="t de">
            {b.head.some(Boolean) && (
              <thead>
                <tr>
                  {b.head.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={j > 0 ? 'hl' : ''}>
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function GrammarLesson({ id }: { id: string }) {
  const l = LESSONS_GRAMMAR.find((x) => x.id === id);
  const result = useStore((s) => s.quiz.get(id));
  const [mode, setMode] = useState<'read' | 'quiz' | 'done'>('read');
  const [qs, setQs] = useState<Question[]>([]);
  const [last, setLast] = useState<{ score: number; wrong: string[] } | null>(null);
  if (!l) return <div className="empty">見つかりません</div>;
  const idx = LESSONS_GRAMMAR.indexOf(l);
  const nextL = LESSONS_GRAMMAR[idx + 1];

  const startQuiz = (only?: string[]) => {
    const list = only?.length ? l.quiz.filter((q) => only.includes(q.id)) : l.quiz;
    setQs(list);
    setMode('quiz');
    window.scrollTo(0, 0);
  };

  return (
    <div className="stack gram">
      <div className="topbar">
        <button className="back" onClick={() => (mode === 'read' ? go('/grammar') : setMode('read'))}>
          <Icon name="back" size={18} /> {mode === 'read' ? '文法一覧' : '解説に戻る'}
        </button>
        {result && <span className={`tag ${result.best >= 0.8 ? 'ok' : 'warn'}`}>ベスト {Math.round(result.best * 100)}%</span>}
      </div>
      <div>
        <div className="small muted">{l.subtitle}</div>
        <h1>{l.title}</h1>
      </div>

      {mode === 'read' && (
        <>
          <div className="card">
            <div className="small" style={{ fontWeight: 700, marginBottom: 4 }}>
              この課の目標
            </div>
            <ul style={{ margin: 0 }}>
              {l.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
          {l.sections.map((s) => (
            <div className="card" key={s.title}>
              <h3>{s.title}</h3>
              {s.blocks.map((b, i) => (
                <BlockView key={i} b={b} />
              ))}
            </div>
          ))}
          <div className="card stack">
            <h3 style={{ margin: 0 }}>練習問題（{l.quiz.length}問）</h3>
            <button className="btn primary block" onClick={() => startQuiz()}>
              問題に挑戦する
            </button>
            {result && result.wrong.length > 0 && (
              <button className="btn block" onClick={() => startQuiz(result.wrong)}>
                前回まちがえた {result.wrong.length} 問だけ復習
              </button>
            )}
          </div>
        </>
      )}

      {mode === 'quiz' && (
        <QuizRunner
          questions={qs}
          onFinish={async (score, wrong) => {
            const full = qs.length === l.quiz.length;
            if (full) await saveQuiz(l.id, score, wrong);
            setLast({ score, wrong });
            setMode('done');
            window.scrollTo(0, 0);
          }}
        />
      )}

      {mode === 'done' && last && (
        <div className="card center stack" style={{ padding: 28 }}>
          <div style={{ fontSize: 44 }}>{last.score >= 0.8 ? '🎉' : '💪'}</div>
          <h2>{Math.round(last.score * 100)}%</h2>
          <p className="muted">{last.score >= 0.8 ? '合格です！' : 'もう少し！解説を見直してから再挑戦しよう。'}</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            {last.wrong.length > 0 && (
              <button className="btn" onClick={() => startQuiz(last.wrong)}>
                間違えた問題を解き直す
              </button>
            )}
            <button className="btn" onClick={() => setMode('read')}>
              解説を見る
            </button>
            {nextL && (
              <button className="btn primary" onClick={() => { setMode('read'); go(`/grammar/${nextL.id}`); }}>
                次の課（{nextL.id}）へ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
