import type { Stage } from '../lib/srs';

const COLORS: Record<Stage, string> = { new: 'var(--bg-sunk)', learning: 'var(--warn)', young: 'var(--accent)', mature: 'var(--ok)' };
const LABEL: Record<Stage, string> = { new: '未学習', learning: '学習中', young: '復習中', mature: '定着' };

export function StageBar({ c, legend }: { c: Record<Stage, number>; legend?: boolean }) {
  const total = c.new + c.learning + c.young + c.mature || 1;
  const order: Stage[] = ['mature', 'young', 'learning', 'new'];
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="sbar" role="img" aria-label={order.map((s) => `${LABEL[s]} ${c[s]}`).join('、')}>
        {order.map((s) => (c[s] ? <div key={s} style={{ width: `${(c[s] / total) * 100}%`, background: COLORS[s] }} /> : null))}
      </div>
      {legend && (
        <div className="legend">
          {order.map((s) => (
            <span key={s}>
              <i style={{ background: COLORS[s], border: s === 'new' ? '1px solid var(--line)' : undefined }} />
              {LABEL[s]} {c[s]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
