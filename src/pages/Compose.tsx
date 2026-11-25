import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Speak } from '../components/Speak';
import { go } from '../lib/router';
import { saveQuiz, saveSettings, useStore } from '../lib/store';
import { LESSONS } from '../lib/types';

/** 作文問題のデータ (scripts/build_compose.py) */
type RawTile = string | [string, string];
interface ComposeData {
  s: [string, string, number, RawTile[]][];
  g: Record<string, [string, string][]>;
}
interface Tile {
  id: number;
  /** 選択肢グループ (動詞・冠詞・形容詞・名詞)。なければ形を変えられない */
  key?: string;
  /** 今の形 (最初は基本形) */
  cur: string;
  dummy?: boolean;
}
interface Q {
  de: string;
  ja: string;
  answer: string[];
  keys: (string | undefined)[];
  tiles: Tile[];
}

let dataCache: Promise<ComposeData> | null = null;
function loadCompose(): Promise<ComposeData> {
  if (!dataCache)
    dataCache = fetch(`${import.meta.env.BASE_URL}dict/compose.json`)
      .then((r) => {
        if (!r.ok) throw new Error('作文問題を読み込めませんでした');
        return r.json() as Promise<ComposeData>;
      })
      .catch((e) => {
        dataCache = null;
        throw e;
      });
  return dataCache;
}

const KIND_LABEL: Record<string, string> = { v: '動詞', a: '冠詞', j: '形容詞', n: '名詞' };

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const same = (a: string, b: string, first: boolean) => (first ? a.toLowerCase() === b.toLowerCase() : a === b);

function makeQuestions(data: ComposeData, lessons: string[], outside: boolean, count: number, dummy: boolean): Q[] {
  const lv = new Set(lessons.map((l) => LESSONS.indexOf(l)));
  const all = lessons.length === 0 && !outside;
  const pool = data.s.filter(([, , l]) => all || (l >= 0 ? lv.has(l) : outside));
  const picked = shuffle(pool).slice(0, count);
  let id = 0;
  return picked.map(([de, ja, , raw]) => {
    const answer = raw.map((t) => (typeof t === 'string' ? t : t[0]));
    const keys = raw.map((t) => (typeof t === 'string' ? undefined : t[1]));
    const tiles: Tile[] = raw.map((t) => (typeof t === 'string' ? { id: id++, cur: t } : { id: id++, key: t[1], cur: data.g[t[1]]?.[0]?.[0] ?? t[0] }));
    if (dummy) {
      // ほかの文から、この文にない語を 2〜3 枚 (基本形で)
      const have = new Set(tiles.map((t) => t.key || t.cur.toLowerCase()));
      const n = 2 + Math.floor(Math.random() * 2);
      for (let tries = 0; tiles.filter((t) => t.dummy).length < n && tries < 40; tries++) {
        const other = data.s[Math.floor(Math.random() * data.s.length)][3];
        const t = other[Math.floor(Math.random() * other.length)];
        const key = typeof t === 'string' ? undefined : t[1];
        const cur = typeof t === 'string' ? t : data.g[t[1]]?.[0]?.[0] ?? t[0];
        if (have.has(key || cur.toLowerCase())) continue;
        have.add(key || cur.toLowerCase());
        tiles.push({ id: id++, key, cur, dummy: true });
      }
    }
    return { de, ja, answer, keys, tiles: shuffle(tiles) };
  });
}

