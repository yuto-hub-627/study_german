import { Icon } from '../components/Icon';
import { go } from '../lib/router';
import { stage } from '../lib/srs';
import { dailyCounts, dueWords, newLearnedToday, startOfDay, streak } from '../lib/stats';
import { useNow, useStore } from '../lib/store';

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
  const st = streak(reviews, now);
  const todayCount = reviews.filter((r) => r.at >= startOfDay(now)).length;
  const composeLast = quiz.get('compose')?.last;
  const daily = dailyCounts(reviews, 14, now);
  const maxDaily = Math.max(1, ...daily.map((d) => d.total));



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
          <button className="btn" onClick={() => go('/study/words')}>
            学習をはじめる
          </button>
        </div>
      </div>

      <a href="#/compose" className="card lesson-card" style={{ color: 'inherit' }}>
        <span className="lesson-badge" style={{ fontSize: '0.95rem' }}>
          <Icon name="edit" size={22} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>作文練習</div>
          <div className="small muted">
            カードを並べて文を作る。動詞・冠詞は長押しで活用形に
            {composeLast !== undefined ? ` ・ 前回 ${Math.round(composeLast * 100)}%` : ''}
          </div>
        </div>
        <Icon name="chevron" size={18} />
      </a>

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

    </div>
  );
}
