import type { Grade, Progress } from './types';

const DAY = 86400000;

export function newProgress(id: string, now = Date.now()): Progress {
  return { id, reps: 0, lapses: 0, ease: 2.5, interval: 0, due: now, hist: [], updatedAt: now };
}

/**
 * SM-2 を簡略化した間隔反復。
 * grade 0: もう一度(不正解) / 1: 難しい / 2: 正解 / 3: 簡単
 */
export function review(p: Progress, grade: Grade, now = Date.now()): Progress {
  const q = { ...p, hist: [...p.hist] };
  q.last = now;
  q.updatedAt = now;
  q.hist.push(grade === 0 ? 0 : 1);
  if (q.hist.length > 20) q.hist.shift();
  if (grade === 0) {
    q.lapses += 1;
    q.reps = 0;
    q.interval = 0;
    q.ease = Math.max(1.3, q.ease - 0.2);
    q.due = now + 60 * 1000; // 1分後にもう一度
    return q;
  }
  q.reps += 1;
  if (grade === 1) q.ease = Math.max(1.3, q.ease - 0.15);
  if (grade === 3) q.ease = Math.min(3.0, q.ease + 0.15);
  let iv: number;
  if (q.reps === 1) iv = grade === 3 ? 3 : grade === 1 ? 0.5 : 1;
  else if (q.reps === 2) iv = grade === 3 ? 7 : grade === 1 ? 2 : 3;
  else iv = Math.max(1, q.interval * (grade === 1 ? 1.2 : q.ease) * (grade === 3 ? 1.3 : 1));
  q.interval = Math.round(iv * 10) / 10;
  q.due = now + q.interval * DAY;
  return q;
}

/** 推定記憶保持率 R = 0.9^(経過日数 / 間隔) (間隔日数後に90%の想起率と仮定) */
export function retrievability(p: Progress | undefined, now = Date.now()): number {
  if (!p || !p.last || p.interval <= 0) return 0;
  const t = (now - p.last) / DAY;
  return Math.pow(0.9, t / p.interval);
}

export type Stage = 'new' | 'learning' | 'young' | 'mature';
export function stage(p: Progress | undefined): Stage {
  if (!p || (!p.last && p.reps === 0)) return 'new';
  if (p.interval < 1) return 'learning';
  if (p.interval < 21) return 'young';
  return 'mature';
}

export const STAGE_LABEL: Record<Stage, string> = {
  new: '未学習',
  learning: '学習中',
  young: '復習中',
  mature: '定着',
};

/** 次回の間隔の目安 (ボタン表示用) */
export function previewInterval(p: Progress, grade: Grade): string {
  const r = review(p, grade, 0);
  if (grade === 0) return '1分';
  const d = r.interval;
  if (d < 1) return `${Math.round(d * 24)}時間`;
  if (d < 30) return `${Math.round(d)}日`;
  if (d < 365) return `${Math.round(d / 30)}か月`;
  return `${(d / 365).toFixed(1)}年`;
}