export function Compose() {
  const settings = useStore((s) => s.settings);
  const [data, setData] = useState<ComposeData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lessons, setLessons] = useState<string[]>(settings.composeLessons ?? []);
  const [outside, setOutside] = useState(settings.composeOutside ?? false);
  const [count, setCount] = useState(settings.composeCount ?? 10);
  const [dummy, setDummy] = useState(settings.composeDummy ?? false);
  const [qs, setQs] = useState<Q[] | null>(null);

  useEffect(() => {
    loadCompose().then(setData, (e: Error) => setErr(e.message));
  }, []);

  const avail = useMemo(() => {
    if (!data) return 0;
    const lv = new Set(lessons.map((l) => LESSONS.indexOf(l)));
    const all = lessons.length === 0 && !outside;
    return data.s.filter(([, , l]) => all || (l >= 0 ? lv.has(l) : outside)).length;
  }, [data, lessons, outside]);

  const start = () => {
    if (!data) return;
    void saveSettings({ composeLessons: lessons, composeOutside: outside, composeCount: count, composeDummy: dummy });
    setQs(makeQuestions(data, lessons, outside, count, dummy));
  };

  if (qs) return <ComposeSession qs={qs} groups={data!.g} onQuit={() => setQs(null)} onAgain={start} />;

  const toggle = (l: string) => setLessons((ls) => (ls.includes(l) ? ls.filter((x) => x !== l) : [...ls, l]));

  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => go('/study')}>
          <Icon name="back" size={18} /> 学習
        </button>
        <h1 style={{ fontSize: '1.15rem' }}>作文問題</h1>
        <span style={{ width: 60 }} />
      </div>
      <div className="card small muted stack" style={{ gap: 4 }}>
        <div>日本語の文に合うように、カードを並べてドイツ語の文を作ります。</div>
        <div>
          カードは<b>基本形</b>で出ます。動詞・冠詞・形容詞・名詞のカードは<b>長押し</b>（PCは右クリック）で形を変えられます。人称変化や格変化を自分で選んで覚えましょう。
        </div>
      </div>

      <div className="card stack">
        <div>
          <h3>範囲（教科書の課）</h3>
          <div className="small muted" style={{ marginBottom: 8 }}>
            選んだ課の単語を使った文が出ます。何も選ばなければ全部から出ます。
          </div>
          <div className="chips">
            {LESSONS.map((l) => (
              <button key={l} className={`chip${lessons.includes(l) ? ' on' : ''}`} onClick={() => toggle(l)}>
                {l}
              </button>
            ))}
            <button className={`chip${outside ? ' on' : ''}`} onClick={() => setOutside(!outside)}>
              教科書にない単語の文
            </button>
          </div>
        </div>
        <div>
          <h3>
            問題数 <b>{Math.min(count, avail || count)}</b> 問
          </h3>
          <input type="range" min={5} max={30} step={1} value={count} onChange={(e) => setCount(+e.target.value)} style={{ width: '100%' }} aria-label="問題数" />
          {data && <div className="tiny muted">この範囲の問題: {avail.toLocaleString()} 問</div>}
        </div>
        <label className="row" style={{ gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={dummy} onChange={(e) => setDummy(e.target.checked)} style={{ width: 20, height: 20 }} />
          <span>
            ダミーのカードを混ぜる
            <span className="small muted">（答えに使わないカードが2〜3枚まざる）</span>
          </span>
        </label>
        {err && <div className="alert ng small">{err}</div>}
        <button className="btn primary block" disabled={!data || avail === 0} onClick={start}>
          {data ? 'はじめる' : '読み込み中…'}
        </button>
      </div>
    </div>
  );
}

