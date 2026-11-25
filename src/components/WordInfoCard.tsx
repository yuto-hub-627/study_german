import { useEffect, useMemo, useState } from 'react';
import { loadInfo, type LexEntry, type WordInfo } from '../lib/lexicon';
import { go } from '../lib/router';
import { ARTICLE } from '../lib/german';

/** 語源の言語コード → 日本語 */
const LANG: Record<string, string> = {
  gmh: '中高ドイツ語', goh: '古高ドイツ語', 'gmw-pro': '西ゲルマン祖語', 'gem-pro': 'ゲルマン祖語', 'ine-pro': '印欧祖語',
  gml: '中低ドイツ語', nds: '低地ドイツ語', osx: '古ザクセン語', nl: 'オランダ語', dum: '中期オランダ語', yi: 'イディッシュ語',
  la: 'ラテン語', LL: '後期ラテン語', ML: '中世ラテン語', NL: '新ラテン語', 'la-lat': '後期ラテン語', 'la-med': '中世ラテン語', 'la-new': '新ラテン語',
  grc: '古代ギリシャ語', el: 'ギリシャ語', fr: 'フランス語', frm: '中期フランス語', fro: '古フランス語', it: 'イタリア語', es: 'スペイン語', pt: 'ポルトガル語',
  en: '英語', enm: '中英語', ang: '古英語', sv: 'スウェーデン語', da: 'デンマーク語', no: 'ノルウェー語', is: 'アイスランド語',
  pl: 'ポーランド語', cs: 'チェコ語', ru: 'ロシア語', sla: 'スラヴ語', tr: 'トルコ語', ota: 'オスマン語', ar: 'アラビア語', he: 'ヘブライ語', fa: 'ペルシャ語',
  sa: 'サンスクリット', hi: 'ヒンディー語', ja: '日本語', zh: '中国語', hu: 'ハンガリー語', fi: 'フィンランド語', rom: 'ロマ語',
};

/** よく出る接頭辞・接尾辞の意味 */
const AFFIX: Record<string, string> = {
  'be-': '他動詞をつくる（〜を…する）', 'ver-': '変化・誤り・消費・強調（〜してしまう）', 'ent-': '除去・離脱（〜を取り去る）', 'er-': '達成・獲得（〜して手に入れる）',
  'zer-': '分解・破壊（ばらばらに）', 'ge-': '集合・結果を表す', 'miss-': '誤り・不（うまく〜しない）', 'emp-': '「ent-」の変形', 'un-': '否定（〜でない）', 'ur-': '起源・太古（もとの）',
  'ab-': '離れる・下へ・終わり', 'an-': '接近・接触・開始', 'auf-': '上へ・開く・始める', 'aus-': '外へ・終わりまで', 'ein-': '中へ', 'mit-': '一緒に',
  'nach-': '後から・まねて', 'vor-': '前へ・前もって', 'zu-': '閉じる・〜の方へ', 'zurück-': '後ろへ・元へ', 'weg-': '去って', 'her-': 'こちらへ', 'hin-': 'あちらへ',
  'über-': '越えて・過度に', 'unter-': '下に・間に', 'um-': '回って・変えて', 'durch-': '通り抜けて・最後まで', 'wieder-': '再び', 'fort-': '先へ・続けて', 'los-': '離れて・始めて',
  '-ung': '動詞から女性名詞をつくる（〜すること）', '-heit': '形容詞から女性名詞をつくる（〜さ）', '-keit': '形容詞から女性名詞をつくる（〜さ）', '-schaft': '集団・状態を表す女性名詞',
  '-chen': '縮小（小さな〜、中性名詞）', '-lein': '縮小（小さな〜、中性名詞）', '-er': '〜する人・道具（男性名詞）', '-in': '女性形（〜する女性）', '-ei': '〜する所・行為（女性名詞）',
  '-tät': '性質（女性名詞）', '-ität': '性質（女性名詞）', '-ion': '行為・結果（女性名詞）', '-ismus': '主義・傾向（男性名詞）', '-ist': '〜主義者・〜する人',
  '-lich': '形容詞をつくる（〜のような・〜できる）', '-ig': '形容詞をつくる（〜のある）', '-isch': '形容詞をつくる（〜の・〜的な）', '-bar': '〜できる', '-sam': '〜しがちな・〜に富む',
  '-los': '〜のない', '-voll': '〜に満ちた', '-haft': '〜のような・〜の性質をもつ', '-mäßig': '〜に従った・〜的な', '-weise': '〜のやり方で（副詞）',
  '-er-': '語と語をつなぐ音（つなぎ）', '-s-': '語と語をつなぐ音（つなぎ）', '-es-': '語と語をつなぐ音（つなぎ）', '-n-': '語と語をつなぐ音（つなぎ）', '-en-': '語と語をつなぐ音（つなぎ）', '-e-': '語と語をつなぐ音（つなぎ）',
  '-ieren': '外来語から動詞をつくる', '-eln': '動詞をつくる（少し・くり返し〜する）', '-en': '動詞・形容詞をつくる',
};

function findEntry(lex: LexEntry[] | null, w: string): LexEntry | undefined {
  if (!lex) return undefined;
  let best: LexEntry | undefined;
  for (const e of lex) if (e.w === w && e.p !== 'phrase' && (!best || e.r < best.r)) best = e;
  return best;
}

