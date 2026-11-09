import { retrievability, stage, type Stage } from './srs';
import type { Progress, ReviewLog, Word } from './types';

const DAY = 86400000;
export function startOfDay(t = Date.now()) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function stageCounts(words: Word[], progress: Map<string, Progress>) {
  const c: Record<Stage, number> = { new: 0, learning: 0, young: 0, mature: 0 };
  for (const w of words) c[stage(progress.get(w.id))]++;
  return c;
}

/** 学習済み語の推定定着率(平均想起確率) */
export function retention(words: Word[], progress: Map<string, Progress>, now = Date.now()) {
  let sum = 0;
  let n = 0;
  for (const w of words) {
    const p = progress.get(w.id);
    if (!p || !p.last) continue;
    sum += retrievability(p, now);
    n++;
  }
  return n ? sum / n : null;
}

export function accuracy(reviews: ReviewLog[], sinceMs: number) {
  const r = reviews.filter((x) => x.at >= sinceMs);
  if (!r.length) return null;
  return { rate: r.filter((x) => x.grade > 0).length / r.length, n: r.length };
}

export function streak(reviews: ReviewLog[], now = Date.now()) {
  const days = new Set(reviews.map((r) => startOfDay(r.at)));
  let s = 0;
  let d = startOfDay(now);
  if (!days.has(d)) d -= DAY; // 今日まだでも昨日まで続いていればカウント
  while (days.has(d)) {
    s++;
    d -= DAY;
  }
  return s;
}

export function newLearnedToday(reviews: ReviewLog[], now = Date.now()) {
  const first = new Map<string, number>();
  for (const r of reviews) if (!first.has(r.wordId)) first.set(r.wordId, r.at);
  const sod = startOfDay(now);
  let n = 0;
  for (const t of first.values()) if (t >= sod) n++;
  return n;
}

export function dueWords(words: Word[], progress: Map<string, Progress>, now = Date.now()) {
  return words.filter((w) => {
    const p = progress.get(w.id);
    return p && p.last && p.due <= now;
  });
}

/** 過去 n 日の日別回答数 */
export function dailyCounts(reviews: ReviewLog[], days = 14, now = Date.now()) {
  const sod = startOfDay(now);
  const out: { day: number; total: number; ok: number }[] = [];
  for (let i = days - 1; i >= 0; i--) out.push({ day: sod - i * DAY, total: 0, ok: 0 });
  for (const r of reviews) {
    const idx = out.findIndex((d) => r.at >= d.day && r.at < d.day + DAY);
    if (idx >= 0) {
      out[idx].total++;
      if (r.grade > 0) out[idx].ok++;
    }
  }
  return out;
}
