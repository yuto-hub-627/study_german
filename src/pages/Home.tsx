import { StageBar } from '../components/StageBar';
import { LESSONS_GRAMMAR } from '../data/grammar';
import { go } from '../lib/router';
import { stage } from '../lib/srs';
import { accuracy, dailyCounts, dueWords, newLearnedToday, retention, stageCounts, startOfDay, streak } from '../lib/stats';
import { useNow, useStore } from '../lib/store';
import { POS_LABEL, POS_ORDER, type Pos } from '../lib/types';

const DAY = 86400000;

export function Home() {
  const words = useStore((s) => s.words);
  const progress = useStore((s) => s.progress);
  const reviews = useStore((s) => s.reviews);
  const quiz = useStore((s) => s.quiz);
  const settings = useStore((s) => s.settings);
  const now = useNow();

  const due = dueWords(words, progress, now).length;
  const learnedToday = newLearnedToday(reviews, now);
  const newLeft = Math.max(0, settings.dailyNew - learnedToday);
  const unlearned = words.filter((w) => stage(progress.get(w.id)) === 'new').length;
  const ret = retention(words, progress, now);
  const acc7 = accuracy(reviews, now - 7 * DAY);
  const st = streak(reviews, now);
  const sc = stageCounts(words, progress);
  const todayCount = reviews.filter((r) => r.at >= startOfDay(now)).length;
  const daily = dailyCounts(reviews, 14, now);
  const maxDaily = Math.max(1, ...daily.map((d) => d.total));

  const byPos = POS_ORDER.map((p) => {
    const ws = words.filter((w) => w.pos === p);
    return { p, n: ws.length, c: stageCounts(ws, progress) };
  }).filter((x) => x.n > 0);

  const gramDone = LESSONS_GRAMMAR.filter((l) => (quiz.get(l.id)?.best ?? 0) >= 0.8).length;

  return (
    <div className="stack">
      <div className="topbar">
        <h1>Guten Tag! 👋</h1>
      </div>

      <div className="card hero-today">
        <div className="row">
          <div>
            <div className="small" style={{ opacity: 0.85 }}>今日の学習</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              復習 {due} 語 ・ 新規 {Math.min(newLeft, unlearned)} 語
            </div>
            <div className="small" style={{ opacity: 0.85 }}>今日の回答 {todayCount} 回{st > 0 ? ` ・ ${st}日連続 🔥` : ''}</div>
          </div>
          <div className="spacer" />
          <button className="btn" onClick={() => go('/study')}>
            学習をはじめる
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card stat">
          <div className="label">推定定着率</div>
          <div className="value">{ret === null ? '—' : `${Math.round(ret * 100)}%`}</div>
          <div className="sub">学習済みの語を今テストした場合の想起率</div>
        </div>
        <div className="card stat">
          <div className="label">正答率（7日）</div>
          <div className="value">{acc7 ? `${Math.round(acc7.rate * 100)}%` : '—'}</div>
          <div className="sub">{acc7 ? `${acc7.n} 回の回答` : 'まだ回答がありません'}</div>
        </div>
        <div className="card stat">
          <div className="label">定着した語</div>
          <div className="value">
            {sc.mature}
            <span className="small muted"> / {words.length}</span>
          </div>
          <div className="sub">復習間隔が21日以上になった語</div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>単語の習得状況</h3>
          <div className="spacer" />
          <a href="#/words" className="small">教科書単語へ →</a>
        </div>
        <StageBar c={sc} legend />
        <div className="section-title">品詞別</div>
        <div className="stack" style={{ gap: 10 }}>
          {byPos.map(({ p, n, c }) => (
            <div key={p} className="row" style={{ flexWrap: 'nowrap', cursor: 'pointer' }} onClick={() => go(`/words?pos=${p}`)}>
              <div style={{ width: 92, flexShrink: 0 }} className="small">
                {POS_LABEL[p as Pos]}
              </div>
              <div style={{ flex: 1 }}>
                <StageBar c={c} />
              </div>
              <div className="tiny muted" style={{ width: 64, textAlign: 'right', flexShrink: 0 }}>
                {Math.round(((c.young + c.mature) / n) * 100)}% / {n}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>最近2週間の学習</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
          {daily.map((d) => (
            <div key={d.day} title={`${new Date(d.day).toLocaleDateString('ja-JP')} ${d.total}回 (正解${d.ok})`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ height: `${((d.total - d.ok) / maxDaily) * 100}%`, background: 'var(--red)', borderRadius: '4px 4px 0 0', border: '1.5px solid var(--black)', borderBottom: 0 }} />
              <div style={{ height: `${(d.ok / maxDaily) * 100}%`, background: 'var(--black)', borderRadius: d.total === d.ok ? '4px 4px 0 0' : 0, minHeight: d.total ? 2 : 0 }} />
            </div>
          ))}
        </div>
        <div className="row tiny muted" style={{ justifyContent: 'space-between', marginTop: 4 }}>
          <span>{new Date(daily[0].day).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
          <span className="legend">
            <span><i style={{ background: 'var(--black)' }} />正解</span>
            <span><i style={{ background: 'var(--red)' }} />不正解</span>
          </span>
          <span>今日</span>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>文法</h3>
          <div className="spacer" />
          <span className="small muted">
            合格 {gramDone} / {LESSONS_GRAMMAR.length} 課
          </span>
        </div>
        <div className="chips">
          {LESSONS_GRAMMAR.map((l) => {
            const r = quiz.get(l.id);
            const cls = r ? (r.best >= 0.8 ? 'tag ok' : 'tag warn') : 'tag';
            return (
              <a key={l.id} href={`#/grammar/${l.id}`} className={cls} style={{ padding: '6px 10px', fontSize: '0.8rem' }} title={l.title}>
                {l.id} {r ? `${Math.round(r.best * 100)}%` : ''}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