function dictPath(e: LexEntry) {
  return `/dict/${e.p}/${encodeURIComponent(e.w)}`;
}

function WordLink({ lex, w }: { lex: LexEntry[] | null; w: string }) {
  const e = findEntry(lex, w);
  if (!e) return <span className="de">{w}</span>;
  return (
    <button className="chip" onClick={() => go(dictPath(e))} title={e.ja || e.en?.[0]}>
      <span className="de">
        {e.p === 'noun' && e.g ? ARTICLE[e.g] + ' ' : ''}
        {e.w}
      </span>
      {(e.ja || e.en?.[0]) && <span className="tiny muted wi-gloss"> {(e.ja || e.en![0]).split(/[、;,(]/)[0].trim()}</span>}
    </button>
  );
}

/** 語源・成り立ち（F-07）。基本の情報を出し、「もっと見る」で類義語・派生語・原文 */
export function WordInfoCard({ pos, w, lex }: { pos: string; w: string; lex: LexEntry[] | null }) {
  const [info, setInfo] = useState<WordInfo | null | undefined>(undefined);
  const [more, setMore] = useState(false);
  useEffect(() => {
    let alive = true;
    setInfo(undefined);
    setMore(false);
    void loadInfo(pos, w).then((x) => alive && setInfo(x || null));
    return () => {
      alive = false;
    };
  }, [pos, w]);

  const origin = useMemo(() => {
    const o = (info?.o || []).filter((x) => LANG[x[0]]);
    if (!o.length) return null;
    const b = o.find((x) => x[2] === 'b');
    if (b) return { kind: 'b' as const, text: `${LANG[b[0]]}の「${b[1]}」から入ってきた語（外来語）` };
    if (o[0][2] === 'i') return { kind: 'i' as const, chain: o.slice(0, 3) };
    return { kind: 'd' as const, text: `${LANG[o[0][0]]}の「${o[0][1]}」に由来` };
  }, [info]);

  if (!info) return null;
  const parts = info.pt || [];
  const hasMore = !!(info.sy?.length || info.an?.length || info.dv?.length || info.tx);
  const hasBasic = parts.length > 0 || !!info.en?.length || !!origin;
  if (!hasBasic && !hasMore) return null;

  return (
    <div className="card word-info">
      <h3>語源・成り立ち</h3>
      {parts.length > 0 && (
        <div className="wi-row">
          <div className="wi-label">成り立ち</div>
          <div>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {parts.map(([p], i) => (
                <span key={i} className="row" style={{ gap: 6 }}>
                  {i > 0 && <span className="muted">＋</span>}
                  {/^-|-$/.test(p) ? <span className="chip de" style={{ cursor: 'default' }}>{p}</span> : <WordLink lex={lex} w={p} />}
                </span>
              ))}
            </div>
            {parts.some(([p]) => AFFIX[p]) && (
              <ul className="wi-affix small">
                {parts
                  .filter(([p]) => AFFIX[p])
                  .map(([p]) => (
                    <li key={p}>
                      <b className="de">{p}</b>：{AFFIX[p]}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {!!info.en?.length && (
        <div className="wi-row">
          <div className="wi-label">英語との関係</div>
          <div>
            英語の <b className="de">{info.en.join(' / ')}</b> と同じ語源（もとは同じ言葉）
          </div>
        </div>
      )}
      {origin && (
        <div className="wi-row">
          <div className="wi-label">由来</div>
          <div>
            {origin.kind === 'i' ? (
              <>
                昔からあるドイツ語（ゲルマン系）。
                <div className="small muted">
                  {origin.chain!.map((x, i) => (
                    <span key={i}>
                      {i > 0 && ' ← '}
                      {LANG[x[0]]} <span className="de">{x[1]}</span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              origin.text
            )}
          </div>
        </div>
      )}

      {hasMore && !more && (
        <button className="btn ghost small" style={{ marginTop: 8 }} onClick={() => setMore(true)}>
          もっと見る（類義語・関連語・原文）
        </button>
      )}
      {more && (
        <div className="stack" style={{ gap: 10, marginTop: 10 }}>
          {!!info.sy?.length && (
            <div className="wi-row">
              <div className="wi-label">似た意味の語</div>
              <div className="chips">
                {info.sy.map((x) => (
                  <WordLink key={x} lex={lex} w={x} />
                ))}
              </div>
            </div>
          )}
          {!!info.an?.length && (
            <div className="wi-row">
              <div className="wi-label">反対の意味の語</div>
              <div className="chips">
                {info.an.map((x) => (
                  <WordLink key={x} lex={lex} w={x} />
                ))}
              </div>
            </div>
          )}
          {!!info.dv?.length && (
            <div className="wi-row">
              <div className="wi-label">この語からできた語</div>
              <div className="chips">
                {info.dv.map((x) => (
                  <WordLink key={x} lex={lex} w={x} />
                ))}
              </div>
            </div>
          )}
          {info.tx && (
            <div className="wi-row">
              <div className="wi-label">語源の原文（英語）</div>
              <div className="small muted de" style={{ lineHeight: 1.6 }}>
                {info.tx}
              </div>
            </div>
          )}
          <div className="tiny muted">出典: Wiktionary（CC BY-SA 4.0）</div>
        </div>
      )}
    </div>
  );
}
