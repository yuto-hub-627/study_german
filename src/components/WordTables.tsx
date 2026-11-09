import { ADJ_ENDINGS, ARTICLE, CASES, DEF, INDEF, adjStem, comparison, declineNoun, perfect, PERSONS, regularVerb, verbForms, withRefl } from '../lib/german';
import type { Word } from '../lib/types';
import { Speak } from './Speak';

function Cell({ v, reg }: { v?: string; reg?: string }) {
  if (!v) return <td>—</td>;
  const changed = reg && v.replace(/\s.*/, '') !== reg.replace(/\s.*/, '');
  return <td className={changed ? 'changed hl' : 'hl'}>{v}</td>;
}

export function VerbPrincipal({ w }: { w: Word }) {
  const f = verbForms(w);
  const prs = f.pr?.[2] ?? '';
  const aux = (f.ax || 'haben').startsWith('sein') ? 'sein' : 'haben';
  return (
    <div className="principal">
      <div>
        <div className="k">不定詞</div>
        <div className="v de">{w.refl ? 'sich ' : ''}{w.de}</div>
      </div>
      <div>
        <div className="k">過去基本形</div>
        <div className="v de">{f.pt?.[0] ?? '—'}</div>
      </div>
      <div>
        <div className="k">過去分詞</div>
        <div className="v de">{f.pp ?? '—'}</div>
      </div>
      <div>
        <div className="k">現在 er</div>
        <div className="v de">{prs}</div>
      </div>
      <div>
        <div className="k">完了の助動詞</div>
        <div className={`v ${aux === 'sein' ? 'g-f' : ''}`}>{f.ax === 'sein/haben' || f.ax === 'haben/sein' ? f.ax : aux}</div>
      </div>
      <div>
        <div className="k">命令 du / ihr</div>
        <div className="v de">{f.im ? `${f.im[0]}! / ${f.im[1]}!` : '—'}</div>
      </div>
    </div>
  );
}

export function VerbTable({ w }: { w: Word }) {
  const f = verbForms(w);
  const reg = regularVerb(w.de, w.sep);
  const pr = withRefl(f.pr, w);
  const pt = withRefl(f.pt, w);
  const k2 = withRefl(f.k2, w);
  const pf = perfect(w);
  return (
    <div className="stack">
      {f.estimated && <div className="alert warn small">辞書に活用データがないため、規則変化として推定した形を表示しています。</div>}
      <div className="table-wrap">
        <table className="t de">
          <thead>
            <tr>
              <th>人称</th>
              <th>現在</th>
              <th>過去</th>
              <th>現在完了</th>
            </tr>
          </thead>
          <tbody>
            {PERSONS.map((p, i) => (
              <tr key={p}>
                <td>{p}</td>
                <Cell v={pr?.[i]} reg={reg.pr?.[i]} />
                <Cell v={pt?.[i]} reg={reg.pt?.[i]} />
                <td>{pf[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tiny muted" style={{ margin: 0 }}>
        <span className="changed" style={{ color: 'var(--ng)', fontWeight: 700 }}>赤字</span> = 規則変化と違う形（不規則・母音交替など）
      </p>
      <details>
        <summary className="small muted" style={{ cursor: 'pointer' }}>接続法II式</summary>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table className="t de">
            <tbody>
              {PERSONS.map((p, i) => (
                <tr key={p}>
                  <td>{p}</td>
                  <td className="hl">{k2?.[i] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function NounTable({ w }: { w: Word }) {
  const d = declineNoun(w);
  if (!d.sg && !d.pl) return null;
  return (
    <div className="table-wrap">
      <table className="t de">
        <thead>
          <tr>
            <th>格</th>
            {d.sg && <th>単数</th>}
            {d.pl && <th>複数</th>}
          </tr>
        </thead>
        <tbody>
          {CASES.map((c, i) => (
            <tr key={c}>
              <td>{c}</td>
              {d.sg && (
                <td className={`hl g-${w.g}`}>
                  {d.sg[i]} {i === 0 && <Speak small text={d.sg[i]} />}
                </td>
              )}
              {d.pl && (
                <td className="hl g-pl">
                  {d.pl[i]} {i === 0 && <Speak small text={d.pl[i]} />}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdjTable({ w }: { w: Word }) {
  const [cmp, sup] = comparison(w);
  const st = adjStem(w.de);
  const ex = { m: 'Rock', f: 'Hose', n: 'Kleid', pl: 'Schuhe' } as const;
  const genders = ['m', 'f', 'n'] as const;
  return (
    <div className="stack">
      <div className="principal">
        <div>
          <div className="k">原級</div>
          <div className="v de">{w.de}</div>
        </div>
        <div>
          <div className="k">比較級</div>
          <div className="v de">{cmp}</div>
        </div>
        <div>
          <div className="k">最上級</div>
          <div className="v de">{sup}</div>
        </div>
      </div>
      <details>
        <summary className="small muted" style={{ cursor: 'pointer' }}>名詞の前での語尾変化（付加語的用法）</summary>
        <div className="stack" style={{ marginTop: 8 }}>
          {(['weak', 'mixed', 'strong'] as const).map((kind) => (
            <div key={kind}>
              <div className="small" style={{ fontWeight: 600, margin: '4px 0' }}>
                {kind === 'weak' ? '弱変化（der / dieser ＋）' : kind === 'mixed' ? '混合変化（ein / mein / kein ＋）' : '強変化（無冠詞）'}
              </div>
              <div className="table-wrap">
                <table className="t de">
                  <thead>
                    <tr>
                      <th></th>
                      <th>男性</th>
                      <th>女性</th>
                      <th>中性</th>
                      <th>複数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CASES.map((c, i) => (
                      <tr key={c}>
                        <td>{c.slice(0, 2)}</td>
                        {genders.map((g) => {
                          const art = kind === 'weak' ? DEF[g][i] + ' ' : kind === 'mixed' ? INDEF[g][i] + ' ' : '';
                          return (
                            <td key={g}>
                              {art}
                              <b className={`g-${g}`}>{st + ADJ_ENDINGS[kind][g][i]}</b> {ex[g]}
                              {i === 1 && g !== 'f' ? '(e)s' : ''}
                            </td>
                          );
                        })}
                        <td>
                          {kind === 'weak' ? DEF.pl[i] + ' ' : kind === 'mixed' ? ['meine', 'meiner', 'meinen', 'meine'][i] + ' ' : ''}
                          <b className="g-pl">{st + ADJ_ENDINGS[kind].pl[i]}</b> {ex.pl}
                          {i === 2 ? 'n' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export function GenderTag({ w }: { w: Word }) {
  if (w.pos !== 'noun') return null;
  if (w.plOnly) return <span className="tag pl">複数のみ</span>;
  if (!w.g) return null;
  return <span className={`tag ${w.g}`}>{ARTICLE[w.g]}</span>;
}
