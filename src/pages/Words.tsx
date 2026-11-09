import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { GenderTag } from '../components/WordTables';
import { fold } from '../lib/lexicon';
import { go } from '../lib/router';
import { stage } from '../lib/srs';
import { headword, speechText } from '../lib/german';
import { useStore } from '../lib/store';
import { LESSONS, POS_LABEL, POS_ORDER, type Pos, type Word } from '../lib/types';

export function Words({ query }: { query: URLSearchParams }) {
  const words = useStore((s) => s.words);
  const progress = useStore((s) => s.progress);
  const [q, setQ] = useState('');
  const [src, setSrc] = useState<string>(query.get('lesson') || 'all');
  const [pos, setPos] = useState<Pos | 'all'>((query.get('pos') as Pos) || 'all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const fq = fold(q);
    return words.filter((w) => {
      if (src === 'user' && w.src !== 'user') return false;
      if (src !== 'all' && src !== 'user' && w.lesson !== src) return false;
      if (pos !== 'all' && w.pos !== pos) return false;
      if (q) {
        if (/[぀-ヿ一-鿿]/.test(q)) return w.ja.includes(q);
        return fold(w.de).includes(fq) || (w.pl ? fold(w.pl).includes(fq) : false);
      }
      return true;
    });
  }, [words, q, src, pos]);

  const groups = POS_ORDER.map((p) => ({ p, list: filtered.filter((w) => w.pos === p).sort((a, b) => a.de.localeCompare(b.de, 'de')) })).filter((g) => g.list.length);
  const userCount = words.filter((w) => w.src === 'user').length;

  return (
    <div className="stack">
      <div className="topbar">
        <h1>単語帳</h1>
        <button className="btn primary small" onClick={() => go('/add')}>
          <Icon name="plus" size={18} /> 単語を追加
        </button>
      </div>
      <div className="suggest">
        <input className="input" placeholder="検索（ドイツ語 または 日本語）" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="chips" role="group" aria-label="課で絞り込み">
        <button className={`chip${src === 'all' ? ' on' : ''}`} onClick={() => setSrc('all')}>
          すべて <span className="count">{words.length}</span>
        </button>
        <button className={`chip${src === 'user' ? ' on' : ''}`} onClick={() => setSrc('user')}>
          自分で追加 <span className="count">{userCount}</span>
        </button>
        {LESSONS.map((l) => (
          <button key={l} className={`chip${src === l ? ' on' : ''}`} onClick={() => setSrc(l)}>
            {l}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="品詞で絞り込み">
        <button className={`chip${pos === 'all' ? ' on' : ''}`} onClick={() => setPos('all')}>
          全品詞
        </button>
        {POS_ORDER.filter((p) => words.some((w) => w.pos === p)).map((p) => (
          <button key={p} className={`chip${pos === p ? ' on' : ''}`} onClick={() => setPos(p)}>
            {POS_LABEL[p]}
          </button>
        ))}
      </div>
      {groups.length === 0 && <div className="empty">該当する単語がありません</div>}
      {groups.map(({ p, list }) => {
        const isOpen = open[p] ?? (groups.length <= 3 || !!q || list.length <= 30);
        return (
          <div className="card" key={p} style={{ padding: '8px 16px' }}>
            <button className="row btn ghost block" style={{ justifyContent: 'flex-start', padding: '8px 0' }} onClick={() => setOpen({ ...open, [p]: !isOpen })} aria-expanded={isOpen}>
              <h3 style={{ margin: 0 }}>{POS_LABEL[p]}</h3>
              <span className="tag">{list.length}</span>
              <span className="spacer" />
              <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', display: 'inline-flex' }}>
                <Icon name="chevron" size={18} />
              </span>
            </button>
            {isOpen && (
              <div className="wlist">
                {list.map((w) => (
                  <WordRow key={w.id} w={w} st={stage(progress.get(w.id))} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WordRow({ w, st }: { w: Word; st: string }) {
  return (
    <div className="witem" onClick={() => go(`/word/${encodeURIComponent(w.id)}`)}>
      <span className={`dot ${st}`} title={st} />
      <div className="body">
        <div className="row" style={{ gap: 6 }}>
          <span className={`de${w.pos === 'noun' && w.g ? ' g-' + w.g : ''}`}>{headword(w)}</span>
          <GenderTag w={w} />
          {w.pos === 'noun' && w.pl && <span className="tiny muted de">Pl. {w.pl}</span>}
          {w.pos === 'verb' && w.v?.pp && <span className="tiny muted de">{w.v.pt?.[0]} – {w.v.pp}</span>}
        </div>
        <div className="ja">{w.ja}</div>
      </div>
      {w.lesson && <span className="tag">{w.lesson}</span>}
      {w.src === 'user' && <span className="tag accent">追加</span>}
      <Speak small text={speechText(w)} />
    </div>
  );
}
