/**
 * 単語グループ (F-17)。同じ種類の語をまとめて覚える。
 * 語は "ドイツ語|日本語|補足" の文字列 (補足は活用形・格など、なくてもよい)。
 * pair: true のグループは 2 語ずつ並べて表示する (反対語・置く/ある など)。
 */
export interface WGroup {
  title: string;
  note?: string;
  pair?: boolean;
  items: string[];
}
export interface WTopic {
  id: string;
  cat: '文法' | '名詞' | '意味・テーマ';
  title: string;
  sub: string;
  note?: string;
  groups: WGroup[];
}

export const TOPICS: WTopic[] = [
  {
    id: 'prep-case',
    cat: '文法',
    title: '前置詞の格支配',
    sub: '後ろに何格が来るかでまとめる',
    note: '前置詞ごとに、後ろの名詞・代名詞の格が決まっています。3・4格どちらもとる前置詞は「場所（どこで）→3格」「方向（どこへ）→4格」。',
    groups: [
      { title: '3格をとる', note: 'aus・bei・mit・nach・seit・von・zu（＋gegenüber）', items: ['aus|〜から（中から）、〜出身', 'bei|〜のところで、〜の際に', 'mit|〜と一緒に、〜で（手段）', 'nach|〜の後で、〜へ（地名）', 'seit|〜以来', 'von|〜から、〜の', 'zu|〜へ（人・建物）', 'gegenüber|〜の向かいに'] },
      { title: '4格をとる', note: 'durch・für・gegen・ohne・um（＋bis）', items: ['durch|〜を通って', 'für|〜のために', 'gegen|〜に反対して、〜ごろ', 'ohne|〜なしで', 'um|〜の周りに、〜時に', 'bis|〜まで'] },
      { title: '3格・4格どちらもとる', note: '場所（wo?）なら3格、方向（wohin?）なら4格。例: Ich bin in der Stadt.／Ich gehe in die Stadt.', items: ['an|〜のきわに（接して）', 'auf|〜の上に（接して）', 'hinter|〜の後ろに', 'in|〜の中に', 'neben|〜の隣に', 'über|〜の上方に、〜について', 'unter|〜の下に', 'vor|〜の前に', 'zwischen|〜の間に'] },
      { title: '2格をとる', note: '話し言葉では3格になることも多い', items: ['wegen|〜のせいで', 'trotz|〜にもかかわらず', 'während|〜の間に', 'statt|〜の代わりに'] },
      { title: '前置詞と冠詞の融合形', note: '前置詞＋定冠詞がくっついた形', items: ['am|an dem', 'ans|an das', 'im|in dem', 'ins|in das', 'beim|bei dem', 'vom|von dem', 'zum|zu dem', 'zur|zu der'] },
    ],
  },
  {
    id: 'prep-verbs',
    cat: '文法',
    title: '前置詞つき動詞',
    sub: 'warten auf ＋4格 のように前置詞とセット',
    note: '決まった前置詞と組み合わせて使う動詞。前置詞と格をセットで覚えます。「何を待つ？」は Worauf wartest du?（wo(r)＋前置詞）。',
    groups: [
      { title: 'auf ＋4格', items: ['warten auf|〜を待つ|＋4格', 'sich freuen auf|（これからのこと）を楽しみにする|＋4格', 'antworten auf|〜に答える|＋4格', 'aufpassen auf|〜に気をつける、〜の面倒を見る|＋4格', 'achten auf|〜に注意する|＋4格', 'hoffen auf|〜を望む|＋4格'] },
      { title: 'an ＋4格／3格', items: ['denken an|〜のことを考える|＋4格', 'sich erinnern an|〜を覚えている、思い出す|＋4格', 'glauben an|〜を信じる|＋4格', 'teilnehmen an|〜に参加する|＋3格', 'arbeiten an|〜に取り組む|＋3格'] },
      { title: 'für ＋4格', items: ['sich interessieren für|〜に興味がある|＋4格', 'danken für|〜に感謝する|＋4格', 'sich entschuldigen für|〜のことで謝る|＋4格', 'sorgen für|〜の世話をする|＋4格', 'sich entscheiden für|〜に決める|＋4格'] },
      { title: 'über ＋4格', items: ['sich freuen über|（起きたこと）を喜ぶ|＋4格', 'sprechen über|〜について話す|＋4格', 'sich ärgern über|〜に腹を立てる|＋4格', 'nachdenken über|〜についてよく考える|＋4格', 'lachen über|〜を笑う|＋4格', 'sich beschweren über|〜について苦情を言う|＋4格'] },
      { title: 'mit ＋3格', items: ['sprechen mit|〜と話す|＋3格', 'anfangen mit|〜を始める|＋3格', 'aufhören mit|〜をやめる|＋3格', 'telefonieren mit|〜と電話する|＋3格', 'sich treffen mit|〜と会う|＋3格', 'zufrieden sein mit|〜に満足している|＋3格'] },
      { title: 'von ＋3格', items: ['träumen von|〜の夢を見る|＋3格', 'erzählen von|〜について話す|＋3格', 'abhängen von|〜次第である|＋3格', 'halten von|〜を（どう）思う|＋3格'] },
      { title: 'nach・vor・um', items: ['fragen nach|〜について尋ねる|＋3格', 'suchen nach|〜を探す|＋3格', 'Angst haben vor|〜が怖い|＋3格', 'warnen vor|〜に気をつけるよう警告する|＋3格', 'bitten um|〜を頼む|＋4格', 'sich kümmern um|〜の面倒を見る|＋4格', 'es geht um|〜が問題だ、〜の話だ|＋4格'] },
    ],
  },
  {
    id: 'dative-verbs',
    cat: '文法',
    title: '3格をとる動詞',
    sub: '「〜に」でなくても3格になる動詞',
    note: '目的語が4格ではなく3格になる動詞。日本語の「〜を」でも3格になるもの（helfen など）に注意。例: Ich helfe dir.（君を手伝う）',
    groups: [
      { title: 'よく使う3格動詞', items: ['helfen|〜を手伝う|hilft', 'danken|〜に感謝する', 'antworten|〜に答える', 'glauben|〜（人の言うこと）を信じる', 'folgen|〜について行く', 'gratulieren|〜にお祝いを言う', 'begegnen|〜に出会う', 'zuhören|〜の話を聞く'] },
      { title: '「〜にとって…だ」型', note: '主語は物、3格が「人」。Das Buch gefällt mir.（その本は私の気に入っている）', items: ['gefallen|〜の気に入る|gefällt', 'gehören|〜のものである', 'schmecken|〜にとっておいしい', 'passen|〜に合う', 'stehen|〜に似合う', 'fehlen|〜に欠けている、〜がいなくて寂しい', 'wehtun|〜にとって痛い', 'leidtun|〜にとって残念だ'] },
    ],
  },
  {
    id: 'reflexive',
    cat: '文法',
    title: '再帰動詞',
    sub: 'sich といっしょに使う動詞',
    note: 'sich は主語に合わせて mich / dich / sich / uns / euch / sich と変わります。例: Ich freue mich. 3格の sich（mir / dir…）をとるものもあります。',
    groups: [
      { title: '気持ち・状態', items: ['sich freuen|喜ぶ', 'sich ärgern|腹を立てる', 'sich fühlen|（〜と）感じる', 'sich wundern|驚く、不思議に思う', 'sich langweilen|退屈する', 'sich interessieren|興味を持つ', 'sich erinnern|覚えている、思い出す', 'sich irren|思い違いをする'] },
      { title: '動作・日常', items: ['sich setzen|座る', 'sich hinlegen|横になる', 'sich beeilen|急ぐ', 'sich waschen|体を洗う', 'sich anziehen|服を着る', 'sich ausziehen|服を脱ぐ', 'sich umziehen|着替える', 'sich verspäten|遅れる'] },
      { title: '人との関わり', items: ['sich treffen|会う', 'sich vorstellen|自己紹介する', 'sich entschuldigen|謝る', 'sich verabreden|会う約束をする', 'sich verlieben|恋に落ちる', 'sich unterhalten|おしゃべりする', 'sich bedanken|お礼を言う', 'sich kümmern|面倒を見る'] },
      { title: '3格の sich（mir / dir …）', note: '4格の目的語が別にあるとき sich は3格。Ich putze mir die Zähne.', items: ['sich die Zähne putzen|歯を磨く', 'sich die Hände waschen|手を洗う', 'sich etwas vorstellen|〜を想像する', 'sich etwas wünschen|〜を（自分に）望む', 'sich etwas kaufen|（自分用に）〜を買う', 'sich etwas ansehen|〜をじっくり見る'] },
    ],
  },
  {
    id: 'strong-verbs',
    cat: '文法',
    title: '不規則動詞のパターン',
    sub: '母音の変わり方が同じ動詞をまとめる',
    note: '不規則動詞は、母音の変わり方でグループにすると覚えやすくなります。補足は「現在形 er」または「過去形 – 過去分詞」。',
    groups: [
      { title: '現在形 e → i', note: 'du と er/sie/es だけ母音が変わる', items: ['sprechen|話す|spricht', 'helfen|手伝う|hilft', 'nehmen|取る|nimmt', 'geben|与える|gibt', 'essen|食べる|isst', 'treffen|会う|trifft', 'vergessen|忘れる|vergisst', 'werfen|投げる|wirft'] },
      { title: '現在形 e → ie', items: ['sehen|見る|sieht', 'lesen|読む|liest', 'empfehlen|勧める|empfiehlt', 'stehlen|盗む|stiehlt'] },
      { title: '現在形 a → ä（au → äu）', items: ['fahren|乗り物で行く|fährt', 'schlafen|眠る|schläft', 'tragen|運ぶ、着ている|trägt', 'waschen|洗う|wäscht', 'fallen|落ちる|fällt', 'halten|保つ、止まる|hält', 'lassen|〜させる|lässt', 'laufen|走る|läuft'] },
      { title: '過去 ei – ie – ie', items: ['bleiben|とどまる|blieb – geblieben', 'schreiben|書く|schrieb – geschrieben', 'steigen|登る|stieg – gestiegen', 'scheinen|輝く、〜に見える|schien – geschienen', 'schweigen|黙る|schwieg – geschwiegen'] },
      { title: '過去 ei – i – i', items: ['schneiden|切る|schnitt – geschnitten', 'greifen|つかむ|griff – gegriffen', 'leiden|苦しむ|litt – gelitten', 'streiten|けんかする|stritt – gestritten'] },
      { title: '過去 i – a – u', items: ['finden|見つける|fand – gefunden', 'trinken|飲む|trank – getrunken', 'singen|歌う|sang – gesungen', 'springen|跳ぶ|sprang – gesprungen', 'binden|結ぶ|band – gebunden'] },
      { title: '過去 i – a – o', items: ['beginnen|始める|begann – begonnen', 'schwimmen|泳ぐ|schwamm – geschwommen', 'gewinnen|勝つ|gewann – gewonnen'] },
      { title: '過去 ie – o – o', items: ['fliegen|飛ぶ|flog – geflogen', 'verlieren|失う|verlor – verloren', 'schließen|閉める|schloss – geschlossen', 'bieten|提供する|bot – geboten', 'ziehen|引く|zog – gezogen', 'riechen|におう|roch – gerochen'] },
      { title: '過去 e – a – o', items: ['sprechen|話す|sprach – gesprochen', 'helfen|手伝う|half – geholfen', 'nehmen|取る|nahm – genommen', 'treffen|会う|traf – getroffen', 'sterben|死ぬ|starb – gestorben', 'werfen|投げる|warf – geworfen'] },
      { title: '過去 e – a – e', items: ['geben|与える|gab – gegeben', 'lesen|読む|las – gelesen', 'sehen|見る|sah – gesehen', 'essen|食べる|aß – gegessen', 'vergessen|忘れる|vergaß – vergessen'] },
      { title: '過去 a – u – a', items: ['fahren|乗り物で行く|fuhr – gefahren', 'tragen|運ぶ|trug – getragen', 'waschen|洗う|wusch – gewaschen', 'schlagen|打つ|schlug – geschlagen'] },
      { title: '混合変化（-te ＋ 母音が変わる）', items: ['bringen|持ってくる|brachte – gebracht', 'denken|考える|dachte – gedacht', 'kennen|知っている|kannte – gekannt', 'wissen|知っている|wusste – gewusst', 'nennen|名づける|nannte – genannt', 'rennen|走る|rannte – gerannt'] },
    ],
  },
  {
    id: 'position-verbs',
    cat: '文法',
    title: '置く ↔ ある',
    sub: 'stellen ↔ stehen など、動作と状態のペア',
    note: '置く（動作）は規則変化で、前置詞の後ろは4格（どこへ）。ある・いる（状態）は不規則変化で、前置詞の後ろは3格（どこに）。例: Ich lege das Buch auf den Tisch. → Das Buch liegt auf dem Tisch.',
    groups: [
      { title: '置く（4格） ↔ ある（3格）', pair: true, items: ['stellen|立てて置く|stellte – gestellt', 'stehen|立っている|stand – gestanden', 'legen|寝かせて置く|legte – gelegt', 'liegen|横になっている|lag – gelegen', 'setzen|座らせる|setzte – gesetzt', 'sitzen|座っている|saß – gesessen', 'hängen|掛ける|hängte – gehängt', 'hängen|掛かっている|hing – gehangen', 'stecken|差し込む|steckte – gesteckt', 'stecken|差さっている|steckte – gesteckt'] },
      { title: '動かす ↔ 動く', pair: true, note: '形がちがうので注意', items: ['bringen|持っていく、連れていく', 'kommen|来る', 'fahren|（乗り物で）運ぶ|＋4格', 'fahren|（乗り物で）行く', 'wecken|起こす', 'aufwachen|目が覚める'] },
    ],
  },
  {
    id: 'modal',
    cat: '文法',
    title: '話法の助動詞',
    sub: 'können・müssen など',
    note: '助動詞は2番目、本動詞は不定詞で文末。例: Ich kann gut schwimmen. ich と er/sie/es が同じ形（語尾なし）になるのが特徴。補足は ich / du / er の形。',
    groups: [
      { title: '話法の助動詞', items: ['können|〜できる|kann / kannst / kann', 'müssen|〜しなければならない|muss / musst / muss', 'dürfen|〜してもよい|darf / darfst / darf', 'sollen|〜すべきだ、〜するように言われている|soll / sollst / soll', 'wollen|〜するつもりだ、〜したい|will / willst / will', 'mögen|〜が好きだ|mag / magst / mag', 'möchte|〜したい（ていねい）|möchte / möchtest / möchte'] },
      { title: '否定するとこうなる', note: 'müssen の否定は「〜しなくてよい」、dürfen の否定は「〜してはいけない」', items: ['nicht müssen|〜しなくてよい', 'nicht dürfen|〜してはいけない', 'nicht können|〜できない', 'nicht wollen|〜したくない'] },
    ],
  },
  {
    id: 'conjunctions',
    cat: '文法',
    title: '接続詞（語順で分ける）',
    sub: '動詞の位置が変わるかどうか',
    note: '接続詞によって、後ろの文の動詞の位置が変わります。',
    groups: [
      { title: '並列接続詞（語順そのまま）', note: '…, aber ich habe keine Zeit.', items: ['und|そして', 'aber|しかし', 'oder|または', 'denn|というのは', 'sondern|（〜ではなく）むしろ'] },
      { title: '従属接続詞（動詞は文末）', note: '…, weil ich keine Zeit habe.', items: ['dass|〜ということ', 'weil|〜なので', 'wenn|もし〜なら、〜するときはいつも', 'ob|〜かどうか', 'als|〜したとき（過去の1回）', 'obwohl|〜にもかかわらず', 'bevor|〜する前に', 'nachdem|〜した後で', 'während|〜している間', 'damit|〜するために', 'bis|〜するまで', 'seitdem|〜して以来'] },
      { title: '副詞的接続詞（すぐ後ろに動詞）', note: '…, deshalb bleibe ich zu Hause.', items: ['deshalb|だから', 'trotzdem|それにもかかわらず', 'dann|それから', 'danach|その後で', 'außerdem|そのうえ', 'sonst|さもないと'] },
    ],
  },
  {
    id: 'gender-endings',
    cat: '名詞',
    title: '性がわかる語尾',
    sub: '語尾を見れば der / die / das がわかる',
    note: '名詞の性は、語尾や意味である程度わかります。',
    groups: [
      { title: 'die（女性）になる語尾', note: '-ung・-heit・-keit・-schaft・-ion・-tät・-ei・-ie はほぼ必ず die', items: ['die Zeitung|新聞|-ung', 'die Wohnung|住まい|-ung', 'die Freiheit|自由|-heit', 'die Gesundheit|健康|-heit', 'die Möglichkeit|可能性|-keit', 'die Freundschaft|友情|-schaft', 'die Information|情報|-ion', 'die Universität|大学|-tät', 'die Bäckerei|パン屋|-ei', 'die Familie|家族|-ie'] },
      { title: 'das（中性）になる語尾', note: '-chen・-lein（小さいもの）、-um・-ment、Ge- で始まる集合名詞', items: ['das Mädchen|女の子|-chen', 'das Brötchen|小型パン|-chen', 'das Museum|博物館|-um', 'das Zentrum|中心|-um', 'das Dokument|書類|-ment', 'das Instrument|楽器|-ment', 'das Gemüse|野菜|Ge-', 'das Getränk|飲み物|Ge-', 'das Gebäude|建物|Ge-'] },
      { title: 'der（男性）になるもの', note: '曜日・月・季節・天気・方角、-er（人・道具）、-ling・-ismus・-or', items: ['der Montag|月曜日|曜日', 'der Januar|1月|月', 'der Sommer|夏|季節', 'der Regen|雨|天気', 'der Norden|北|方角', 'der Lehrer|教師|-er', 'der Computer|コンピューター|-er', 'der Frühling|春|-ling', 'der Motor|エンジン|-or'] },
    ],
  },
  {
    id: 'plural',
    cat: '名詞',
    title: '複数形のパターン',
    sub: '複数形の作り方でまとめる',
    note: '複数形の作り方は主に7つ。名詞は複数形といっしょに覚えるのが基本です。補足は複数形。',
    groups: [
      { title: '-e', items: ['der Tag|日|Tage', 'der Hund|犬|Hunde', 'das Jahr|年|Jahre', 'der Freund|友だち|Freunde', 'das Brot|パン|Brote'] },
      { title: '¨-e（ウムラウト＋e）', items: ['die Stadt|町|Städte', 'die Hand|手|Hände', 'der Zug|列車|Züge', 'der Stuhl|椅子|Stühle', 'die Nacht|夜|Nächte'] },
      { title: '-er / ¨-er', items: ['das Kind|子ども|Kinder', 'das Bild|絵|Bilder', 'das Buch|本|Bücher', 'das Haus|家|Häuser', 'der Mann|男性|Männer', 'das Land|国|Länder'] },
      { title: '-n / -en', note: '女性名詞の多くはこれ', items: ['die Frau|女性|Frauen', 'die Blume|花|Blumen', 'die Zeitung|新聞|Zeitungen', 'die Tür|ドア|Türen', 'der Student|学生|Studenten'] },
      { title: '-nen（-in で終わる女性）', items: ['die Lehrerin|女性教師|Lehrerinnen', 'die Freundin|女友だち|Freundinnen', 'die Studentin|女子学生|Studentinnen'] },
      { title: '-s（外来語・短縮語）', items: ['das Auto|車|Autos', 'das Kino|映画館|Kinos', 'das Hotel|ホテル|Hotels', 'das Handy|携帯電話|Handys', 'das Café|カフェ|Cafés'] },
      { title: '変化なし / ウムラウトだけ', note: '-er・-el・-en・-chen で終わる男性・中性名詞', items: ['der Lehrer|教師|Lehrer', 'das Zimmer|部屋|Zimmer', 'das Mädchen|女の子|Mädchen', 'der Vater|父|Väter', 'die Mutter|母|Mütter', 'der Bruder|兄弟|Brüder', 'der Apfel|りんご|Äpfel'] },
    ],
  },
  {
    id: 'weak-nouns',
    cat: '名詞',
    title: '男性弱変化名詞',
    sub: '1格以外ぜんぶ -(e)n がつく',
    note: '単数1格以外（2・3・4格）と複数で -n / -en がつく男性名詞。例: Ich kenne den Studenten. 人や動物を表す語が多い。補足は単数4格の形。',
    groups: [
      { title: '人', items: ['der Student|学生|den Studenten', 'der Junge|男の子|den Jungen', 'der Mensch|人間|den Menschen', 'der Herr|紳士、〜さん|den Herrn', 'der Kollege|同僚|den Kollegen', 'der Kunde|客|den Kunden', 'der Nachbar|隣人|den Nachbarn', 'der Polizist|警官|den Polizisten', 'der Tourist|観光客|den Touristen', 'der Journalist|ジャーナリスト|den Journalisten', 'der Präsident|大統領|den Präsidenten', 'der Franzose|フランス人|den Franzosen'] },
      { title: '動物', items: ['der Löwe|ライオン|den Löwen', 'der Bär|クマ|den Bären', 'der Affe|サル|den Affen', 'der Hase|ウサギ|den Hasen'] },
      { title: '2格が -ns になるもの', items: ['der Name|名前|des Namens', 'der Gedanke|考え|des Gedankens', 'der Glaube|信仰|des Glaubens'] },
    ],
  },
  {
    id: 'opposites',
    cat: '意味・テーマ',
    title: '反対語のペア',
    sub: '対にして覚える',
    groups: [
      { title: '大きさ・量', pair: true, items: ['groß|大きい', 'klein|小さい', 'lang|長い', 'kurz|短い', 'viel|多い', 'wenig|少ない', 'dick|太い、厚い', 'dünn|細い、薄い', 'hoch|高い', 'niedrig|低い'] },
      { title: '時間・年齢', pair: true, items: ['früh|早い', 'spät|遅い', 'neu|新しい', 'alt|古い', 'jung|若い', 'alt|年をとった', 'schnell|速い', 'langsam|遅い（速度）'] },
      { title: '状態', pair: true, items: ['warm|暖かい', 'kalt|寒い、冷たい', 'hell|明るい', 'dunkel|暗い', 'laut|うるさい', 'leise|静かな', 'voll|いっぱいの', 'leer|空の', 'offen|開いている', 'geschlossen|閉まっている'] },
      { title: '評価・気持ち', pair: true, items: ['gut|良い', 'schlecht|悪い', 'richtig|正しい', 'falsch|間違った', 'teuer|高い（値段）', 'billig|安い', 'leicht|簡単な、軽い', 'schwer|難しい、重い', 'interessant|おもしろい', 'langweilig|退屈な', 'gesund|健康な', 'krank|病気の', 'glücklich|幸せな', 'traurig|悲しい', 'reich|金持ちの', 'arm|貧しい'] },
      { title: '動詞', pair: true, items: ['kommen|来る', 'gehen|行く', 'kaufen|買う', 'verkaufen|売る', 'öffnen|開ける', 'schließen|閉める', 'beginnen|始まる', 'enden|終わる', 'fragen|質問する', 'antworten|答える', 'geben|与える', 'nehmen|取る', 'lachen|笑う', 'weinen|泣く', 'gewinnen|勝つ', 'verlieren|負ける、失う', 'ankommen|到着する', 'abfahren|出発する', 'einsteigen|乗る', 'aussteigen|降りる'] },
      { title: '場所・頻度', pair: true, items: ['hier|ここ', 'dort|あそこ', 'oben|上に', 'unten|下に', 'links|左に', 'rechts|右に', 'vorne|前に', 'hinten|後ろに', 'innen|中で', 'außen|外で', 'immer|いつも', 'nie|一度も〜ない'] },
    ],
  },
  {
    id: 'confusing',
    cat: '意味・テーマ',
    title: 'まぎらわしい語',
    sub: '日本語だと同じになる語の使い分け',
    groups: [
      { title: '知っている', note: 'kennen ＋人・物（見て・会って知っている）／wissen ＋事実・情報（dass 文など）', items: ['kennen|（人・物を）知っている', 'wissen|（事実を）知っている|weiß', 'kennenlernen|知り合う'] },
      { title: '学ぶ', note: 'lernen は覚える勉強全般、studieren は大学で専攻する', items: ['lernen|学ぶ、覚える', 'studieren|大学で学ぶ、専攻する'] },
      { title: '言う・話す', note: 'sagen は内容を言う、sprechen は言語・人と話す、reden はおしゃべり、erzählen は話して聞かせる', items: ['sagen|言う', 'sprechen|話す（言語・人と）|spricht', 'reden|しゃべる', 'erzählen|物語る、話して聞かせる'] },
      { title: '行く', note: 'gehen は歩いて、fahren は乗り物で、fliegen は飛行機で', items: ['gehen|（歩いて）行く', 'fahren|（乗り物で）行く|fährt', 'fliegen|飛行機で行く', 'laufen|走る、歩く'] },
      { title: '住む・生きる', items: ['wohnen|住む（住所）', 'leben|暮らす、生きる'] },
      { title: '時間・回', items: ['die Zeit|時間（ひま）', 'die Uhr|時計、〜時', 'die Stunde|1時間、授業', 'das Mal|〜回'] },
      { title: '見る', note: 'sehen は目に入る、schauen / sich ansehen は意識して見る', items: ['sehen|見える、見る|sieht', 'schauen|見る（注意して）', 'sich ansehen|じっくり見る', 'fernsehen|テレビを見る', 'zuschauen|見物する'] },
      { title: '頼む・尋ねる', items: ['fragen|尋ねる', 'bitten|頼む', 'bestellen|注文する'] },
      { title: '終わる・やめる', items: ['enden|終わる', 'aufhören|やめる、終わる', 'beenden|終える'] },
      { title: '会う', items: ['treffen|（約束して）会う|trifft', 'begegnen|（偶然）出会う|＋3格', 'sehen|会う（見かける）'] },
      { title: '好き・ほしい', note: 'mögen は好き、gern は「好んで〜する」、gefallen は「気に入る」（主語は物）', items: ['mögen|好きだ', 'gern|好んで（〜する）', 'lieben|愛している', 'gefallen|気に入る|＋3格', 'möchte|〜がほしい', 'wollen|〜したい'] },
    ],
  },
  {
    id: 'families',
    cat: '意味・テーマ',
    title: '同じ語根の語族',
    sub: '1つの語から広がる仲間',
    note: '本体の語を知っていれば、仲間の語の意味も推測できます。',
    groups: [
      { title: 'fahren（乗り物で行く）', items: ['fahren|乗り物で行く', 'die Fahrt|ドライブ、乗車', 'der Fahrer|運転手', 'das Fahrrad|自転車', 'die Fahrkarte|乗車券', 'der Fahrplan|時刻表', 'die Abfahrt|出発', 'erfahren|経験する、知る'] },
      { title: 'sprechen（話す）', items: ['sprechen|話す', 'die Sprache|言語', 'das Gespräch|会話', 'der Sprecher|話し手', 'aussprechen|発音する', 'versprechen|約束する', 'besprechen|話し合う'] },
      { title: 'arbeiten（働く）', items: ['arbeiten|働く', 'die Arbeit|仕事', 'der Arbeiter|労働者', 'arbeitslos|失業中の', 'die Arbeitszeit|勤務時間'] },
      { title: 'wohnen（住む）', items: ['wohnen|住む', 'die Wohnung|住まい', 'das Wohnzimmer|居間', 'der Bewohner|住民', 'die Wohngemeinschaft|シェアハウス'] },
      { title: 'schreiben（書く）', items: ['schreiben|書く', 'die Schrift|文字', 'der Schreibtisch|机', 'aufschreiben|書き留める', 'beschreiben|描写する', 'unterschreiben|署名する'] },
      { title: 'spielen（遊ぶ）', items: ['spielen|遊ぶ、演奏する', 'das Spiel|遊び、試合', 'der Spieler|選手', 'das Spielzeug|おもちゃ', 'der Spielplatz|遊び場'] },
      { title: 'kaufen（買う）', items: ['kaufen|買う', 'der Kauf|購入', 'einkaufen|買い物をする', 'verkaufen|売る', 'der Verkäufer|店員', 'das Kaufhaus|デパート'] },
      { title: 'fliegen（飛ぶ）', items: ['fliegen|飛ぶ', 'der Flug|フライト', 'der Flughafen|空港', 'das Flugzeug|飛行機'] },
      { title: 'essen（食べる）', items: ['essen|食べる', 'das Essen|食事', 'das Frühstück|朝食', 'das Mittagessen|昼食', 'das Abendessen|夕食', 'das Esszimmer|ダイニング'] },
      { title: 'das Haus（家）', items: ['das Haus|家', 'zu Hause|家で', 'nach Hause|家へ', 'die Hausaufgabe|宿題', 'das Krankenhaus|病院', 'der Haushalt|家事'] },
    ],
  },
  {
    id: 'themes',
    cat: '意味・テーマ',
    title: 'テーマ別',
    sub: '家族・食べ物・体・天気など',
    groups: [
      { title: '家族', items: ['der Vater|父', 'die Mutter|母', 'die Eltern|両親', 'der Bruder|兄・弟', 'die Schwester|姉・妹', 'die Geschwister|兄弟姉妹', 'der Sohn|息子', 'die Tochter|娘', 'der Großvater|祖父', 'die Großmutter|祖母', 'der Onkel|おじ', 'die Tante|おば', 'der Mann|夫、男性', 'die Frau|妻、女性'] },
      { title: '食べ物・飲み物', items: ['das Brot|パン', 'das Brötchen|小型パン', 'der Käse|チーズ', 'die Wurst|ソーセージ', 'das Fleisch|肉', 'der Fisch|魚', 'das Gemüse|野菜', 'das Obst|果物', 'der Apfel|りんご', 'die Kartoffel|じゃがいも', 'der Reis|米', 'das Ei|卵', 'die Milch|牛乳', 'der Kaffee|コーヒー', 'der Tee|お茶', 'das Wasser|水', 'der Saft|ジュース', 'das Bier|ビール', 'der Wein|ワイン'] },
      { title: '体', items: ['der Kopf|頭', 'das Gesicht|顔', 'das Auge|目', 'das Ohr|耳', 'die Nase|鼻', 'der Mund|口', 'der Zahn|歯', 'der Hals|首、のど', 'der Arm|腕', 'die Hand|手', 'der Finger|指', 'der Bauch|おなか', 'der Rücken|背中', 'das Bein|脚', 'der Fuß|足', 'das Haar|髪'] },
      { title: '天気', items: ['das Wetter|天気', 'die Sonne|太陽', 'der Regen|雨', 'der Schnee|雪', 'der Wind|風', 'die Wolke|雲', 'es regnet|雨が降る', 'es schneit|雪が降る', 'sonnig|晴れた', 'bewölkt|曇った', 'heiß|暑い', 'kalt|寒い'] },
      { title: '色', items: ['rot|赤い', 'blau|青い', 'gelb|黄色い', 'grün|緑の', 'schwarz|黒い', 'weiß|白い', 'grau|灰色の', 'braun|茶色の', 'orange|オレンジ色の', 'rosa|ピンクの', 'lila|紫の'] },
      { title: '曜日', note: '曜日はすべて男性名詞。am Montag（月曜日に）', items: ['der Montag|月曜日', 'der Dienstag|火曜日', 'der Mittwoch|水曜日', 'der Donnerstag|木曜日', 'der Freitag|金曜日', 'der Samstag|土曜日', 'der Sonntag|日曜日', 'das Wochenende|週末'] },
      { title: '月・季節', note: '月も季節も男性名詞。im Januar / im Sommer（〜に）', items: ['der Januar|1月', 'der Februar|2月', 'der März|3月', 'der April|4月', 'der Mai|5月', 'der Juni|6月', 'der Juli|7月', 'der August|8月', 'der September|9月', 'der Oktober|10月', 'der November|11月', 'der Dezember|12月', 'der Frühling|春', 'der Sommer|夏', 'der Herbst|秋', 'der Winter|冬'] },
      { title: '職業', items: ['der Arzt|医者', 'die Ärztin|女医', 'der Lehrer|教師', 'der Student|学生', 'der Ingenieur|エンジニア', 'der Koch|料理人', 'der Kellner|ウェイター', 'der Verkäufer|店員', 'der Polizist|警官', 'der Angestellte|会社員', 'der Beamte|公務員', 'der Friseur|美容師'] },
      { title: '家・部屋', items: ['die Küche|台所', 'das Bad|浴室', 'das Schlafzimmer|寝室', 'das Wohnzimmer|居間', 'der Tisch|机', 'der Stuhl|椅子', 'das Bett|ベッド', 'der Schrank|戸棚', 'das Sofa|ソファ', 'das Fenster|窓', 'die Tür|ドア', 'die Lampe|ランプ'] },
      { title: '交通', items: ['der Bahnhof|駅', 'der Zug|列車', 'der Bus|バス', 'die U-Bahn|地下鉄', 'die Straßenbahn|路面電車', 'das Auto|車', 'das Fahrrad|自転車', 'das Flugzeug|飛行機', 'der Flughafen|空港', 'die Haltestelle|停留所', 'die Fahrkarte|乗車券'] },
      { title: '学校・大学', items: ['die Universität|大学', 'die Vorlesung|講義', 'das Seminar|ゼミ', 'die Prüfung|試験', 'die Hausaufgabe|宿題', 'das Fach|科目', 'die Mensa|学食', 'die Bibliothek|図書館', 'der Hörsaal|講堂', 'das Semester|学期'] },
      { title: '時の表現', items: ['heute|今日', 'morgen|明日', 'gestern|昨日', 'übermorgen|あさって', 'vorgestern|おととい', 'jetzt|今', 'bald|もうすぐ', 'später|後で', 'oft|よく', 'manchmal|ときどき', 'selten|めったに〜ない', 'morgens|朝に', 'mittags|昼に', 'abends|晩に', 'nachts|夜に'] },
    ],
  },
  {
    id: 'questions',
    cat: '意味・テーマ',
    title: '疑問詞',
    sub: 'W で始まる疑問詞',
    note: '疑問詞は文頭、動詞は2番目。例: Wohin fährst du?',
    groups: [
      { title: '人・物', note: 'wer は格変化する', items: ['wer|誰が|1格', 'wen|誰を|4格', 'wem|誰に|3格', 'wessen|誰の|2格', 'was|何が、何を', 'welcher|どの', 'was für ein|どんな'] },
      { title: '場所・時・理由', items: ['wo|どこで', 'wohin|どこへ', 'woher|どこから', 'wann|いつ', 'warum|なぜ', 'wie|どのように'] },
      { title: 'wie ＋〜', items: ['wie viel|どれだけ（量）', 'wie viele|いくつの（数）', 'wie lange|どのくらいの間', 'wie oft|何回', 'wie alt|何歳', 'wie spät|何時'] },
      { title: 'wo(r) ＋前置詞', note: '前置詞つき動詞で「何を？」と聞くとき。母音の前は wor-', items: ['worauf|何を（auf）', 'woran|何を（an）', 'wofür|何のために（für）', 'worüber|何について（über）', 'womit|何で（mit）', 'wovon|何から、何について（von）'] },
    ],
  },
];