function ComposeSession({ qs, groups, onQuit, onAgain }: { qs: Q[]; groups: ComposeData['g']; onQuit: () => void; onAgain: () => void }) {
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [tiles, setTiles] = useState<Tile[]>(qs[0].tiles);
  const [menu, setMenu] = useState<number | null>(null);
  const [res, setRes] = useState<null | { ok: boolean; marks: boolean[] }>(null);
  const [score, setScore] = useState({ ok: 0, wrong: [] as string[] });
  const [finished, setFinished] = useState(false);
  const press = useRef<{ id: number; t: number; fired: boolean } | null>(null);
  const q = qs[i];

  useEffect(() => {
    setTiles(qs[i].tiles);
    setPlaced([]);
    setRes(null);
    setMenu(null);
  }, [i, qs]);

  const byId = (id: number) => tiles.find((t) => t.id === id)!;
  const tap = (id: number) => {
    if (res) return;
    setPlaced((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const openMenu = (id: number) => {
    if (res || !byId(id).key) return;
    if (navigator.vibrate) navigator.vibrate(15);
    setMenu(id);
  };
  const onDown = (id: number) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = window.setTimeout(() => {
      if (press.current?.id === id) {
        press.current.fired = true;
        openMenu(id);
      }
    }, 420);
    press.current = { id, t, fired: false };
  };
  const onUp = (id: number) => () => {
    const p = press.current;
    press.current = null;
    if (!p || p.id !== id) return;
    clearTimeout(p.t);
    if (!p.fired) tap(id);
  };
  const onCancel = () => {
    if (press.current) clearTimeout(press.current.t);
    press.current = null;
  };

  const check = () => {
    const words = placed.map((id) => byId(id).cur);
    const marks = q.answer.map((a, k) => words[k] !== undefined && same(words[k], a, k === 0));
    const ok = words.length === q.answer.length && marks.every(Boolean);
    setRes({ ok, marks });
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), wrong: ok ? s.wrong : [...s.wrong, q.de] }));
  };
  const next = () => {
    if (i + 1 >= qs.length) {
      const total = qs.length;
      void saveQuiz('compose', score.ok / total, score.wrong);
      setFinished(true);
    } else setI(i + 1);
  };

  if (finished)
    return (
      <div className="stack">
        <div className="card center stack" style={{ padding: 28 }}>
          <h2 style={{ margin: 0 }}>おつかれさま！</h2>
          <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>
            {score.ok} / {qs.length}
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn primary" onClick={onAgain}>
              同じ条件でもう一度
            </button>
            <button className="btn" onClick={onQuit}>
              条件を変える
            </button>
          </div>
        </div>
        {score.wrong.length > 0 && (
          <div className="card">
            <h3>まちがえた文</h3>
            <div className="examples">
              {qs
                .filter((x) => score.wrong.includes(x.de))
                .map((x) => (
                  <div key={x.de} className="ex-item">
                    <div className="row" style={{ flexWrap: 'nowrap', gap: 8 }}>
                      <div className="de" style={{ flex: 1 }}>
                        {x.de}
                      </div>
                      <Speak small text={x.de} />
                    </div>
                    <div className="ja small">{x.ja}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );

  const bank = tiles.filter((t) => !placed.includes(t.id));
  const endPunct = q.de.trim().slice(-1);
  const menuTile = menu !== null ? byId(menu) : null;
  // 不正解のとき、形が違ったカードの正しい形と説明
  const fixes =
    res && !res.ok
      ? q.answer
          .map((a, k) => ({ a, k, key: q.keys[k] }))
          .filter(({ key }) => key)
          .map(({ a, key }) => ({ a, base: groups[key!]?.[0]?.[0], why: groups[key!]?.find((f) => f[0] === a)?.[1] }))
          .filter((f) => f.base && f.base !== f.a)
      : [];

  const tileEl = (t: Tile, inAnswer: boolean, k?: number) => (
    <button
      key={t.id}
      className={`ctile de${t.key ? ' chg' : ''}${res && inAnswer && k !== undefined ? (res.marks[k] ? ' ok' : ' ng') : ''}`}
      onPointerDown={onDown(t.id)}
      onPointerUp={onUp(t.id)}
      onPointerLeave={onCancel}
      onPointerCancel={onCancel}
      onContextMenu={(e) => {
        e.preventDefault();
        onCancel();
        openMenu(t.id);
      }}
      disabled={!!res}
    >
      {k === 0 ? t.cur.charAt(0).toUpperCase() + t.cur.slice(1) : t.cur}
    </button>
  );

  return (
    <div className="stack compose">
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <button className="btn ghost small" onClick={onQuit} aria-label="やめる">
          <Icon name="x" size={18} />
        </button>
        <div className="progress" style={{ flex: 1 }}>
          <div style={{ width: `${(i / qs.length) * 100}%` }} />
        </div>
        <span className="small muted">
          {i + 1} / {qs.length}
        </span>
      </div>

      <div className="card">
        <div className="tiny muted">この文をドイツ語に</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 4 }}>{q.ja}</div>
      </div>

      <div className="answer-line">
        {placed.map((id, k) => tileEl(byId(id), true, k))}
        {placed.length > 0 && <span className="de punct">{endPunct}</span>}
        {placed.length === 0 && <span className="tiny muted">下のカードをタップして並べる</span>}
      </div>

      <div className="tile-bank">{bank.map((t) => tileEl(t, false))}</div>
      {!res && <div className="tiny muted center">点のついたカードは長押しで形を変えられます</div>}

      {res && (
        <div className={`card ${res.ok ? 'compose-ok' : 'compose-ng'}`}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{res.ok ? '正解！' : '正解はこちら'}</div>
          <div className="row" style={{ flexWrap: 'nowrap', gap: 8 }}>
            <div className="de" style={{ flex: 1, fontSize: '1.1rem' }}>
              {q.de}
            </div>
            <Speak small text={q.de} />
          </div>
          {fixes.length > 0 && (
            <ul className="small" style={{ margin: '8px 0 0', paddingLeft: '1.2em' }}>
              {fixes.map((f) => (
                <li key={f.a}>
                  <b className="de">{f.base}</b> → <b className="de">{f.a}</b>
                  {f.why && <span className="muted">（{f.why}）</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="compose-actions">
        {res ? (
          <button className="btn primary block" onClick={next}>
            {i + 1 >= qs.length ? '結果を見る' : '次へ'}
          </button>
        ) : (
          <button className="btn primary block" disabled={placed.length === 0} onClick={check}>
            答え合わせ
          </button>
        )}
      </div>

      {menuTile && menuTile.key && (
        <div className="sheet-backdrop" onClick={() => setMenu(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="形を選ぶ">
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="tag">{KIND_LABEL[menuTile.key[0]]}</span>
              <b className="de">{groups[menuTile.key]?.[0]?.[0]}</b>
              <span className="small muted">の形を選ぶ</span>
              <div className="spacer" />
              <button className="btn ghost small" onClick={() => setMenu(null)} aria-label="閉じる">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="form-list">
              {(groups[menuTile.key] || []).map(([f, why]) => (
                <button
                  key={f}
                  className={`form-opt${f === menuTile.cur ? ' on' : ''}`}
                  onClick={() => {
                    setTiles((ts) => ts.map((t) => (t.id === menuTile.id ? { ...t, cur: f } : t)));
                    setMenu(null);
                  }}
                >
                  <span className="de">{f}</span>
                  <span className="tiny muted">{why}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 学習タブ: 単語学習・文法問題・作文問題 */
export function StudyHub() {
  const items = [
    { href: '#/study/words', icon: 'words', label: '単語学習', sub: 'カードで覚える' },
    { href: '#/grammar', icon: 'grammar', label: '文法問題', sub: '課ごとの練習' },
    { href: '#/compose', icon: 'edit', label: '作文問題', sub: 'カードを並べる' },
  ];
  return (
    <div className="stack">
      <div className="topbar">
        <h1>学習</h1>
      </div>
      <div className="hub">
        {items.map((it) => (
          <a key={it.href} href={it.href} className="hub-item">
            <span className="hub-circle">
              <Icon name={it.icon} size={34} />
            </span>
            <b>{it.label}</b>
            <span className="tiny muted">{it.sub}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
