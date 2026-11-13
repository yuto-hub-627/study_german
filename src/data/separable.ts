/** 分離動詞の一覧データ (本体の動詞ごと) */
export interface SepGroup {
  base: string;
  ja: string;
  /** 3人称単数現在 / 過去分詞 (本体) */
  er: string;
  pp: string;
  items: [prefix: string, ja: string][];
}

export const PREFIX_MEANING: [string, string][] = [
  ['ab', '離れる・下へ・取り去る'],
  ['an', 'くっつく・向かう・始まる'],
  ['auf', '上へ・開く・最後まで'],
  ['aus', '外へ・終わる・選び出す'],
  ['ein', '中へ'],
  ['mit', '一緒に'],
  ['zu', '閉じる・向かって'],
  ['zurück', '元へ戻る'],
  ['vor', '前へ・前もって'],
  ['weg', '去って・離れて'],
  ['nach', '後から・追って'],
  ['um', '回って・変えて'],
  ['fern', '遠くを'],
  ['her / heraus', 'こちらへ / 外へ出て'],
  ['wieder', '再び'],
  ['bei', 'そばに・加えて'],
  ['los', '出発・解放'],
];

export const SEPARABLE: SepGroup[] = [
  { base: 'kommen', ja: '来る', er: 'kommt', pp: 'gekommen', items: [['an', '到着する'], ['mit', '一緒に来る'], ['zurück', '戻ってくる'], ['vor', '起こる・ある'], ['nach', '後から来る'], ['heraus', '出てくる']] },
  { base: 'fahren', ja: '乗り物で行く', er: 'fährt', pp: 'gefahren', items: [['ab', '出発する'], ['los', '出発する'], ['mit', '同乗する'], ['weg', '出かける・去る'], ['zurück', '乗り物で帰る'], ['vorbei', '通り過ぎる']] },
  { base: 'gehen', ja: '行く', er: 'geht', pp: 'gegangen', items: [['aus', '外出する'], ['mit', '一緒に行く'], ['weg', '立ち去る'], ['zurück', '戻る'], ['unter', '沈む（太陽が）'], ['spazieren', '散歩する']] },
  { base: 'stehen', ja: '立っている', er: 'steht', pp: 'gestanden', items: [['auf', '起きる・立ち上がる'], ['an', '列に並ぶ'], ['fest', '確定している']] },
  { base: 'sehen', ja: '見る', er: 'sieht', pp: 'gesehen', items: [['fern', 'テレビを見る'], ['an', 'じっと見る'], ['aus', '〜のように見える'], ['zu', '見物する（+3格）'], ['wieder', '再会する']] },
  { base: 'nehmen', ja: '取る', er: 'nimmt', pp: 'genommen', items: [['teil', '参加する（an+3格）'], ['mit', '持っていく・連れていく'], ['ab', '取り外す・やせる'], ['zu', '増える・太る'], ['an', '受け取る・想定する'], ['auf', '録音する・受け入れる']] },
  { base: 'machen', ja: 'する', er: 'macht', pp: 'gemacht', items: [['auf', '開ける'], ['zu', '閉める'], ['an', '（電気などを）つける'], ['aus', '（電気などを）消す'], ['mit', '参加する・一緒にやる']] },
  { base: 'rufen', ja: '呼ぶ', er: 'ruft', pp: 'gerufen', items: [['an', '電話する（+4格）'], ['zurück', '折り返し電話する'], ['auf', '呼び出す']] },
  { base: 'stellen', ja: '立てて置く', er: 'stellt', pp: 'gestellt', items: [['vor', '紹介する・（sich³）想像する'], ['ein', '雇う・設定する'], ['aus', '展示する・発行する'], ['ab', '下に置く・（機械を）止める']] },
  { base: 'ziehen', ja: '引く', er: 'zieht', pp: 'gezogen', items: [['an', '着る'], ['aus', '脱ぐ・（住居から）出る'], ['um', '引っ越す・着替える'], ['ein', '入居する']] },
  { base: 'steigen', ja: '登る', er: 'steigt', pp: 'gestiegen', items: [['ein', '乗る'], ['aus', '降りる'], ['um', '乗り換える']] },
  { base: 'bringen', ja: '持っていく', er: 'bringt', pp: 'gebracht', items: [['mit', '持ってくる'], ['zurück', '返す・持って帰る'], ['bei', '教える（+3格に+4格を）']] },
  { base: 'geben', ja: '与える', er: 'gibt', pp: 'gegeben', items: [['ab', '提出する'], ['aus', '（お金を）使う'], ['zurück', '返す'], ['an', '申告する・自慢する']] },
  { base: 'hören', ja: '聞く', er: 'hört', pp: 'gehört', items: [['auf', 'やめる（mit+3格）'], ['zu', '耳を傾ける（+3格）']] },
  { base: 'schlafen', ja: '眠る', er: 'schläft', pp: 'geschlafen', items: [['ein', '眠り込む'], ['aus', 'ぐっすり眠る']] },
  { base: 'fangen', ja: '捕まえる', er: 'fängt', pp: 'gefangen', items: [['an', '始まる・始める']] },
  { base: 'finden', ja: '見つける', er: 'findet', pp: 'gefunden', items: [['statt', '開催される'], ['heraus', '見つけ出す・突き止める']] },
  { base: 'haben', ja: '持っている', er: 'hat', pp: 'gehabt', items: [['vor', '予定している']] },
  { base: 'holen', ja: '取ってくる', er: 'holt', pp: 'geholt', items: [['ab', '迎えに行く・受け取りに行く'], ['nach', '後で取り戻す']] },
  { base: 'kaufen', ja: '買う', er: 'kauft', pp: 'gekauft', items: [['ein', '買い物をする']] },
  { base: 'laden', ja: '積む', er: 'lädt', pp: 'geladen', items: [['ein', '招待する']] },
  { base: 'räumen', ja: '片付ける', er: 'räumt', pp: 'geräumt', items: [['auf', '片付ける・整頓する']] },
  { base: 'probieren', ja: '試す', er: 'probiert', pp: 'probiert', items: [['an', '試着する']] },
  { base: 'wachsen', ja: '育つ', er: 'wächst', pp: 'gewachsen', items: [['auf', '成長する・育つ']] },
  { base: 'fliegen', ja: '飛ぶ', er: 'fliegt', pp: 'geflogen', items: [['ab', '（飛行機が）出発する']] },
  { base: 'lernen', ja: '学ぶ', er: 'lernt', pp: 'gelernt', items: [['kennen', '知り合う']] },
  { base: 'spielen', ja: '遊ぶ・演奏する', er: 'spielt', pp: 'gespielt', items: [['mit', '一緒に遊ぶ・出演する']] },
  { base: 'schreiben', ja: '書く', er: 'schreibt', pp: 'geschrieben', items: [['auf', '書き留める'], ['ab', '書き写す']] },
  { base: 'packen', ja: '詰める', er: 'packt', pp: 'gepackt', items: [['ein', '包む・荷物を詰める'], ['aus', '荷をほどく']] },
];
