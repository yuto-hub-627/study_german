import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { GenderTag } from '../components/WordTables';
import { ARTICLE, PERSONS, headword, regularVerb, speechText, verbForms } from '../lib/german';
import { go } from '../lib/router';
import { newProgress, previewInterval, stage } from '../lib/srs';
import { newLearnedToday } from '../lib/stats';
import { grade as gradeWord, saveSettings, useStore } from '../lib/store';
import { LESSONS, POS_LABEL, POS_ORDER, type Grade, type Pos, type Word } from '../lib/types';

type Mode = 'de-ja' | 'ja-de' | 'type';
const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l, i]));

function norm(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .replace(/[.!?,;:|]/g, '')
    .replace(/\s+/g, ' ');
}

export function Study() {
  const words = useStore((s) => s.words);
  const progress = useStore((s) => s.progress);
  const reviews = useStore((s) => s.reviews);
  const settings = useStore((s) => s.settings);
  const [mode, setMode] = useState<Mode>((settings.direction as Mode) || 'de-ja');
  const [lessons, setLessons] = useState<string[]>(settings.lessonsFilter || []);
  const [poses, setPoses] = useState<Pos[]>([]);
  const [onlyUser, setOnlyUser] = useState(false);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [done, setDone] = useState({ total: 0, ok: 0 });
  const [sessionTotal, setSessionTotal] = useState(0);
  const [peek, setPeek] = useState<string | null>(null);
  useEffect(() => {
    if (!peek) return;
    const t = setTimeout(() => setPeek(null), 2600);
    return () => clearTimeout(t);
  }, [peek]);

  const pool = useMemo(
    () =>
      words.filter(
        (w) =>
          (!lessons.length || (w.lesson && lessons.includes(w.lesson)) || (lessons.includes('user') && w.src === 'user')) &&
          (!poses.length || poses.includes(w.pos)) &&
          (!onlyUser || w.src === 'user'),
      ),
    [words, lessons, poses, onlyUser],
  );
  const now = Date.now();
  const due = pool.filter((w) => {
    const p = progress.get(w.id);
    return p?.last && p.due <= now;
  });
  const newLeft = Math.max(0, settings.dailyNew - newLearnedToday(reviews));
  const fresh = pool
    .filter((w) => stage(progress.get(w.id)) === 'new')
    .sort((a, b) => (LESSON_INDEX.get(a.lesson || '') ?? 99) - (LESSON_INDEX.get(b.lesson || '') ?? 99));

  const start = (extra = false) => {
    let q: string[];
    if (extra) {
      const learned = pool.filter((w) => progress.get(w.id)?.last);
      q = learned.sort(() => Math.random() - 0.5).slice(0, 20).map((w) => w.id);
    } else {
      q = [...due.sort((a, b) => progress.get(a.id)!.due - progress.get(b.id)!.due).map((w) => w.id), ...fresh.slice(0, newLeft).map((w) => w.id)];
    }
    void saveSettings({ direction: mode === 'type' ? 'ja-de' : mode, lessonsFilter: lessons });
    setDone({ total: 0, ok: 0 });
    setSessionTotal(q.length);
    setQueue(q);
  };

  if (queue) {
    if (!queue.length)
      return (
        <div className="stack">
          <div className="card center stack" style={{ padding: 32 }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <h2>おつかれさまでした！</h2>
            <p className="muted">
              {done.total} 回回答 ・ 正解率 {done.total ? Math.round((done.ok / done.total) * 100) : 0}%
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn" onClick={() => setQueue(null)}>
                学習メニューへ
              </button>
              <button className="btn primary" onClick={() => go('/')}>
                ホームへ
              </button>
            </div>
          </div>
        </div>
      );
    return (
      <Session
        key={queue[0] + queue.length}
        queue={queue}
        mode={mode}
        onGrade={async (id, g, answer) => {
          setPeek(answer ?? null);
          await gradeWord(id, g);
          setDone((d) => ({ total: d.total + 1, ok: d.ok + (g > 0 ? 1 : 0) }));
          const rest = queue.slice(1);
          if (g === 0) rest.splice(Math.min(3, rest.length), 0, id);
          setQueue(rest);
        }}
        onQuit={() => setQueue(null)}
        remaining={queue.length}
        total={sessionTotal}
        peek={peek}
      />
    );
  }

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <div className="stack">
      <div className="topbar">
        <h1>単語の学習</h1>
      </div>
      <div className="card stack">
        <div className="field">
          <label>出題形式</label>
          <div className="segmented">
            <button className={mode === 'de-ja' ? 'on' : ''} onClick={() => setMode('de-ja')}>
              独 → 日
            </button>
            <button className={mode === 'ja-de' ? 'on' : ''} onClick={() => setMode('ja-de')}>
              日 → 独
            </button>
            <button className={mode === 'type' ? 'on' : ''} onClick={() => setMode('type')}>
              書き取り
            </button>
          </div>
          <div className="tiny muted">{mode === 'type' ? '日本語を見てドイツ語をタイプ（名詞は冠詞も）。自動で採点します。' : 'カードをめくって、思い出せたかを自己評価します。'}</div>
        </div>
        <div className="field">
          <label>範囲（課） {lessons.length ? '' : '― すべて'}</label>
          <div className="chips">
            {LESSONS.map((l) => (
              <button key={l} className={`chip${lessons.includes(l) ? ' on' : ''}`} onClick={() => setLessons(toggle(lessons, l))}>
                {l}
              </button>
            ))}
            <button className={`chip${onlyUser ? ' on' : ''}`} onClick={() => setOnlyUser(!onlyUser)}>
              自分で追加した語
            </button>
          </div>
        </div>
        <div className="field">
          <label>品詞 {poses.length ? '' : '― すべて'}</label>
          <div className="chips">
            {POS_ORDER.filter((p) => words.some((w) => w.pos === p)).map((p) => (
              <button key={p} className={`chip${poses.includes(p) ? ' on' : ''}`} onClick={() => setPoses(toggle(poses, p))}>
                {POS_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-3">
          <div className="stat card">
            <div className="label">復習</div>
            <div className="value">{due.length}</div>
          </div>
          <div className="stat card">
            <div className="label">新規（今日の残り）</div>
            <div className="value">{Math.min(newLeft, fresh.length)}</div>
            <div className="sub">1日 {settings.dailyNew} 語まで</div>
          </div>
          <div className="stat card">
            <div className="label">対象の語</div>
            <div className="value">{pool.length}</div>
          </div>
        </div>
        {due.length + Math.min(newLeft, fresh.length) > 0 ? (
          <button className="btn primary block" onClick={() => start()}>
            はじめる（{due.length + Math.min(newLeft, fresh.length)} 語）
          </button>
        ) : (
          <div className="stack">
            <div className="alert ok small">今日の分は完了しています。</div>
            {fresh.length > 0 && (
              <button className="btn block" onClick={() => void saveSettings({ dailyNew: settings.dailyNew + 10 })}>
                新規の上限を +10 語する
              </button>
            )}
            {pool.some((w) => progress.get(w.id)?.last) && (
              <button className="btn block" onClick={() => start(true)}>
                学習済みの語からランダムに20語練習
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Session({ queue, mode, onGrade, onQuit, remaining, total, peek }: { queue: string[]; mode: Mode; onGrade: (id: string, g: Grade, answer?: string) => void; onQuit: () => void; remaining: number; total: number; peek: string | null }) {
  const w = useStore((s) => s.wordMap.get(queue[0]));
  const p = useStore((s) => s.progress.get(queue[0]));
  const [shown, setShown] = useState(false); // 裏面を一度でも見たか
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<null | { g: Grade; msg: string }>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const startRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const swipeable = mode !== 'type';

  useEffect(() => {
    if (!swipeable) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') commitRef.current?.(true);
      else if (e.key === 'ArrowLeft') commitRef.current?.(false);
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        revealRef.current?.();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [swipeable]);
  const commitRef = useRef<((k: boolean) => void) | null>(null);
  const revealRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [w, mode]);

  if (!w) {
    // 削除された語はスキップ
    setTimeout(() => onGrade(queue[0], 2), 0);
    return null;
  }
  const prog = p || newProgress(w.id);
  const isNew = !p?.last;

  const commit = (known: boolean) => {
    if (fly) return;
    setFly(known ? 1 : -1);
    setDrag(null);
    const answer = !shown && !known ? `${headword(w)} ＝ ${w.ja}` : undefined;
    setTimeout(() => onGrade(w.id, known ? 2 : 0, answer), 230);
  };

  const onDown = (e: React.PointerEvent) => {
    if (!swipeable || fly) return;
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: React.PointerEvent) => {
    const st = startRef.current;
    if (!st || st.id !== e.pointerId) return;
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    if (!drag && Math.abs(dx) < 8) return;
    if (!drag) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ x: dx, y: dy * 0.3 });
  };
  const onUp = (e: React.PointerEvent) => {
    const st = startRef.current;
    startRef.current = null;
    if (!st) return;
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    if (Math.abs(dx) > 90) commit(dx > 0);
    else {
      setDrag(null);
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) reveal();
    }
  };

  /** 表⇔裏をめくる (音声は自動では流さない) */
  const reveal = () => {
    setShown(true);
    setSide((s) => (s === 'front' ? 'back' : 'front'));
  };

  commitRef.current = commit;
  revealRef.current = () => reveal();

  const checkTyped = () => {
    const ans = norm(typed);
    const target = norm(w.de);
    const art = w.pos === 'noun' ? (w.plOnly ? 'die' : w.g ? ARTICLE[w.g] : '') : '';
    let g: Grade;
    let msg: string;
    const parts = ans.split(' ');
    const typedWord = art && ['der', 'die', 'das'].includes(parts[0]) ? parts.slice(1).join(' ') : ans.replace(/^sich /, '');
    const typedArt = art && ['der', 'die', 'das'].includes(parts[0]) ? parts[0] : '';
    if (typedWord === target) {
      if (art && typedArt !== art) {
        g = 1;
        msg = typedArt ? `綴りは正解！ 冠詞は ${art} です` : `綴りは正解！ 冠詞 ${art} も覚えよう`;
      } else {
        g = 2;
        msg = '正解！';
      }
      if (typed.trim() !== '' && w.pos === 'noun' && typed.trim().replace(/^(der|die|das)\s+/i, '')[0] !== w.de[0]) msg += '（名詞は大文字で書き始めます）';
    } else {
      g = 0;
      msg = '不正解';
    }
    setResult({ g, msg });
    setShown(true);
  };

  const front =
    mode === 'de-ja' ? (
      <>
        <div className="row" style={{ justifyContent: 'center' }}>
          <GenderTag w={w} />
          <span className="tag">{POS_LABEL[w.pos]}</span>
          {isNew && <span className="tag accent">NEW</span>}
        </div>
        <div className={`big de${w.pos === 'noun' && w.g ? ' g-' + w.g : ''}`}>{headword(w)}</div>
        <Speak text={speechText(w)} />
      </>
    ) : (
      <>
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="tag">{POS_LABEL[w.pos]}</span>
          {isNew && <span className="tag accent">NEW</span>}
        </div>
        <div className="big" style={{ fontSize: '1.6rem' }}>
          {w.ja}
        </div>
      </>
    );

  const backFace = (
    <>
      <div className="row" style={{ justifyContent: 'center' }}>
        <GenderTag w={w} />
        <span className="tag">{POS_LABEL[w.pos]}</span>
      </div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <span className={`big de${w.pos === 'noun' && w.g ? ' g-' + w.g : ''}`} style={{ fontSize: mode === 'de-ja' ? '1.5rem' : '2rem' }}>
          {headword(w)}
        </span>
        <Speak small={mode === 'de-ja'} text={speechText(w)} />
      </div>
      <div style={{ fontSize: mode === 'de-ja' ? '1.6rem' : '1.2rem', fontWeight: 600 }}>{w.ja}</div>
      <Extra w={w} />
    </>
  );

  const back = (
    <div className="answer stack" style={{ gap: 6 }}>
      {mode === 'de-ja' ? (
        <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{w.ja}</div>
      ) : (
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className={`big de${w.pos === 'noun' && w.g ? ' g-' + w.g : ''}`} style={{ fontSize: '1.8rem' }}>
            {headword(w)}
          </span>
          <Speak text={speechText(w)} />
        </div>
      )}
      <Extra w={w} />
    </div>
  );

  const grades: { g: Grade; label: string; cls: string }[] = [
    { g: 0, label: 'もう一度', cls: 'g0' },
    { g: 1, label: '難しい', cls: 'g1' },
    { g: 2, label: '正解', cls: 'g2' },
    { g: 3, label: '簡単', cls: 'g3' },
  ];

  return (
    <div className="stack">
      <div className="row">
        <button className="back" onClick={onQuit}>
          <Icon name="x" size={18} /> 終了
        </button>
        <div className="spacer" />
        <span className="small muted">{Math.max(0, Math.max(total, remaining) - remaining)} / {Math.max(total, remaining)} 語</span>
      </div>
      <div className="progressbar">
        <div style={{ width: `${Math.max(4, (1 - remaining / Math.max(total, remaining, 1)) * 100)}%` }} />
      </div>
      {swipeable && (
        <div className="swipe-hint row tiny muted">
          <span className="sh-l">← 知らない</span>
          <span className="spacer" />
          <span className="sh-r">知ってる →</span>
        </div>
      )}
      <div
        className={`card flash${swipeable ? ' swipe' : ''}${drag ? ' dragging' : ''}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          startRef.current = null;
          setDrag(null);
        }}
        style={
          fly
            ? { transform: `translateX(${fly * 140}%) rotate(${fly * 24}deg)`, opacity: 0 }
            : drag
              ? { transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)` }
              : undefined
        }
      >
        {swipeable && (
          <>
            <div className="stamp stamp-yes" style={{ opacity: fly === 1 ? 1 : drag ? Math.max(0, Math.min(1, drag.x / 90)) : 0 }}>
              知ってる
            </div>
            <div className="stamp stamp-no" style={{ opacity: fly === -1 ? 1 : drag ? Math.max(0, Math.min(1, -drag.x / 90)) : 0 }}>
              知らない
            </div>
          </>
        )}
        {swipeable ? (
          <div key={side} className={`face face-${side} stack`} style={{ gap: 8, alignItems: 'center', width: '100%' }}>
            {side === 'front' ? front : backFace}
          </div>
        ) : (
          front
        )}
        {mode === 'type' && !shown && (
          <form
            style={{ width: '100%', maxWidth: 420 }}
            onSubmit={(e) => {
              e.preventDefault();
              checkTyped();
            }}
          >
            <input ref={inputRef} className="input de" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={w.pos === 'noun' ? '例: der Tisch' : 'ドイツ語で入力'} autoCapitalize="off" autoCorrect="off" spellCheck={false} lang="de" />
            <div className="umlauts" style={{ justifyContent: 'center' }}>
              {['ä', 'ö', 'ü', 'ß'].map((u) => (
                <button type="button" key={u} onClick={() => setTyped(typed + u)}>
                  {u}
                </button>
              ))}
            </div>
            <div className="row" style={{ marginTop: 8, justifyContent: 'center' }}>
              <button type="button" className="btn small" onClick={() => { setResult({ g: 0, msg: 'わからなかった' }); setShown(true); }}>
                わからない
              </button>
              <button type="submit" className="btn primary small">
                答え合わせ
              </button>
            </div>
          </form>
        )}
        {swipeable && <div className="tiny muted">{side === 'front' ? 'タップで裏返す ・ 左右にスワイプで判定' : 'タップで表に戻る'}</div>}
        {shown && result && (
          <div className={`alert ${result.g === 0 ? 'ng' : result.g === 1 ? 'warn' : 'ok'}`} style={{ width: '100%' }}>
            {result.msg}
            {result.g === 0 && typed && (
              <div className="small">
                あなたの答え: <span className="de">{typed}</span>
              </div>
            )}
          </div>
        )}
        {!swipeable && shown && back}
      </div>
      {shown &&
        (result ? (
          <div className="row">
            {result.g > 0 && (
              <button className="btn small ghost" onClick={() => onGrade(w.id, 0)}>
                やっぱり不正解にする
              </button>
            )}
            {result.g === 0 && (
              <button className="btn small ghost" onClick={() => onGrade(w.id, 2)}>
                実は正解（タイプミス）
              </button>
            )}
            <div className="spacer" />
            <button className="btn primary" autoFocus onClick={() => onGrade(w.id, result.g)}>
              次へ
            </button>
          </div>
        ) : (
          <div className="grades desktop-only">
            {grades.map((g) => (
              <button key={g.g} className={`btn ${g.cls}`} onClick={() => onGrade(w.id, g.g)}>
                {g.label}
                <small>{previewInterval(prog, g.g)}</small>
              </button>
            ))}
          </div>
        ))}
      {mode !== 'type' && (
        <button className={`btn block desktop-only${shown ? '' : ' primary'}`} onClick={reveal}>
          {side === 'front' ? '裏返す' : '表に戻す'}
        </button>
      )}
      {swipeable && !result && (
        <div className="swipe-btns mobile-only">
          <button className="btn sw-no" onClick={() => commit(false)} aria-label="知らない">
            <Icon name="x" size={26} />
            <span>知らない</span>
          </button>
          <button className="btn sw-flip" onClick={reveal}>
            {side === 'front' ? '裏返す' : '表へ'}
          </button>
          <button className="btn sw-yes" onClick={() => commit(true)} aria-label="知ってる">
            <Icon name="check" size={26} />
            <span>知ってる</span>
          </button>
        </div>
      )}
      {swipeable && <div className="tiny muted center desktop-only">キーボード: ← 知らない ／ → 知ってる ／ Space 裏返す</div>}
      {peek && (
        <div className="toast" role="status">
          <span className="de">{peek}</span>
        </div>
      )}
    </div>
  );
}

function Extra({ w }: { w: Word }) {
  if (w.pos === 'noun')
    return (
      <div className="small muted de">
        {w.plOnly ? '複数のみ' : w.pl ? `複数形: die ${w.pl}` : ''}
        {w.weak ? ' ・ 男性弱変化' : ''}
      </div>
    );
  if (w.pos === 'verb') {
    const f = verbForms(w);
    const reg = regularVerb(w.de, w.sep);
    const first = (x?: string) => (x || '').split(' ')[0];
    const irregular = PERSONS.map((p, i) => ({ p, f: f.pr?.[i] })).filter((x, i) => x.f && first(x.f) !== first(reg.pr?.[i]));
    const aux = (f.ax || '').startsWith('sein') ? 'ist' : 'hat';
    return (
      <div className="stack" style={{ gap: 8, width: '100%', maxWidth: 360 }}>
        <div className="principal" style={{ marginTop: 0 }}>
          <div>
            <div className="k">過去形</div>
            <div className="v de">{f.pt?.[0] ?? '—'}</div>
          </div>
          <div>
            <div className="k">過去分詞</div>
            <div className="v de">{f.pp ?? '—'}</div>
          </div>
          <div>
            <div className="k">完了</div>
            <div className={`v de${aux === 'ist' ? ' g-f' : ''}`}>{aux} …</div>
          </div>
        </div>
        {irregular.length > 0 && (
          <div className="irreg">
            <div className="k">注意：不規則な現在形</div>
            <div className="chips" style={{ justifyContent: 'center' }}>
              {irregular.map((x) => (
                <span key={x.p} className="chip de" style={{ cursor: 'default' }}>
                  <span className="muted">{x.p}</span> <b style={{ color: 'var(--red)' }}>{x.f}</b>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  if (w.pos === 'adj' && w.c?.[0]) return <div className="small muted de">{w.c[0]} ・ {w.c[1]}</div>;
  return null;
}
