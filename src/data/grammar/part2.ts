import type { GrammarLesson } from './types';

const P6 = ['ich', 'du', 'er / sie / es', 'wir', 'ihr', 'sie / Sie'];
const conj = (...cols: string[][]) => P6.map((p, i) => [p, ...cols.map((c) => c[i])]);

export const part2: GrammarLesson[] = [
  {
    id: '5A',
    title: '動詞の3基本形と現在完了',
    subtitle: 'Lektion 5A ・ 過去の体験を語ろう',
    goals: ['不定詞・過去基本形・過去分詞（3基本形）', '現在完了 = haben / sein ＋ 過去分詞（文末）', 'sein を使う動詞'],
    sections: [
      {
        title: '3基本形',
        blocks: [
          { t: 'table', head: ['タイプ', '不定詞', '過去基本形', '過去分詞'], rows: [['規則動詞', 'machen', 'machte', 'gemacht'], ['', 'arbeiten', 'arbeitete', 'gearbeitet'], ['強変化動詞', 'fahren', 'fuhr', 'gefahren'], ['', 'kommen', 'kam', 'gekommen'], ['混合変化動詞', 'bringen', 'brachte', 'gebracht'], ['', 'denken', 'dachte', 'gedacht'], ['最重要', 'sein', 'war', 'gewesen'], ['', 'haben', 'hatte', 'gehabt'], ['', 'werden', 'wurde', 'geworden']] },
          { t: 'list', items: ['規則動詞: 語幹＋**-te** / **ge-**語幹**-t**', '強変化動詞: 母音が変わる / **ge-…-en**', '混合変化: 母音が変わる＋ -te / ge-…-t'] },
        ],
      },
      {
        title: '過去分詞の特例',
        blocks: [
          { t: 'p', text: '① **分離動詞**: 前つづり＋本体の過去分詞を1語で → ab|fahren → ab**ge**fahren, teil|nehmen → teil**ge**nommen' },
          { t: 'p', text: '② **ge- をつけない動詞**: 非分離前つづり **be-, er-, ge-, ver-, zer-, ent-, emp-** を持つもの、**-ieren** で終わるもの。' },
          { t: 'ex', de: 'besuchen → besucht / verstehen → verstanden / studieren → studiert', ja: '訪ねる / 理解する / 専攻する' },
        ],
      },
      {
        title: '現在完了',
        blocks: [
          { t: 'p', text: '日常会話で過去のことを話すときは主に**現在完了**。完了の助動詞 **haben / sein** が2番目、**過去分詞は文末**（枠構造）。' },
          { t: 'ex', de: 'Ich habe gestern Deutsch gelernt.', ja: '私は昨日ドイツ語を勉強した。' },
          { t: 'ex', de: 'Mitte August bin ich mit meiner Freundin nach Wien gefahren.', ja: '8月半ばにガールフレンドとウィーンへ行った。' },
          { t: 'p', text: '**sein** を使うのは次の自動詞（辞書の (s) 表示）:' },
          { t: 'list', items: ['場所の移動: fahren, gehen, kommen, fliegen, laufen, reisen, fallen, steigen', '状態の変化: aufstehen, einschlafen, werden, sterben, passieren, geschehen', 'その他: sein, bleiben'] },
          { t: 'ex', de: 'Heute ist Midori um 6 Uhr nach Hause gekommen.', ja: '今日ミドリは6時に帰宅した。' },
          { t: 'ex', de: 'Gestern habe ich zu Hause ferngesehen.', ja: '昨日は家でテレビを見た。' },
        ],
      },
    ],
    quiz: [
      { id: '5A-1', type: 'choice', q: 'kommen の過去分詞は？', options: ['gekommt', 'gekommen', 'kommen', 'gekam'], answer: 1 },
      { id: '5A-2', type: 'choice', q: 'besuchen の過去分詞は？', options: ['gebesucht', 'besucht', 'besuchen', 'besuchte'], answer: 1, explain: 'be- で始まる動詞は ge- をつけません。' },
      { id: '5A-3', type: 'input', q: 'aufstehen の過去分詞', de: 'Ich bin heute um 7 Uhr ___.', answers: ['aufgestanden'] },
      { id: '5A-4', type: 'input', q: 'studieren の過去分詞', de: 'Ich habe in Wien Soziologie ___.', answers: ['studiert'] },
      { id: '5A-5', type: 'choice', q: '完了の助動詞は？ Wir ___ nach Wien gefahren.', options: ['haben', 'sind', 'werden'], answer: 1 },
      { id: '5A-6', type: 'choice', q: '完了の助動詞は？ Ich ___ sehr lange auf dich gewartet.', options: ['habe', 'bin', 'werde'], answer: 0 },
      { id: '5A-7', type: 'choice', q: '完了の助動詞は？ Er ___ drei Tage in Wien geblieben.', options: ['hat', 'ist', 'wird'], answer: 1, explain: 'bleiben は移動でも変化でもないが sein をとります。' },
      { id: '5A-8', type: 'order', q: '彼は私にその本をくれた。', words: ['Er', 'hat', 'mir', 'das', 'Buch', 'gegeben', '.'] },
      { id: '5A-9', type: 'order', q: '放課後、私たちはサッカーをした。', words: ['Nach', 'der', 'Schule', 'haben', 'wir', 'Fußball', 'gespielt', '.'] },
      { id: '5A-10', type: 'input', q: '現在完了に: Seht ihr zu Hause fern? → Habt ihr zu Hause ___?', de: 'Habt ihr zu Hause ___?', answers: ['ferngesehen'] },
    ],
  },
  {
    id: '5B',
    title: '過去形と接続詞・副文',
    subtitle: 'Lektion 5B ・ 文をつなごう',
    goals: ['過去人称変化（ich / er は語尾なし）', '現在完了と過去形の使い分け', '従属接続詞と副文（定動詞は文末）'],
    sections: [
      {
        title: '過去人称変化',
        blocks: [
          { t: 'table', head: ['主語', '語尾', 'sein', 'haben', 'wohnen', 'können', 'werden'], rows: conj(['—', '-st', '—', '-(e)n', '-t', '-(e)n'], ['war', 'warst', 'war', 'waren', 'wart', 'waren'], ['hatte', 'hattest', 'hatte', 'hatten', 'hattet', 'hatten'], ['wohnte', 'wohntest', 'wohnte', 'wohnten', 'wohntet', 'wohnten'], ['konnte', 'konntest', 'konnte', 'konnten', 'konntet', 'konnten'], ['wurde', 'wurdest', 'wurde', 'wurden', 'wurdet', 'wurden']) },
          { t: 'ex', de: 'Wo warst du im Sommer?', ja: '夏はどこにいたの？' },
          { t: 'ex', de: 'Gestern musste er zu Hause bleiben.', ja: '昨日、彼は家にいなければならなかった。' },
          { t: 'note', text: '会話では現在完了が中心。ただし **sein, haben, 話法の助動詞** は会話でも過去形をよく使います。過去形は経歴・物語など現在と切り離して述べるときに使います。' },
        ],
      },
      {
        title: '並列の接続詞と従属接続詞',
        blocks: [
          { t: 'p', text: '並列の接続詞 **aber, denn, oder, und** は語順に影響しません。' },
          { t: 'p', text: '**従属接続詞** で始まる文（**副文**）では**定動詞が副文の末尾**に置かれ、主文とはコンマで区切ります。' },
          { t: 'table', head: ['接続詞', '意味'], rows: [['dass', '～ということ'], ['weil', '～なので'], ['ob', '～かどうか'], ['wenn', '～するとき、もし～ならば'], ['als', '～したとき（過去の1回）'], ['obwohl', '～にもかかわらず']] },
          { t: 'ex', de: 'Peter geht nicht aus der Wohnung, weil das Wetter schlecht ist.', ja: '天気が悪いので、ペーターは外出しない。' },
          { t: 'ex', de: 'Wir wissen nicht, ob der Zug noch kommt.', ja: '列車がまだ来るかどうかわからない。' },
        ],
      },
      {
        title: '副文の注意点',
        blocks: [
          { t: 'list', items: ['副文が**文頭**に来ると、その直後に主文の定動詞: **Als** ich sie gestern besucht habe, **hat** sie mir die Fotos gezeigt.', '疑問詞で始まる**間接疑問文**も副文: Ich weiß nicht, wann der Unterricht **beginnt**.', '副文中の分離動詞は1語に戻る: …, dass die Prüfung morgen um 9 Uhr **anfängt**.'] },
        ],
      },
      {
        title: '数詞（大きな数）・4格の副詞句・語順',
        blocks: [
          { t: 'table', head: ['', ''], rows: [['100', '(ein)hundert'], ['1 000', '(ein)tausend'], ['10 000', 'zehntausend'], ['1 000 000', 'eine Million']] },
          { t: 'p', text: '名詞の4格を副詞として使う: **den ganzen Tag**（一日中）, **jeden Tag**（毎日）, **letzte Woche**（先週）, **nächstes Jahr**（来年）。' },
          { t: 'p', text: '副詞の語順の基本は **時 → 理由など → 場所**: Midori bleibt **heute wegen einer Erkältung zu Hause**.' },
        ],
      },
    ],
    quiz: [
      { id: '5B-1', type: 'input', q: '過去形 (sein)', de: 'Wo ___ du im August?', answers: ['warst'] },
      { id: '5B-2', type: 'input', q: '過去形 (haben)', de: 'Peter ___ gestern Kopfschmerzen.', answers: ['hatte'] },
      { id: '5B-3', type: 'input', q: '過去形 (wollen)', de: 'Gestern ___ ich in die Bibliothek gehen.', answers: ['wollte'] },
      { id: '5B-4', type: 'input', q: '過去形 (wissen)', de: 'Das ___ ich nicht.', answers: ['wusste'] },
      { id: '5B-5', type: 'order', q: '天気が悪いので、ペーターは外出しない。', words: ['Peter', 'geht', 'nicht', 'aus', ',', 'weil', 'das', 'Wetter', 'schlecht', 'ist', '.'] },
      { id: '5B-6', type: 'order', q: '彼が私のところに来られるかどうかわからない。', words: ['Ich', 'bin', 'nicht', 'sicher', ',', 'ob', 'er', 'zu', 'mir', 'kommen', 'kann', '.'] },
      { id: '5B-7', type: 'order', q: '駅がどこにあるかご存知ですか？', words: ['Wissen', 'Sie', ',', 'wo', 'der', 'Bahnhof', 'ist', '?'] },
      { id: '5B-8', type: 'choice', q: '正しい語順は？「彼は病気だったにもかかわらずテニスをした」', options: ['Obwohl er war krank, hat Peter Tennis gespielt.', 'Obwohl er krank war, hat Peter Tennis gespielt.', 'Obwohl er krank war, Peter hat Tennis gespielt.', 'Obwohl war er krank, hat Peter Tennis gespielt.'], answer: 1 },
      { id: '5B-9', type: 'choice', q: '1995 の読み方は？', options: ['tausendneunhundertfünfundneunzig', 'neunzehnhundertfünfundneunzig', 'neunzehnhundertneunzigfünf', 'neunzehnfünfundneunzig'], answer: 1, explain: '1100〜1999年は百の単位で区切って読みます。' },
      { id: '5B-10', type: 'choice', q: '「～したとき」（過去の1回の出来事）は？', options: ['wenn', 'als', 'ob', 'dass'], answer: 1 },
    ],
  },
  {
    id: '6A',
    title: '受動態と序数・日付',
    subtitle: 'Lektion 6A ・ 受身で表現しよう',
    goals: ['動作受動 werden ＋ 過去分詞', '状態受動 sein ＋ 過去分詞', '序数と日付・誕生日の言い方'],
    sections: [
      {
        title: '受動文（動作受動）',
        blocks: [
          { t: 'p', text: '受動の助動詞 **werden** が定動詞（2番目）、**過去分詞が文末**。動作主「～によって」は **von ＋ 3格**。' },
          { t: 'table', head: ['', '例文'], rows: [['能動', 'Am Samstag feiert Peter seinen Geburtstag.'], ['受動', 'Am Samstag wird sein Geburtstag gefeiert.']] },
          { t: 'ex', de: 'Der Kuchen wird von Peter gebacken.', ja: 'そのケーキはペーターによって焼かれる。' },
          { t: 'ex', de: 'Der Kuchen wurde gestern gebacken.', ja: 'そのケーキは昨日焼かれた。（過去: wurde）' },
          { t: 'note', text: 'ドイツ語の受動文の主語にできるのは能動文の**4格目的語だけ**。3格は3格のまま: Dem Geburtstagskind werden Blumen geschenkt.' },
        ],
      },
      {
        title: '状態受動',
        blocks: [
          { t: 'p', text: '**sein ＋ 過去分詞** で「～されている」という結果の状態。' },
          { t: 'ex', de: 'Das Geschäft wird um 9 Uhr geöffnet.', ja: 'その店は9時に開けられる。（動作）' },
          { t: 'ex', de: 'Das Geschäft ist von 9 bis 17 Uhr geöffnet.', ja: 'その店は9時から17時まで開いている。（状態）' },
          { t: 'ex', de: 'Wann bist du geboren?', ja: '君はいつ生まれたの？' },
        ],
      },
      {
        title: '序数と日付',
        blocks: [
          { t: 'p', text: '序数は **1.～19.: 基数＋-t**、**20.～: 基数＋-st**。数字の後ろに「.」をつけて書きます。' },
          { t: 'table', head: ['', '', '', ''], rows: [['1. erst', '2. zweit', '3. dritt', '4. viert'], ['7. siebt', '8. acht', '19. neunzehnt', '20. zwanzigst'], ['21. einundzwanzigst', '30. dreißigst', '31. einunddreißigst', '']] },
          { t: 'p', text: '「～月…日に」は **am ＋ 序数 -en ＋ 月**: am 25. (fünfundzwanzigsten) September。' },
          { t: 'ex', de: 'Ich bin am 9. Dezember 1998 geboren.', ja: '私は1998年12月9日に生まれた。' },
          { t: 'ex', de: 'Den Wievielten haben wir heute? – Den 31. Oktober.', ja: '今日は何日？ ― 10月31日。' },
          { t: 'note', text: '西暦: 1100～1999年は百で区切る（1989 = neunzehnhundertneunundachtzig）。2000年以降は基数どおり（2000 = zweitausend）。' },
        ],
      },
    ],
    quiz: [
      { id: '6A-1', type: 'input', q: '受動（現在）: 誕生日にはよくケーキが食べられる', de: 'Zum Geburtstag ___ oft Kuchen gegessen.', answers: ['wird'] },
      { id: '6A-2', type: 'input', q: '受動（過去）: 昨日のパーティーではビールがたくさん飲まれた', de: 'Gestern ___ viel Bier getrunken.', answers: ['wurde'] },
      { id: '6A-3', type: 'input', q: '過去分詞 (einladen): 私たちは彼の誕生日に招待された', de: 'Wir wurden zu seinem Geburtstag ___.', answers: ['eingeladen'] },
      { id: '6A-4', type: 'choice', q: '状態受動「図書館は今日は閉まっている」', options: ['Die Bibliothek wird heute geschlossen.', 'Die Bibliothek ist heute geschlossen.', 'Die Bibliothek hat heute geschlossen.', 'Die Bibliothek schließt heute geschlossen.'], answer: 1 },
      { id: '6A-5', type: 'order', q: 'そのケーキはペーターによって焼かれる。', words: ['Der', 'Kuchen', 'wird', 'von', 'Peter', 'gebacken', '.'] },
      { id: '6A-6', type: 'choice', q: '「3月1日に」は？', options: ['am ersten März', 'am einsten März', 'im ersten März', 'am erst März'], answer: 0 },
      { id: '6A-7', type: 'choice', q: '序数「第3の」は？', options: ['dreit', 'dritt', 'dreist', 'drittst'], answer: 1 },
      { id: '6A-8', type: 'choice', q: '2016年は？', options: ['zwanzighundertsechzehn', 'zweitausendsechzehn', 'zweitausendsechzig', 'zwanzigsechzehn'], answer: 1 },
      { id: '6A-9', type: 'input', q: '「君はいつ生まれたの？」', de: 'Wann ___ du geboren?', answers: ['bist'] },
    ],
  },
  {
    id: '6B',
    title: '非人称の es と zu 不定詞',
    subtitle: 'Lektion 6B ・ 天気・es gibt・zu 不定詞句',
    goals: ['天候・時刻・感覚を表す非人称の es', 'es gibt ＋ 4格', 'zu 不定詞句の作り方と用法'],
    sections: [
      {
        title: '非人称の es',
        blocks: [
          { t: 'p', text: '天候・自然現象・時刻などは **es** を主語にします（英語の It rains.）。der Regen を主語にはしません。' },
          { t: 'ex', de: 'Es ist sehr warm.', ja: 'とても暖かい。' },
          { t: 'ex', de: 'Es regnet ganz stark.', ja: 'すごく激しく雨が降る。' },
          { t: 'ex', de: 'Es schneit in Berlin.', ja: 'ベルリンでは雪が降っている。' },
          { t: 'p', text: '生理的・心理的感覚（意味上の主語は3格）: **Es ist mir kalt. / Mir ist kalt.**（文頭以外の es は省略されやすい）' },
          { t: 'table', head: ['天気', ''], rows: [['sonnig 晴れた', 'wolkig 曇った'], ['bewölkt / bedeckt 曇った', 'windig 風の強い'], ['heiß 暑い / warm 暖かい', 'kühl 涼しい / kalt 寒い'], ['regnen 雨が降る', 'schneien 雪が降る']] },
        ],
      },
      {
        title: 'es gibt ／ es geht um',
        blocks: [
          { t: 'p', text: '**es gibt ＋ 4格**「～がある」、**es geht um ＋ 4格**「～が問題だ・話題だ」。この es は省略できません。' },
          { t: 'ex', de: 'Gibt es hier in der Nähe einen Parkplatz?', ja: 'この近くに駐車場はありますか？' },
          { t: 'ex', de: 'In der Altstadt gibt es keinen Supermarkt.', ja: '旧市街にはスーパーがない。' },
          { t: 'ex', de: 'Es geht um den Umweltschutz.', ja: '環境保護が重要だ。' },
        ],
      },
      {
        title: 'zu 不定詞句',
        blocks: [
          { t: 'p', text: '不定詞の前に zu を置く。**分離動詞**は前つづりと本体の間に zu を入れて1語: aus|machen → aus**zu**machen。zu 不定詞句の中では **zu 不定詞が最後**。' },
          { t: 'ex', de: 'Es ist toll, Deutsch zu lernen.', ja: 'ドイツ語を学ぶのはすてきだ。（名詞的用法）' },
          { t: 'ex', de: 'Ich habe heute keine Zeit, in die Bibliothek zu gehen.', ja: '今日は図書館に行く時間がない。（付加的用法）' },
          { t: 'table', head: ['表現', '意味'], rows: [['um … zu 不定詞', '～するために'], ['ohne … zu 不定詞', '～しないで'], ['haben … zu 不定詞', '～しなければならない'], ['sein … zu 不定詞', '～されうる／されねばならない'], ['nicht brauchen … zu 不定詞', '～する必要はない'], ['scheinen … zu 不定詞', '～のようだ']] },
          { t: 'ex', de: 'Er ist extra gekommen, um sie zu sehen.', ja: '彼女に会うために彼はわざわざやって来た。' },
          { t: 'ex', de: 'Sie brauchen heute nicht einzukaufen.', ja: '今日は買い物をする必要はありません。' },
        ],
      },
    ],
    quiz: [
      { id: '6B-1', type: 'choice', q: '「雨が降っている」', options: ['Der Regen regnet.', 'Es regnet.', 'Er regnet.', 'Es ist Regen.'], answer: 1 },
      { id: '6B-2', type: 'input', q: '「この近くにレストランはありますか？」', de: 'Gibt ___ hier in der Nähe ein Restaurant?', answers: ['es'] },
      { id: '6B-3', type: 'choice', q: '「旧市街にはスーパーマーケットがない」', options: ['In der Altstadt gibt es kein Supermarkt.', 'In der Altstadt gibt es keinen Supermarkt.', 'In der Altstadt es gibt keinen Supermarkt.', 'In der Altstadt gibt keinen Supermarkt.'], answer: 1, explain: 'es gibt は4格をとる: keinen Supermarkt（男性4格）。' },
      { id: '6B-4', type: 'input', q: 'zu 不定詞 (ausmachen)', de: 'Erik geht ins Bett, ohne den Computer ___.', answers: ['auszumachen'] },
      { id: '6B-5', type: 'input', q: 'zu 不定詞 (mitbringen)', de: 'Nina hat vergessen, mir das Buch ___.', answers: ['mitzubringen'] },
      { id: '6B-6', type: 'order', q: '一緒に映画に行く気はある？', words: ['Hast', 'du', 'Lust', ',', 'mit', 'mir', 'ins', 'Kino', 'zu', 'gehen', '?'] },
      { id: '6B-7', type: 'order', q: '私は授業に出るために大学へ行く。', words: ['Ich', 'fahre', 'zur', 'Uni', ',', 'um', 'am', 'Unterricht', 'teilzunehmen', '.'] },
      { id: '6B-8', type: 'choice', q: 'Peter scheint glücklich zu sein. の意味は？', options: ['ペーターは幸せになりたい', 'ペーターは幸せそうだ', 'ペーターは幸せでなければならない', 'ペーターは幸せだった'], answer: 1 },
      { id: '6B-9', type: 'choice', q: '「私は寒い」', options: ['Ich bin kalt.', 'Mir ist kalt.', 'Mich ist kalt.', 'Ich habe kalt.'], answer: 1 },
    ],
  },
  {
    id: '7A',
    title: '形容詞の格変化と比較',
    subtitle: 'Lektion 7A ・ 形容詞を使いこなそう',
    goals: ['形容詞の3つの用法', '弱変化・混合変化・強変化', '比較級・最上級と比較表現'],
    sections: [
      {
        title: '形容詞の用法',
        blocks: [
          { t: 'list', items: ['① 述語的: Die Hose ist **billig**.（語尾なし）', '② 副詞的: Dort kann man Jeans **billig** kaufen.（語尾なし）', '③ 付加語的: Midori kauft einen **billigen** Rock.（名詞の前で語尾がつく）'] },
        ],
      },
      {
        title: 'I. 定冠詞（類）＋形容詞＋名詞 ＝ 弱変化',
        blocks: [
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'der blaue Rock', 'die blaue Hose', 'das blaue Kleid', 'die blauen Schuhe'], ['2格', 'des blauen Rock(e)s', 'der blauen Hose', 'des blauen Kleid(e)s', 'der blauen Schuhe'], ['3格', 'dem blauen Rock', 'der blauen Hose', 'dem blauen Kleid', 'den blauen Schuhen'], ['4格', 'den blauen Rock', 'die blaue Hose', 'das blaue Kleid', 'die blauen Schuhe']] },
          { t: 'note', text: '語尾は **-e** か **-en** の2種類だけ。-e になるのは単数1格（全性）と女性・中性の4格。' },
        ],
      },
      {
        title: 'II. 不定冠詞（類）＋形容詞＋名詞 ＝ 混合変化',
        blocks: [
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'ein neuer Computer', 'eine neue Uhr', 'ein neues Buch', 'unsere neuen Bücher'], ['2格', 'eines neuen Computers', 'einer neuen Uhr', 'eines neuen Buch(e)s', 'unserer neuen Bücher'], ['3格', 'einem neuen Computer', 'einer neuen Uhr', 'einem neuen Buch', 'unseren neuen Büchern'], ['4格', 'einen neuen Computer', 'eine neue Uhr', 'ein neues Buch', 'unsere neuen Bücher']] },
          { t: 'note', text: '冠詞が性を示さない3か所（男性1格 ein / 中性1・4格 ein）で形容詞が **-er / -es** になって性を示します。' },
          { t: 'ex', de: 'Peter gibt dem kleinen Mädchen ein altes Buch.', ja: 'ペーターはその小さな少女に古い本を1冊あげる。' },
        ],
      },
      {
        title: 'III. 形容詞＋名詞（無冠詞）＝ 強変化',
        blocks: [
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'kalter Saft', 'kalte Milch', 'kaltes Bier', 'kalte Getränke'], ['2格', 'kalten Saft(e)s', 'kalter Milch', 'kalten Bier(e)s', 'kalter Getränke'], ['3格', 'kaltem Saft', 'kalter Milch', 'kaltem Bier', 'kalten Getränken'], ['4格', 'kalten Saft', 'kalte Milch', 'kaltes Bier', 'kalte Getränke']] },
          { t: 'note', text: '冠詞がないので形容詞が**定冠詞とほぼ同じ語尾**を担います（男性・中性2格だけ -en）。' },
        ],
      },
      {
        title: '比較級・最上級',
        blocks: [
          { t: 'table', head: ['原級', '比較級 -er', '最上級 -(e)st'], rows: [['klein', 'kleiner', 'kleinst'], ['schön', 'schöner', 'schönst'], ['alt', 'älter', 'ältest'], ['jung', 'jünger', 'jüngst'], ['lang', 'länger', 'längst'], ['gut', 'besser', 'best'], ['groß', 'größer', 'größt'], ['viel', 'mehr', 'meist'], ['hoch', 'höher', 'höchst'], ['gern（副詞）', 'lieber', 'am liebsten']] },
          { t: 'list', items: ['**so ＋ 原級 ＋ wie**: ～と同じくらい… / nicht so … wie: ～ほど…でない', '**比較級 ＋ als**: ～より…', '**der/die/das ＋ 最上級 -e** / **am ＋ 最上級 -en**: いちばん…'] },
          { t: 'ex', de: 'Nina ist so groß wie Midori.', ja: 'ニーナはミドリと同じくらいの背の高さだ。' },
          { t: 'ex', de: 'Peter ist größer als Midori.', ja: 'ペーターはミドリより背が高い。' },
          { t: 'ex', de: 'Daniel läuft am schnellsten in der Klasse.', ja: 'ダニエルはクラスで一番速く走る。' },
          { t: 'ex', de: 'Hamburg ist eine der größten Städte in Deutschland.', ja: 'ハンブルクはドイツ最大の都市のひとつだ。' },
        ],
      },
    ],
    quiz: [
      { id: '7A-1', type: 'input', q: '語尾（この青いスカート r Rock, 1格）', de: 'Der blau___ Rock ist toll.', answers: ['e'], hint: '語尾だけ' },
      { id: '7A-2', type: 'input', q: '語尾（このグレーのスーツを r Anzug, 4格）', de: 'Wie findest du diesen grau___ Anzug?', answers: ['en'], hint: '語尾だけ' },
      { id: '7A-3', type: 'input', q: '語尾（新しいコンピューター r Computer, 1格）', de: 'Auf dem Tisch ist ein neu___ Computer.', answers: ['er'], hint: '語尾だけ' },
      { id: '7A-4', type: 'input', q: '語尾（古い本を s Buch, 4格）', de: 'Peter gibt dem Mädchen ein alt___ Buch.', answers: ['es'], hint: '語尾だけ' },
      { id: '7A-5', type: 'input', q: '語尾（小さな少女に s Mädchen, 3格）', de: 'Peter gibt dem klein___ Mädchen ein Buch.', answers: ['en'], hint: '語尾だけ' },
      { id: '7A-6', type: 'input', q: '語尾（冷たいビール s Bier, 4格・無冠詞）', de: 'Ich trinke gern kalt___ Bier.', answers: ['es'], hint: '語尾だけ' },
      { id: '7A-7', type: 'input', q: '語尾（熱いコーヒー r Kaffee, 4格・無冠詞）', de: 'Ich möchte heiß___ Kaffee.', answers: ['en'], hint: '語尾だけ' },
      { id: '7A-8', type: 'input', q: '比較級 (lang): ドナウ川はライン川より長い', de: 'Die Donau ist ___ als der Rhein.', answers: ['länger'] },
      { id: '7A-9', type: 'input', q: '比較 (gern): コーヒーより紅茶が好き', de: 'Ich trinke ___ Tee als Kaffee.', answers: ['lieber'] },
      { id: '7A-10', type: 'choice', q: 'ハイデルベルクにはドイツで最も古い大学がある', de: 'In Heidelberg ist die ___ Universität Deutschlands.', options: ['alteste', 'älteste', 'ältesten', 'älter'], answer: 1 },
    ],
  },
  {
    id: '7B',
    title: '再帰代名詞と再帰動詞',
    subtitle: 'Lektion 7B ・ sich を使いこなそう',
    goals: ['再帰代名詞の3格・4格', '再帰動詞と前置詞の組み合わせ', '相互代名詞「お互いに」'],
    sections: [
      {
        title: '再帰代名詞',
        blocks: [
          { t: 'p', text: '主語自身を指す代名詞。**3人称と敬称 Sie はすべて sich**（Sie の場合も小文字）。それ以外は人称代名詞と同じ形。' },
          { t: 'table', head: ['', 'ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie', 'Sie'], rows: [['3格', 'mir', 'dir', 'sich', 'uns', 'euch', 'sich', 'sich'], ['4格', 'mich', 'dich', 'sich', 'uns', 'euch', 'sich', 'sich']] },
          { t: 'ex', de: 'Ich setze das Kind auf den Stuhl. / Ich setze mich auf den Stuhl.', ja: '子どもを椅子に座らせる。／私は椅子に座る。' },
          { t: 'ex', de: 'Mein Vater kauft sich ein Auto.', ja: '父は（自分用に）車を買う。' },
          { t: 'ex', de: 'Du sollst dir vor dem Essen die Hände waschen.', ja: '食事の前に手を洗いなさい。（体の部分には3格の再帰代名詞）' },
        ],
      },
      {
        title: '再帰動詞',
        blocks: [
          { t: 'p', text: '常に再帰代名詞とともに使う動詞: **sich erkälten**（風邪をひく）, **sich schämen**（恥じる）など。' },
          { t: 'ex', de: 'Ich habe mich erkältet.', ja: '風邪をひいた。' },
          { t: 'ex', de: 'Leg dich ins Bett!', ja: 'ベッドで横になりなさい！' },
          { t: 'table', head: ['熟語', '意味'], rows: [['sich an ～⁴ erinnern', '～を覚えている・思い出す'], ['sich auf ～⁴ freuen', '～を楽しみにする'], ['sich über ～⁴ freuen', '～を喜ぶ'], ['sich für ～⁴ interessieren', '～に興味がある'], ['sich mit ～³ beschäftigen', '～に取り組む'], ['sich um ～⁴ kümmern', '～の面倒を見る'], ['sich um ～⁴ bewerben', '～に応募する'], ['sich vor ～³ fürchten', '～を怖がる'], ['sich mit ～³ unterhalten', '～と歓談する']] },
          { t: 'ex', de: 'Die Studenten freuen sich auf den Ausflug.', ja: '学生たちは遠足を楽しみにしている。' },
          { t: 'ex', de: 'Interessiert ihr euch nicht für Politik?', ja: '君たちは政治に興味がないの？' },
        ],
      },
      {
        title: '相互代名詞',
        blocks: [
          { t: 'p', text: '主語が複数のとき、再帰代名詞が「お互いに」の意味になることがあります。' },
          { t: 'ex', de: 'Claudia und Daniel lieben sich.', ja: 'クラウディアとダニエルは愛し合っている。' },
          { t: 'ex', de: 'Wann sehen wir uns wieder?', ja: '今度いつ会おうか？' },
        ],
      },
    ],
    quiz: [
      { id: '7B-1', type: 'input', q: '再帰代名詞（お掛けください）', de: 'Setzen Sie ___ bitte, Herr Becker!', answers: ['sich'] },
      { id: '7B-2', type: 'input', q: '再帰代名詞（セーターを買った）', de: 'Ich habe ___ einen Pullover gekauft.', answers: ['mir'] },
      { id: '7B-3', type: 'input', q: '再帰代名詞（ガールフレンドと歓談した）', de: 'Ich habe ___ mit meiner Freundin unterhalten.', answers: ['mich'] },
      { id: '7B-4', type: 'input', q: '再帰代名詞（君たちは助け合わなければ）', de: 'Ihr müsst ___ helfen.', answers: ['euch'] },
      { id: '7B-5', type: 'input', q: '前置詞（子どもたちはクリスマスを楽しみにしている）', de: 'Die Kinder freuen sich ___ Weihnachten.', answers: ['auf'] },
      { id: '7B-6', type: 'input', q: '前置詞（このテーマに興味がありますか？）', de: 'Interessieren Sie sich ___ dieses Thema?', answers: ['für'] },
      { id: '7B-7', type: 'input', q: '前置詞（私のことを覚えていますか？）', de: 'Erinnern Sie sich noch ___ mich?', answers: ['an'] },
      { id: '7B-8', type: 'order', q: '私は風邪をひいた。', words: ['Ich', 'habe', 'mich', 'erkältet', '.'] },
      { id: '7B-9', type: 'choice', q: 'Das Kind fürchtet sich vor dem Zahnarzt. の意味は？', options: ['子どもは歯医者の前で待っている', '子どもは歯医者を怖がっている', '子どもは歯医者に感謝している', '子どもは歯医者を楽しみにしている'], answer: 1 },
    ],
  },
  {
    id: '8A',
    title: '関係代名詞と関係副詞',
    subtitle: 'Lektion 8A ・ 説明を加えよう',
    goals: ['指示代名詞と定関係代名詞の形', '関係代名詞の性・数は先行詞、格は関係文の中の役割', '関係副詞 wo と不定関係代名詞 wer / was'],
    sections: [
      {
        title: '定関係代名詞の格変化',
        blocks: [
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'der', 'die', 'das', 'die'], ['2格', 'dessen', 'deren', 'dessen', 'deren'], ['3格', 'dem', 'der', 'dem', 'denen'], ['4格', 'den', 'die', 'das', 'die']] },
          { t: 'note', text: '定冠詞とほぼ同じ。違うのは2格（dessen / deren）と複数3格（denen）。指示代名詞（Der spielt gut Fußball.「その人は…」）も同じ形です。' },
        ],
      },
      {
        title: '関係文のルール',
        blocks: [
          { t: 'list', items: ['① 関係代名詞の**性・数は先行詞**に、**格は関係文の中での役割**で決まる', '② 関係文は**副文** → 定動詞は**文末**', '③ 主文と関係文は**コンマ**で区切る', '④ 前置詞と結びつくときは**前置詞が先**（mit der …）。関係代名詞は省略しない'] },
          { t: 'ex', de: 'Ich fahre zu einer Freundin, die in Dresden wohnt.', ja: '私はドレスデンに住んでいる友人のところへ行く。（1格）' },
          { t: 'ex', de: 'Ist das die Musikstudentin, die ich kennengelernt habe?', ja: 'それは僕が知り合ったあの音大生？（4格）' },
          { t: 'ex', de: 'Da ist der Mann, dem ich ein Buch geliehen habe.', ja: 'あそこに、私が本を貸している男性がいる。（3格）' },
          { t: 'ex', de: 'Da ist der Mann, dessen Vater ein berühmter Schriftsteller ist.', ja: 'あそこに、父親が有名な作家である男性がいる。（2格）' },
          { t: 'ex', de: 'Das ist die Frage, mit der man sich immer beschäftigen muss.', ja: 'それはいつも取り組まなければならない問題だ。' },
        ],
      },
      {
        title: '関係副詞 wo / 不定関係代名詞 wer・was',
        blocks: [
          { t: 'p', text: '**wo** は場所・時を表す語を先行詞にとる: Ich fahre nach Dresden, **wo** meine Freundin wohnt.' },
          { t: 'p', text: '**wer**「～する人（は誰でも）」、**was**「～するもの・こと」は先行詞なしで使えます。was は alles, nichts, etwas を先行詞にとることも。' },
          { t: 'ex', de: 'Wer fremde Sprachen nicht kennt, weiß nichts von seiner eigenen.', ja: '外国語を知らない者は自分の言語について何も知らない。（ゲーテ）' },
          { t: 'ex', de: 'Das ist alles, was ich weiß.', ja: '私が知っているのはこれで全部です。' },
        ],
      },
    ],
    quiz: [
      { id: '8A-1', type: 'input', q: '関係代名詞（ポツダムに住んでいる私の友人(女性)）', de: 'Das ist meine Freundin, ___ in Potsdam wohnt.', answers: ['die'] },
      { id: '8A-2', type: 'input', q: '関係代名詞（週末に見た映画 r Film）', de: 'Der Film, ___ ich am Wochenende gesehen habe, war nicht schlecht.', answers: ['den'] },
      { id: '8A-3', type: 'input', q: '関係代名詞（昨日買ったセーター r Pullover）', de: 'Das ist der Pullover, ___ ich gestern gekauft habe.', answers: ['den'] },
      { id: '8A-4', type: 'input', q: '関係代名詞（来年ドイツで勉強するつもりの学生）', de: 'Das ist der Student, ___ nächstes Jahr in Deutschland studieren will.', answers: ['der'] },
      { id: '8A-5', type: 'input', q: '関係代名詞（私がその人を怖がっている唯一の人 r Mensch, vor+3格）', de: 'Er ist der einzige Mensch, vor ___ ich Angst habe.', answers: ['dem'] },
      { id: '8A-6', type: 'input', q: '関係代名詞（私が一緒に遊ぶ子どもたち・複数3格）', de: 'Das sind die Kinder, mit ___ ich spiele.', answers: ['denen'] },
      { id: '8A-7', type: 'choice', q: '関係副詞を選ぼう: Das ist die Universität, ___ meine Mutter studiert hat.', options: ['was', 'wo', 'wer', 'wann'], answer: 1 },
      { id: '8A-8', type: 'choice', q: 'Hier finde ich nichts, ___ mir gefällt.', options: ['das', 'was', 'wo', 'der'], answer: 1 },
      { id: '8A-9', type: 'order', q: '私はドレスデンに住んでいる友人(女性)のところに行く。', words: ['Ich', 'fahre', 'zu', 'einer', 'Freundin', ',', 'die', 'in', 'Dresden', 'wohnt', '.'] },
    ],
  },
  {
    id: '8B',
    title: '接続法II式',
    subtitle: 'Lektion 8B ・ 非現実と丁寧な依頼',
    goals: ['接続法II式の形（wäre, hätte, würde, könnte …）', '非現実の仮定 wenn …, würde …', 'als ob ／ 婉曲・丁寧な表現'],
    sections: [
      {
        title: '接続法II式の作り方',
        blocks: [
          { t: 'list', items: ['過去基本形をもとに作る', '規則動詞は過去形と同じ形', '不規則動詞は a, o, u → ä, ö, ü にし、e で終わらなければ -e をつける', '人称変化は過去人称変化と同じ'] },
          { t: 'table', head: ['主語', 'sein → wäre', 'haben → hätte', 'werden → würde', 'können → könnte', 'mögen → möchte'], rows: conj(['wäre', 'wär(e)st', 'wäre', 'wären', 'wär(e)t', 'wären'], ['hätte', 'hättest', 'hätte', 'hätten', 'hättet', 'hätten'], ['würde', 'würdest', 'würde', 'würden', 'würdet', 'würden'], ['könnte', 'könntest', 'könnte', 'könnten', 'könntet', 'könnten'], ['möchte', 'möchtest', 'möchte', 'möchten', 'möchtet', 'möchten']) },
        ],
      },
      {
        title: '非現実の仮定',
        blocks: [
          { t: 'ex', de: 'Wenn wir keine Prüfungen hätten, könnten wir uns schon jetzt auf die Ferien freuen.', ja: 'もし試験がなければ、もう休暇を楽しみにできるのに。（実際は試験がある）' },
          { t: 'ex', de: 'Wenn ich nicht erkältet wäre, würde ich mit dir ins Kino gehen.', ja: '風邪をひいていなければ君と映画に行くんだけど。' },
          { t: 'ex', de: 'Wenn ich doch ein Vogel wäre!', ja: '鳥だったらなあ！' },
          { t: 'note', text: '会話では sein, haben, 話法の助動詞以外の動詞は **würde ＋ 不定詞（文末）** で言い換えることが多い。' },
        ],
      },
      {
        title: 'als ob ／ 婉曲表現',
        blocks: [
          { t: 'ex', de: 'Du siehst aus, als ob du krank wärst.', ja: '君はまるで病気みたいに見える。' },
          { t: 'ex', de: 'Midori spricht Deutsch, als ob sie eine Deutsche wäre.', ja: 'ミドリはまるでドイツ人のようにドイツ語を話す。' },
          { t: 'p', text: '接続法II式は言い方をやわらげ、丁寧にします。' },
          { t: 'ex', de: 'Ich hätte gern zwei Tassen Kaffee.', ja: 'コーヒーを2杯いただきたいのですが。' },
          { t: 'ex', de: 'Könnten Sie mir bitte sagen, wo die Bibliothek ist?', ja: '図書館がどこにあるか教えていただけますか？' },
          { t: 'ex', de: 'Wie wäre es, wenn Sie noch ein bisschen länger bleiben würden?', ja: 'もう少し長く滞在されてはいかがですか？' },
        ],
      },
    ],
    quiz: [
      { id: '8B-1', type: 'input', q: '接続法II式 (haben)', de: 'Wenn ich mehr Zeit ___, würde ich mehr Bücher lesen.', answers: ['hätte'] },
      { id: '8B-2', type: 'input', q: '接続法II式 (sein)', de: 'Du siehst aus, als ob du krank ___.', answers: ['wärst', 'wärest'] },
      { id: '8B-3', type: 'input', q: '接続法II式 (können) 丁寧な依頼', de: '___ Sie mir bitte helfen?', answers: ['Könnten'] },
      { id: '8B-4', type: 'input', q: '接続法II式 (haben) 注文', de: 'Wir ___ gern zwei Tassen Kaffee.', answers: ['hätten'] },
      { id: '8B-5', type: 'input', q: '接続法II式 (sein)', de: 'Es ___ schön, wenn du uns wieder besuchen würdest.', answers: ['wäre'] },
      { id: '8B-6', type: 'order', q: 'もし君が政治家なら、何をする？', words: ['Was', 'würdest', 'du', 'machen', ',', 'wenn', 'du', 'Politiker', 'wärst', '?'] },
      { id: '8B-7', type: 'choice', q: '「彼はまるで悩みなどないかのように見える」', options: ['Er sieht aus, als ob er keine Sorgen hat.', 'Er sieht aus, als ob er keine Sorgen hätte.', 'Er sieht aus, als ob hätte er keine Sorgen.', 'Er sieht aus, ob er keine Sorgen hätte.'], answer: 1 },
      { id: '8B-8', type: 'choice', q: 'Einen guten Rutsch! はいつ使う？', options: ['誕生日', '年末', '食事の前', '病気見舞い'], answer: 1 },
    ],
  },
];
