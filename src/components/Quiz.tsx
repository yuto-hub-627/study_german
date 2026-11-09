import { useMemo, useState } from 'react';
import type { Question } from '../data/grammar';
import { Speak } from './Speak';

function norm(s: string) {
  return s
    .trim()
    .replace(/[…]|\.\.\./g, ' ')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function QuizRunner({ questions, onFinish }: { questions: Question[]; onFinish: (score: number, wrong: string[]) => void }) {
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const q = questions[i];

  const next = () => {
    if (i + 1 >= questions.length) {
      onFinish((questions.length - wrong.length) / questions.length, wrong);
    } else {
      setI(i + 1);
      setAnswered(null);
    }
  };
  const mark = (ok: boolean) => {
    setAnswered(ok);
    if (!ok) setWrong((w) => [...w, q.id]);
  };

  return (
    <div className="stack">
      <div className="row small muted">
        問題 {i + 1} / {questions.length}
        <div className="spacer" />
        正解 {i + (answered === null ? 0 : 1) - wrong.length} 問
      </div>
      <div className="progressbar">
        <div style={{ width: `${((i + (answered === null ? 0 : 1)) / questions.length) * 100}%` }} />
      </div>
      <div className="card">
        <QuestionView key={q.id} q={q} answered={answered} onAnswer={mark} />
        {answered !== null && (
          <div className="row" style={{ marginTop: 12 }}>
            <div className="spacer" />
            <button className="btn primary" autoFocus onClick={next}>
              {i + 1 >= questions.length ? '結果を見る' : '次へ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionView({ q, answered, onAnswer }: { q: Question; answered: boolean | null; onAnswer: (ok: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [order, setOrder] = useState<number[]>([]);
  const tokens = useMemo(() => (q.type === 'order' ? shuffle(q.words.map((w, idx) => ({ w, idx }))) : []), [q]);

  const fullSentence = (fill: string) => (q.type === 'input' ? q.de.replace('___', fill).replace('___', '') : '');

  if (q.type === 'choice') {
    return (
      <div>
        <div className="small muted">{q.q}</div>
        {q.de && <div className="q-sentence de">{q.de}</div>}
        {q.options.map((o, idx) => {
          const cls = answered === null ? '' : idx === q.answer ? ' right' : idx === choice ? ' wrong' : '';
          return (
            <button
              key={idx}
              className={`opt de${cls}`}
              disabled={answered !== null}
              onClick={() => {
                setChoice(idx);
                onAnswer(idx === q.answer);
              }}
            >
              {o}
            </button>
          );
        })}
        {answered !== null && <Feedback ok={answered} explain={q.explain} />}
      </div>
    );
  }
  if (q.type === 'input') {
    const ok = answered;
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (answered !== null || !text.trim()) return;
          onAnswer(q.answers.some((a) => norm(a) === norm(text)));
        }}
      >
        <div className="small muted">{q.q}</div>
        <div className="q-sentence de">{q.de.split('___').map((part, idx, arr) => (
          <span key={idx}>
            {part}
            {idx < arr.length - 1 && <span style={{ borderBottom: '3px solid var(--red)', padding: '0 18px', margin: '0 2px' }}>{answered !== null ? '' : ' '}</span>}
          </span>
        ))}</div>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <input className="input de" value={text} onChange={(e) => setText(e.target.value)} disabled={answered !== null} autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} lang="de" placeholder={q.hint || '答えを入力'} />
          {answered === null && (
            <button className="btn primary" type="submit" disabled={!text.trim()}>
              答える
            </button>
          )}
        </div>
        <div className="umlauts">
          {['ä', 'ö', 'ü', 'ß'].map((u) => (
            <button type="button" key={u} disabled={answered !== null} onClick={() => setText(text + u)}>
              {u}
            </button>
          ))}
        </div>
        {ok !== null && (
          <Feedback ok={ok} explain={q.explain}>
            <div className="row">
              <span>
                正解: <b className="de">{q.answers[0]}</b>
              </span>
              {!q.hint?.includes('語尾') && <Speak small text={fullSentence(q.answers[0].replace(/\s+/, ' '))} />}
            </div>
          </Feedback>
        )}
      </form>
    );
  }
  // order
  const built = order.map((k) => tokens[k].w);
  const sentence = (ws: string[]) => ws.join(' ').replace(/\s([.,?!])/g, '$1');
  const accepted = [q.words, ...(q.answers || [])];
  return (
    <div>
      <div className="small muted">語を並べて文を作ろう</div>
      <div className="q-sentence">{q.q}</div>
      <div className="order-area de">
        {order.length === 0 && <span className="tiny muted">下の語をタップ</span>}
        {order.map((k, pos) => (
          <button key={pos} className="tok" disabled={answered !== null} onClick={() => setOrder(order.filter((_, x) => x !== pos))}>
            {tokens[k].w}
          </button>
        ))}
      </div>
      <div className="chips de" style={{ marginTop: 10 }}>
        {tokens.map((t, k) => (
          <button key={k} className={`tok${order.includes(k) ? ' used' : ''}`} disabled={order.includes(k) || answered !== null} onClick={() => setOrder([...order, k])}>
            {t.w}
          </button>
        ))}
      </div>
      {answered === null && (
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn small" onClick={() => setOrder([])} disabled={!order.length}>
            リセット
          </button>
          <div className="spacer" />
          <button className="btn primary" disabled={order.length !== tokens.length} onClick={() => onAnswer(accepted.some((a) => a.join(' ') === built.join(' ')))}>
            答える
          </button>
        </div>
      )}
      {answered !== null && (
        <Feedback ok={answered} explain={q.explain}>
          <div className="row">
            <span>
              正解: <b className="de">{sentence(q.words)}</b>
            </span>
            <Speak small text={sentence(q.words)} />
          </div>
        </Feedback>
      )}
    </div>
  );
}

function Feedback({ ok, explain, children }: { ok: boolean; explain?: string; children?: React.ReactNode }) {
  return (
    <div className={`alert ${ok ? 'ok' : 'ng'} feedback stack`} style={{ gap: 4 }}>
      <b>{ok ? '正解！' : '不正解'}</b>
      {children}
      {explain && <div className="small">{explain}</div>}
    </div>
  );
}
