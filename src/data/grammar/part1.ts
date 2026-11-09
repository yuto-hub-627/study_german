import type { GrammarLesson } from './types';

const P6 = ['ich', 'du', 'er / sie / es', 'wir', 'ihr', 'sie / Sie'];
const conj = (...cols: string[][]) => P6.map((p, i) => [p, ...cols.map((c) => c[i])]);

export const part1: GrammarLesson[] = [
  {
    id: '1A',
    title: '動詞の現在人称変化 (1)',
    subtitle: 'Lektion 1A ・ 質問しよう／質問に答えよう',
    goals: ['動詞の不定詞＝語幹＋語尾 -en', '主語に合わせて語尾を変える', '定動詞の位置（平叙文・疑問文）'],
    sections: [
      {
        title: '不定詞と語幹',
        blocks: [
          { t: 'p', text: '辞書に載っている形を**不定詞**といい、原則として**語幹＋語尾 -en** でできています。例: komm**en**（来る）→ 語幹 komm-。' },
          { t: 'p', text: '文の中では主語の人称・数に合わせて語尾が変わります。こうして変化した動詞を**定動詞**と呼びます。' },
        ],
      },
      {
        title: '現在人称変化の語尾',
        blocks: [
          {
            t: 'table',
            head: ['主語', '語尾', 'kommen', 'wohnen', 'lernen'],
            rows: conj(['-e', '-st', '-t', '-en', '-t', '-en'], ['komme', 'kommst', 'kommt', 'kommen', 'kommt', 'kommen'], ['wohne', 'wohnst', 'wohnt', 'wohnen', 'wohnt', 'wohnen'], ['lerne', 'lernst', 'lernt', 'lernen', 'lernt', 'lernen']),
          },
          { t: 'note', text: '敬称の **Sie**（あなた／あなたがた）は単数・複数とも同じ形で、常に大文字で書きます。3人称の sie（彼女／彼ら）は文頭以外では小文字です。' },
          { t: 'note', text: 'ドイツ語の現在形は進行中のこと・近い未来も表します（英語の現在進行形にあたる形はありません）。' },
        ],
      },
      {
        title: '定動詞の位置',
        blocks: [
          { t: 'list', items: ['**平叙文**: 定動詞は**2番目**', '**疑問詞のない疑問文**: 定動詞が**文頭** → ja / nein で答える', '**疑問詞のある疑問文**: 疑問詞が文頭、定動詞が**2番目**'] },
          { t: 'ex', de: 'Midori wohnt in Berlin.', ja: 'ミドリはベルリンに住んでいる。' },
          { t: 'ex', de: 'Wohnt Midori in Berlin? – Ja, sie wohnt in Berlin.', ja: 'ミドリはベルリンに住んでいるの？ ― うん、住んでいるよ。' },
          { t: 'ex', de: 'Woher kommst du? – Ich komme aus Japan.', ja: '君はどこの出身？ ― 日本だよ。' },
          { t: 'note', text: '英語の do にあたる助動詞はありません。否定は nicht を使います: Sie wohnt **nicht** in Berlin.' },
        ],
      },
      {
        title: '数詞 0〜19',
        blocks: [
          { t: 'table', head: ['数', '', '数', ''], rows: [['0', 'null', '10', 'zehn'], ['1', 'eins', '11', 'elf'], ['2', 'zwei', '12', 'zwölf'], ['3', 'drei', '13', 'dreizehn'], ['4', 'vier', '14', 'vierzehn'], ['5', 'fünf', '15', 'fünfzehn'], ['6', 'sechs', '16', 'sechzehn'], ['7', 'sieben', '17', 'siebzehn'], ['8', 'acht', '18', 'achtzehn'], ['9', 'neun', '19', 'neunzehn']] },
          { t: 'note', text: '16 は sechzehn（s が落ちる）、17 は siebzehn（en が落ちる）に注意。' },
        ],
      },
    ],
    quiz: [
      { id: '1A-1', type: 'input', q: '(spielen) を正しい形に', de: 'Thomas ___ heute Tennis.', answers: ['spielt'] },
      { id: '1A-2', type: 'input', q: '(lernen) を正しい形に', de: 'Was ___ du? – Ich lerne Deutsch.', answers: ['lernst'] },
      { id: '1A-3', type: 'input', q: '(studieren) を正しい形に', de: 'Wir ___ Jura.', answers: ['studieren'] },
      { id: '1A-4', type: 'input', q: '(wohnen) を正しい形に', de: 'Wo ___ ihr?', answers: ['wohnt'] },
      { id: '1A-5', type: 'choice', q: 'あてはまる人称代名詞は？', de: 'Woher kommen ___, Frau Schmidt?', options: ['du', 'Sie', 'ihr', 'sie'], answer: 1, explain: 'Frau ～ と呼びかける相手には敬称 Sie を使います。' },
      { id: '1A-6', type: 'choice', q: '「ニーナはローマ出身なの？」として正しい語順は？', options: ['Nina kommt aus Rom?', 'Kommt Nina aus Rom?', 'Aus Rom Nina kommt?', 'Nina aus Rom kommt?'], answer: 1, explain: '疑問詞のない疑問文では定動詞が文頭に来ます。' },
      { id: '1A-7', type: 'order', q: '君は何を専攻しているの？', words: ['Was', 'studierst', 'du', '?'] },
      { id: '1A-8', type: 'order', q: '私たちはベルリンに住んでいない。', words: ['Wir', 'wohnen', 'nicht', 'in', 'Berlin', '.'] },
      { id: '1A-9', type: 'choice', q: '17 はドイツ語で？', options: ['siebenzehn', 'siebzehn', 'sibzehn', 'siebtzehn'], answer: 1 },
    ],
  },
  {
    id: '1B',
    title: 'sein / haben と定動詞第2位',
    subtitle: 'Lektion 1B ・ du/ihr と Sie',
    goals: ['sein と haben の現在人称変化', '定動詞第2位の原則', '口調の e・語幹が s/ß/z で終わる動詞'],
    sections: [
      {
        title: 'du/ihr と Sie',
        blocks: [
          { t: 'list', items: ['**du / ihr（親称）**: 家族・友人・学生同士・子どもなど親しい相手。ファーストネームで呼ぶ。', '**Sie（敬称）**: 初対面・仕事上の相手など。Herr ～ / Frau ～ と呼ぶ。'] },
          { t: 'ex', de: 'Hallo, Peter! Wohin gehst du?', ja: 'やあペーター！どこ行くの？' },
          { t: 'ex', de: 'Guten Abend, Herr Fischer! Wohin gehen Sie?', ja: 'こんばんは、フィッシャーさん。どちらへ？' },
        ],
      },
      {
        title: 'sein と haben',
        blocks: [
          { t: 'table', head: ['主語', 'sein（～である）', 'haben（持っている）'], rows: conj(['bin', 'bist', 'ist', 'sind', 'seid', 'sind'], ['habe', 'hast', 'hat', 'haben', 'habt', 'haben']) },
          { t: 'ex', de: 'Sind Sie Studentin? – Ja, ich bin Studentin.', ja: 'あなたは大学生ですか？ ― はい、大学生です。' },
          { t: 'ex', de: 'Hast du heute Zeit? – Ja, heute habe ich Zeit.', ja: '今日時間ある？ ― うん、今日は時間があるよ。' },
          { t: 'note', text: '職業・身分・国籍は**無冠詞**で言います: Ich bin Student. / Sie ist Japanerin.' },
        ],
      },
      {
        title: '定動詞第2位の原則',
        blocks: [
          { t: 'p', text: '平叙文では、文頭に主語以外の要素（時・場所など）が来ても**定動詞は必ず2番目**。主語は動詞の後ろに回ります。' },
          { t: 'ex', de: 'Ich habe morgen Abend Zeit.', ja: '私は明日の晩、時間がある。' },
          { t: 'ex', de: 'Morgen Abend habe ich Zeit.', ja: '明日の晩は時間がある。' },
          { t: 'note', text: '並列の接続詞 **aber, denn, oder, und** は文頭に置いても数えません（語順に影響しない）。Ich lerne Deutsch. **Aber** er lernt Französisch.' },
          { t: 'p', text: '**不定詞句**: 主語を定めずに並べるとき、不定詞は**最後**。例: morgen Abend Klavier spielen → Thomas **spielt** morgen Abend Klavier.' },
        ],
      },
      {
        title: '発音の都合で少し変わる動詞',
        blocks: [
          { t: 'p', text: '① 語幹が **-t, -d** などで終わる動詞は du, er, ihr で **e** を補う。② 語幹が **-s, -ß, -z** で終わる動詞は du で s を重ねない（-t だけ）。' },
          { t: 'table', head: ['主語', 'arbeiten', 'finden', 'reisen', 'heißen'], rows: conj(['arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet', 'arbeiten'], ['finde', 'findest', 'findet', 'finden', 'findet', 'finden'], ['reise', 'reist', 'reist', 'reisen', 'reist', 'reisen'], ['heiße', 'heißt', 'heißt', 'heißen', 'heißt', 'heißen']) },
          { t: 'ex', de: 'Wie findest du Deutsch? – Interessant, aber schwer.', ja: 'ドイツ語をどう思う？ ― 面白いけど難しい。' },
        ],
      },
    ],
    quiz: [
      { id: '1B-1', type: 'input', q: '(sein)', de: 'Frau Müller ___ Lehrerin.', answers: ['ist'] },
      { id: '1B-2', type: 'input', q: '(sein)', de: '___ du Student?', answers: ['Bist', 'bist'] },
      { id: '1B-3', type: 'input', q: '(sein)', de: 'Ihr ___ sehr freundlich.', answers: ['seid'] },
      { id: '1B-4', type: 'input', q: '(haben)', de: '___ ihr Durst?', answers: ['Habt', 'habt'] },
      { id: '1B-5', type: 'input', q: '(haben)', de: 'Nina ___ heute Geburtstag.', answers: ['hat'] },
      { id: '1B-6', type: 'input', q: '(arbeiten)', de: 'Wo ___ du?', answers: ['arbeitest'] },
      { id: '1B-7', type: 'input', q: '(heißen)', de: 'Wie ___ du?', answers: ['heißt', 'heisst'] },
      { id: '1B-8', type: 'order', q: '今日、トーマスは時間がある。（Heute で始めて）', words: ['Heute', 'hat', 'Thomas', 'Zeit', '.'], explain: '定動詞第2位: 文頭が Heute でも動詞は2番目、主語はその後。' },
      { id: '1B-9', type: 'order', q: '明日の夜、彼らはパーティーをする。（Morgen Abend で始めて）', words: ['Morgen', 'Abend', 'machen', 'sie', 'eine', 'Party', '.'] },
      { id: '1B-10', type: 'choice', q: '正しい文は？', options: ['Aber er lernt Französisch.', 'Aber lernt er Französisch.', 'Aber er Französisch lernt.', 'Er aber Französisch lernt.'], answer: 0, explain: 'aber は語順に影響しない並列の接続詞です。' },
    ],
  },
  {
    id: '2A',
    title: '名詞の性と格変化',
    subtitle: 'Lektion 2A ・ ドイツ語の「てにをは」',
    goals: ['名詞は性（男性・女性・中性）と一緒に覚える', '定冠詞・不定冠詞の格変化（1〜4格）', '3格・4格を目的語にとる動詞'],
    sections: [
      {
        title: '名詞の性と冠詞',
        blocks: [
          { t: 'table', head: ['', '男性 m.', '女性 f.', '中性 n.', '複数 Pl.'], rows: [['定冠詞', 'der Vater', 'die Mutter', 'das Kind', 'die Kinder'], ['不定冠詞', 'ein Vater', 'eine Mutter', 'ein Kind', '—'], ['人称代名詞', 'er', 'sie', 'es', 'sie']] },
          { t: 'p', text: '初めて話題にするものには**不定冠詞**、既に出たもの・既知のもの・ひとつしかないものには**定冠詞**。' },
          { t: 'ex', de: 'Dort ist ein Tisch. Der Tisch ist praktisch. Er ist neu.', ja: 'あそこに机がある。その机は実用的だ。それは新しい。' },
          { t: 'note', text: '物でも性に応じて er / sie / es で受けます（der Tisch → er）。' },
        ],
      },
      {
        title: '格の働き',
        blocks: [
          { t: 'list', items: ['**1格（～が・は）**: 主語・述語', '**2格（～の）**: 修飾する名詞の後ろに置く', '**3格（～に）**: 間接目的語', '**4格（～を）**: 直接目的語'] },
          { t: 'note', text: '格が冠詞で示されるので語順は比較的自由です: **Dem Sohn** gibt **der Vater** **den Hut**.（息子に父は帽子をあげる）' },
        ],
      },
      {
        title: '定冠詞＋名詞',
        blocks: [
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'der Vater', 'die Mutter', 'das Kind', 'die Kinder'], ['2格', 'des Vaters', 'der Mutter', 'des Kind(e)s', 'der Kinder'], ['3格', 'dem Vater', 'der Mutter', 'dem Kind', 'den Kindern'], ['4格', 'den Vater', 'die Mutter', 'das Kind', 'die Kinder']] },
          { t: 'note', text: '男性・中性の2格は名詞にも **-(e)s**。複数3格は名詞に **-n**（-n, -s で終わる複数形は除く）。' },
        ],
      },
      {
        title: '不定冠詞＋名詞',
        blocks: [
          { t: 'table', head: ['', '男性', '女性', '中性'], rows: [['1格', 'ein Mann', 'eine Frau', 'ein Mädchen'], ['2格', 'eines Mann(e)s', 'einer Frau', 'eines Mädchens'], ['3格', 'einem Mann', 'einer Frau', 'einem Mädchen'], ['4格', 'einen Mann', 'eine Frau', 'ein Mädchen']] },
          { t: 'ex', de: 'Peter zeigt einer Frau den Brief.', ja: 'ペーターはある女性にその手紙を見せる。' },
          { t: 'ex', de: 'Ich nehme den Kuchen und einen Kaffee.', ja: 'そのケーキとコーヒーを1杯ください。' },
        ],
      },
      {
        title: '3格をとる動詞',
        blocks: [
          { t: 'p', text: '**schmecken, gehören, helfen, gefallen, danken** などは目的語が**3格**です。辞書では ～³ / jm と表記されます。' },
          { t: 'ex', de: 'Das Fahrrad gehört dem Mädchen.', ja: 'その自転車はその少女のものだ。' },
          { t: 'ex', de: 'Die Kinder helfen dem Vater.', ja: '子どもたちは父親を手伝う。' },
        ],
      },
      {
        title: '数詞 20〜100 ・ 値段',
        blocks: [
          { t: 'table', head: ['', ''], rows: [['20', 'zwanzig'], ['21', 'einundzwanzig'], ['30', 'dreißig'], ['40', 'vierzig'], ['50', 'fünfzig'], ['60', 'sechzig'], ['70', 'siebzig'], ['80', 'achtzig'], ['90', 'neunzig'], ['100', 'hundert']] },
          { t: 'note', text: '21 以上は「1の位 und 10の位」: 35 = fünfunddreißig。' },
          { t: 'ex', de: 'Was kostet der Kuchen? – Er kostet 4,35 Euro.', ja: 'このケーキはいくら？ ― 4ユーロ35セントです。' },
          { t: 'ex', de: 'Zahlen bitte! – Zusammen oder getrennt?', ja: 'お勘定お願いします。― ご一緒ですか、別々ですか？' },
        ],
      },
    ],
    quiz: [
      { id: '2A-1', type: 'choice', q: '「机」の性は？', options: ['der Tisch', 'die Tisch', 'das Tisch'], answer: 0 },
      { id: '2A-2', type: 'choice', q: '「時計」の性は？', options: ['der Uhr', 'die Uhr', 'das Uhr'], answer: 1 },
      { id: '2A-3', type: 'choice', q: '「少女」の性は？', options: ['der Mädchen', 'die Mädchen', 'das Mädchen'], answer: 2, explain: '-chen で終わる縮小名詞は中性です。' },
      { id: '2A-4', type: 'input', q: '定冠詞を入れよう（私はその男性にその写真を渡す）', de: 'Ich gebe ___ Mann das Foto.', answers: ['dem'] },
      { id: '2A-5', type: 'input', q: '定冠詞を入れよう（子どもたちに＝複数3格）', de: 'Ich gebe ___ Kindern das Buch.', answers: ['den'] },
      { id: '2A-6', type: 'input', q: '不定冠詞を入れよう（ボールペンを1本探しています）', de: 'Ich suche ___ Kugelschreiber.', answers: ['einen'] },
      { id: '2A-7', type: 'input', q: '2格（その男性の娘）', de: 'Dort ist die Tochter ___ Mannes.', answers: ['des'] },
      { id: '2A-8', type: 'choice', q: 'Die Tasche ist groß. の Die Tasche を代名詞にすると？', options: ['Er', 'Sie', 'Es'], answer: 1 },
      { id: '2A-9', type: 'choice', q: 'helfen の目的語は何格？', options: ['2格', '3格', '4格'], answer: 1 },
      { id: '2A-10', type: 'choice', q: '45 は？', options: ['vierzigfünf', 'fünfundvierzig', 'fünfvierzig', 'vierundfünfzig'], answer: 1 },
    ],
  },
  {
    id: '2B',
    title: '所有冠詞と否定冠詞',
    subtitle: 'Lektion 2B ・「私の」「君の」',
    goals: ['所有冠詞 mein, dein ... の形と格変化', '名詞の複数形', '否定冠詞 kein の使い方'],
    sections: [
      {
        title: '所有冠詞',
        blocks: [
          { t: 'table', head: ['人称', '単数', '複数'], rows: [['1人称', 'ich → mein', 'wir → unser'], ['2人称（親称）', 'du → dein', 'ihr → euer'], ['3人称', 'er → sein / sie → ihr / es → sein', 'sie → ihr'], ['2人称（敬称）', 'Sie → Ihr', 'Sie → Ihr']] },
          { t: 'p', text: '所有冠詞は**不定冠詞と同じ語尾**で格変化します（複数形もあります）。' },
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'mein Vater', 'meine Mutter', 'mein Kind', 'meine Kinder'], ['2格', 'meines Vaters', 'meiner Mutter', 'meines Kind(e)s', 'meiner Kinder'], ['3格', 'meinem Vater', 'meiner Mutter', 'meinem Kind', 'meinen Kindern'], ['4格', 'meinen Vater', 'meine Mutter', 'mein Kind', 'meine Kinder']] },
          { t: 'ex', de: 'Mein Vater ist Lehrer. Und meine Mutter ist Apothekerin.', ja: '父は教師で、母は薬剤師です。' },
          { t: 'ex', de: 'Die Kinder lieben ihre Großmutter.', ja: '子どもたちは祖母を愛している。' },
          { t: 'note', text: 'euer に語尾がつくと e が落ちることが多い: eure Eltern。複数4格の Eltern → **unsere** Eltern（期末テストで間違えやすいポイント）。' },
        ],
      },
      {
        title: '名詞の複数形',
        blocks: [
          { t: 'p', text: '複数形になると定冠詞は性に関係なく **die**。語尾がつくもの、ウムラウトするもの、変化しないものがあります。辞書では「Bruder 男 -s/Brüder」のように **2格/複数形** の順で載っています。' },
          { t: 'table', head: ['型', '単数', '複数'], rows: [['無語尾', 'der Lehrer', 'die Lehrer'], ['ウムラウトのみ', 'der Bruder', 'die Brüder'], ['-e', 'der Tag', 'die Tage'], ['-er（＋ウムラウト）', 'das Buch', 'die Bücher'], ['-(e)n', 'die Schwester', 'die Schwestern'], ['-s', 'das Auto', 'die Autos']] },
          { t: 'note', text: 'Eltern（両親）、Geschwister（兄弟姉妹）、Leute（人々）は複数形でのみ使います。' },
        ],
      },
      {
        title: '否定冠詞 kein',
        blocks: [
          { t: 'p', text: '**不定冠詞つきの名詞**や**無冠詞の名詞**を否定するときは nicht ではなく **kein** を使います。変化は不定冠詞と同じ（複数形あり）。' },
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'kein Computer', 'keine Uhr', 'kein Buch', 'keine Bücher'], ['3格', 'keinem Computer', 'keiner Uhr', 'keinem Buch', 'keinen Büchern'], ['4格', 'keinen Computer', 'keine Uhr', 'kein Buch', 'keine Bücher']] },
          { t: 'ex', de: 'Hast du einen Computer? – Nein, ich habe keinen Computer.', ja: 'パソコン持ってる？ ― ううん、持ってない。' },
          { t: 'ex', de: 'Ich habe einen Bruder, aber keine Schwester.', ja: '兄弟はいるけど姉妹はいない。' },
        ],
      },
      {
        title: '職業名の男性形・女性形 / 名詞の性の見分け方',
        blocks: [
          { t: 'p', text: '男性形に **-in** をつけると女性形（複数 -innen）。ウムラウトするものもある: Arzt → Ärztin。' },
          { t: 'list', items: ['男性: -ling, 職業の -er（der Schmetterling, der Maler）', '女性: -heit, -keit, -ung, -in（die Schönheit, die Hoffnung, die Lehrerin）', '中性: -chen, -lein（das Mädchen, das Büchlein）'] },
        ],
      },
    ],
    quiz: [
      { id: '2B-1', type: 'input', q: '所有冠詞（ローベルト、君のお兄さんの名前は？）', de: 'Robert, wie heißt ___ Bruder?', answers: ['dein'] },
      { id: '2B-2', type: 'input', q: '所有冠詞（あなたのご両親はどこに？ Eltern は複数）', de: 'Wo wohnen ___ Eltern?', answers: ['Ihre'] },
      { id: '2B-3', type: 'input', q: '所有冠詞（10月に私たちは両親を訪ねる）', de: 'Im Oktober besuchen wir ___ Eltern.', answers: ['unsere', 'unsre'], explain: '複数4格なので unsere。unseren は複数3格の形です。' },
      { id: '2B-4', type: 'input', q: '所有冠詞（私は自分の息子に写真を見せる）', de: 'Ich zeige ___ Sohn ein Foto.', answers: ['meinem'] },
      { id: '2B-5', type: 'input', q: '否定冠詞（喉は渇いてない）', de: 'Nein, ich habe ___ Durst.', answers: ['keinen'] },
      { id: '2B-6', type: 'input', q: '否定冠詞（時間がない）', de: 'Ich habe heute ___ Zeit.', answers: ['keine'] },
      { id: '2B-7', type: 'choice', q: 'das Buch の複数形は？', options: ['die Buchs', 'die Bücher', 'die Buchen', 'die Büche'], answer: 1 },
      { id: '2B-8', type: 'choice', q: 'Arzt の女性形は？', options: ['Arztin', 'Ärztin', 'Ärzterin', 'Arztinnen'], answer: 1 },
      { id: '2B-9', type: 'choice', q: '「彼女の子どもはサッカーが上手だ」の空欄は？', de: '___ Kind spielt sehr gut Fußball.', options: ['Sein', 'Ihr', 'Ihre', 'Seine'], answer: 1 },
    ],
  },
  {
    id: '3A',
    title: '不規則な現在人称変化と命令形',
    subtitle: 'Lektion 3A ・ 動詞の現在人称変化 (2)',
    goals: ['du / er で語幹の母音が変わる動詞', 'werden, nehmen, wissen', '命令・依頼の表現', '時刻の言い方'],
    sections: [
      {
        title: '語幹の母音が変わる動詞',
        blocks: [
          { t: 'p', text: '主語が **du** と **er / sie / es** のときだけ語幹の母音が変わる動詞があります。' },
          { t: 'table', head: ['主語', 'a → ä  fahren', 'e → i  sprechen', 'e → ie  lesen'], rows: conj(['fahre', 'fährst', 'fährt', 'fahren', 'fahrt', 'fahren'], ['spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht', 'sprechen'], ['lese', 'liest', 'liest', 'lesen', 'lest', 'lesen']) },
          { t: 'list', items: ['a → ä: fahren, tragen, laufen (au → äu), schlafen', 'e → i: sprechen, geben, helfen, treffen, essen (du isst)', 'e → ie: lesen, sehen'] },
          { t: 'ex', de: 'Erik trägt eine Brille und liest oft Zeitung.', ja: 'エーリクは眼鏡をかけていて、よく新聞を読む。' },
        ],
      },
      {
        title: 'werden / nehmen / wissen',
        blocks: [
          { t: 'table', head: ['主語', 'werden（～になる）', 'nehmen（取る）', 'wissen（知っている）'], rows: conj(['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'], ['nehme', 'nimmst', 'nimmt', 'nehmen', 'nehmt', 'nehmen'], ['weiß', 'weißt', 'weiß', 'wissen', 'wisst', 'wissen']) },
          { t: 'ex', de: 'Mein Großvater wird bald 88 Jahre alt.', ja: '祖父はもうすぐ88歳になる。' },
          { t: 'ex', de: 'Klaus nimmt den Zug um 18.31 Uhr.', ja: 'クラウスは18時31分の列車に乗る。' },
        ],
      },
      {
        title: '命令・依頼の表現',
        blocks: [
          { t: 'table', head: ['不定詞', 'du に', 'ihr に', 'Sie に'], rows: [['kommen', 'Komm(e)!', 'Kommt!', 'Kommen Sie!'], ['warten', 'Warte!', 'Wartet!', 'Warten Sie!'], ['fahren', 'Fahr(e)!', 'Fahrt!', 'Fahren Sie!'], ['sprechen', 'Sprich!', 'Sprecht!', 'Sprechen Sie!'], ['lesen', 'Lies!', 'Lest!', 'Lesen Sie!'], ['sein', 'Sei …!', 'Seid …!', 'Seien Sie …!']] },
          { t: 'note', text: 'e → i / ie 型の動詞は du への命令でも母音が変わる（Sprich! Lies!）。a → ä 型は変わらない（Fahr!）。Sie への命令では Sie を省略しません。' },
          { t: 'ex', de: 'Sprecht hier bitte leise, Kinder!', ja: '子どもたち、ここでは静かに話しなさい！' },
          { t: 'ex', de: 'Seien Sie bitte vorsichtig!', ja: 'どうぞお気をつけください！' },
        ],
      },
      {
        title: '疑問文への答え方 ja / nein / doch',
        blocks: [
          { t: 'p', text: '**否定疑問文**に「いいえ、～です」と肯定で答えるときは **doch**。' },
          { t: 'ex', de: 'Hast du heute keine Zeit? – Doch, ich habe heute Zeit.', ja: '今日時間ないの？ ― ううん、あるよ。' },
          { t: 'ex', de: 'Kennst du Peter nicht? – Doch, ich kenne ihn.', ja: 'ペーターを知らないの？ ― いや、知ってるよ。' },
        ],
      },
      {
        title: '時刻の表現',
        blocks: [
          { t: 'table', head: ['時刻', '12時間制', '24時間制'], rows: [['19.00', 'sieben', 'neunzehn Uhr'], ['19.10', 'zehn nach sieben', 'neunzehn Uhr zehn'], ['19.15', 'Viertel nach sieben', 'neunzehn Uhr fünfzehn'], ['19.30', 'halb acht', 'neunzehn Uhr dreißig'], ['19.45', 'Viertel vor acht', 'neunzehn Uhr fünfundvierzig']] },
          { t: 'note', text: '**halb acht は7時半**（8時に向かって半分）。um ～ =「～時に」、gegen ～ =「～時頃に」。' },
          { t: 'ex', de: 'Wie spät ist es? – Es ist halb acht.', ja: '何時？ ― 7時半です。' },
        ],
      },
    ],
    quiz: [
      { id: '3A-1', type: 'input', q: '(fahren)', de: '___ du morgen nach Tübingen?', answers: ['Fährst', 'fährst'] },
      { id: '3A-2', type: 'input', q: '(helfen)', de: 'Das Kind ___ seiner Mutter oft.', answers: ['hilft'] },
      { id: '3A-3', type: 'input', q: '(geben)', de: 'Peter ___ dem kleinen Mädchen ein Buch.', answers: ['gibt'], explain: 'geben は e→i 型: du gibst, er gibt。' },
      { id: '3A-4', type: 'input', q: '(sehen)', de: '___ du den Bus dort?', answers: ['Siehst', 'siehst'] },
      { id: '3A-5', type: 'input', q: '(essen)', de: 'Was ___ du gern?', answers: ['isst'] },
      { id: '3A-6', type: 'input', q: '(wissen)', de: '___ du das nicht?', answers: ['Weißt', 'weißt', 'weisst'] },
      { id: '3A-7', type: 'input', q: '命令形 du (lesen)', de: '___ nicht im Dunkeln!', answers: ['Lies'] },
      { id: '3A-8', type: 'input', q: '命令形 Sie (sprechen)', de: '___ Sie bitte langsam!', answers: ['Sprechen'] },
      { id: '3A-9', type: 'choice', q: 'Kommst du morgen nicht? に「いや、行くよ」と答えるには？', options: ['Ja, ich komme morgen.', 'Doch, ich komme morgen.', 'Nein, ich komme morgen.', 'Nicht, ich komme morgen.'], answer: 1 },
      { id: '3A-10', type: 'choice', q: '„halb acht“ は何時？', options: ['8時半', '7時半', '8時15分', '7時45分'], answer: 1 },
      { id: '3A-11', type: 'choice', q: '彼は毎日7時半頃に帰宅する: Er kommt jeden Tag ___ halb acht nach Hause.', options: ['um', 'gegen', 'vor', 'nach'], answer: 1, explain: 'gegen = 「～頃に」。um は「ちょうど～時に」。' },
    ],
  },
  {
    id: '3B',
    title: '定冠詞類と人称代名詞',
    subtitle: 'Lektion 3B ・「この」「どの」と ihm / ihn',
    goals: ['dieser, welcher, jeder などの格変化', '人称代名詞の3格・4格', 'wer / was の格変化と疑問詞'],
    sections: [
      {
        title: '定冠詞類',
        blocks: [
          { t: 'p', text: '**dieser**（この）, **jener**（あの）, **jeder**（どの～も、単数のみ）, **welcher**（どの）, **solcher**（そのような）, **aller**（すべての）は定冠詞とほぼ同じ語尾で変化します。中性1・4格だけ **-es**。' },
          { t: 'table', head: ['', '男性', '女性', '中性', '複数'], rows: [['1格', 'dieser Brief', 'diese Uhr', 'dieses Heft', 'diese Bücher'], ['2格', 'dieses Brief(e)s', 'dieser Uhr', 'dieses Heft(e)s', 'dieser Bücher'], ['3格', 'diesem Brief', 'dieser Uhr', 'diesem Heft', 'diesen Büchern'], ['4格', 'diesen Brief', 'diese Uhr', 'dieses Heft', 'diese Bücher']] },
          { t: 'ex', de: 'Welchen Mantel kaufst du? – Ich kaufe diesen Mantel.', ja: 'どのコートを買うの？ ― このコートにするよ。' },
          { t: 'ex', de: 'Welche Stadt empfiehlst du uns?', ja: '君は私たちにどの都市を勧める？' },
          { t: 'note', text: '2B の所有冠詞・否定冠詞は不定冠詞と同じ変化なので**不定冠詞類**と呼びます。' },
        ],
      },
      {
        title: '人称代名詞の格変化',
        blocks: [
          { t: 'table', head: ['1格', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'Sie'], rows: [['3格', 'mir', 'dir', 'ihm', 'ihr', 'ihm', 'uns', 'euch', 'ihnen', 'Ihnen'], ['4格', 'mich', 'dich', 'ihn', 'sie', 'es', 'uns', 'euch', 'sie', 'Sie']] },
          { t: 'ex', de: 'Das Auto gehört mir. Ich leihe es euch.', ja: 'その車は僕のだ。君たちに貸してあげるよ。' },
          { t: 'ex', de: 'Kennen Sie den Studenten dort? – Nein, ich kenne ihn nicht.', ja: 'あそこの学生をご存じですか？ ― いいえ。' },
          { t: 'note', text: 'Student は**男性弱変化名詞**: 単数1格以外すべて -en（den Studenten, dem Studenten）。Herr, Mensch, Name なども仲間。' },
        ],
      },
      {
        title: '3格と4格の語順',
        blocks: [
          { t: 'list', items: ['どちらも名詞 → **3格 → 4格**: Er schenkt seiner Mutter einen Schal.', 'どちらも代名詞 → **4格 → 3格**: Er schenkt ihn ihr.', '一方が代名詞 → **代名詞が先**: Er schenkt ihr einen Schal. / Er schenkt ihn seiner Mutter.'] },
        ],
      },
      {
        title: 'wer と was ・ いろいろな疑問詞',
        blocks: [
          { t: 'table', head: ['', 'wer（誰）', 'was（何）'], rows: [['1格', 'wer', 'was'], ['2格', 'wessen', '—'], ['3格', 'wem', '—'], ['4格', 'wen', 'was']] },
          { t: 'ex', de: 'Wem gehört der Schlüssel?', ja: 'この鍵は誰の？' },
          { t: 'ex', de: 'Wen liebt Claudia?', ja: 'クラウディアは誰を愛しているの？' },
          { t: 'table', head: ['疑問詞', '意味'], rows: [['wo / woher / wohin', 'どこで / どこから / どこへ'], ['wann', 'いつ'], ['wie', 'どのように'], ['wie viele', 'いくつの'], ['warum', 'なぜ'], ['welcher', 'どの']] },
          { t: 'ex', de: 'Wie heißt „Rotkäppchen“ auf Japanisch?', ja: '„Rotkäppchen“ は日本語で何と言う？' },
        ],
      },
    ],
    quiz: [
      { id: '3B-1', type: 'input', q: '語尾を補おう（どのジャケットが気に入った？ e Jacke）', de: 'Welch___ Jacke gefällt dir?', answers: ['e'], hint: '語尾だけ入力' },
      { id: '3B-2', type: 'input', q: '語尾を補おう（このセーター r Pullover, 1格）', de: 'Dies___ Pullover gefällt mir.', answers: ['er'], hint: '語尾だけ入力' },
      { id: '3B-3', type: 'input', q: '語尾を補おう（どの生徒も英語を学んでいる）', de: 'Jed___ Schüler lernt Englisch.', answers: ['er'], hint: '語尾だけ入力' },
      { id: '3B-4', type: 'input', q: '「君たちに」ライプツィヒを推薦する', de: 'Ich empfehle ___ Leipzig.', answers: ['euch'] },
      { id: '3B-5', type: 'input', q: '「彼を」知っている', de: 'Doch, ich kenne ___.', answers: ['ihn'] },
      { id: '3B-6', type: 'input', q: '「誰の」もの？（3格）', de: '___ gehört der Koffer?', answers: ['Wem'] },
      { id: '3B-7', type: 'input', q: 'ご機嫌いかがですか？（敬称）', de: 'Wie geht es ___?', answers: ['Ihnen'] },
      { id: '3B-8', type: 'input', q: 'その子どもたちはそのおもちゃが気に入っている？', de: 'Gefällt das Spielzeug den ___?', answers: ['Kindern'], explain: '複数3格は名詞に -n: den Kindern。' },
      { id: '3B-9', type: 'choice', q: '彼らはその男子学生を探している。', options: ['Sie suchen den Student.', 'Sie suchen den Studenten.', 'Ihr sucht den Studenten.', 'Sie sucht den Student.'], answer: 1, explain: '「彼らは」= sie (動詞 -en)。Student は男性弱変化名詞なので4格は den Studenten。' },
      { id: '3B-10', type: 'order', q: '彼はそれ（スカーフ）を彼女に贈る。', words: ['Er', 'schenkt', 'ihn', 'ihr', '.'], explain: '代名詞どうしは 4格→3格。' },
    ],
  },
  {
    id: '4A',
    title: '前置詞の格支配',
    subtitle: 'Lektion 4A ・ 前置詞を用いた表現',
    goals: ['3格支配・4格支配・3/4格支配の前置詞', '「場所(3格)」と「方向(4格)」の使い分け', '前置詞と定冠詞の融合形'],
    sections: [
      {
        title: '3格支配の前置詞',
        blocks: [
          { t: 'p', text: '**aus, bei, mit, nach, seit, von, zu** の後ろは必ず3格。' },
          { t: 'table', head: ['前置詞', '意味', '例'], rows: [['aus', '～(の中)から、～出身', 'Thomas kommt aus München.'], ['bei', '～のところで', 'bei Frau Berg'], ['mit', '～と一緒に、～で(手段)', 'mit dem Bus'], ['nach', '～の後で、～へ(地名)', 'nach dem Essen / nach Deutschland'], ['seit', '～以来', 'seit einem Jahr'], ['von', '～から、～の', 'von Berlin nach Leipzig'], ['zu', '～(のところ)へ', 'zu dir / zum Bahnhof']] },
          { t: 'note', text: '**aus と von の違い**: aus は「中から・出身」、von は「人や出発点から」。「先生から鞄をもらう」は **von** der Lehrerin。' },
        ],
      },
      {
        title: '4格支配の前置詞',
        blocks: [
          { t: 'p', text: '**durch, für, gegen, ohne, um** の後ろは必ず4格。' },
          { t: 'ex', de: 'Wir gehen durch den Wald.', ja: '私たちは森を通って行く。' },
          { t: 'ex', de: 'Er lernt für die Prüfung.', ja: '彼は試験のために勉強する。' },
          { t: 'ex', de: 'Ich arbeite ohne Pause.', ja: '私は休憩なしで働く。' },
        ],
      },
      {
        title: '3・4格支配の前置詞',
        blocks: [
          { t: 'p', text: '**an, auf, hinter, in, neben, über, unter, vor, zwischen** は、**場所（wo?）なら3格**、**移動の方向（wohin?）なら4格**。' },
          { t: 'table', head: ['', '場所（3格）', '方向（4格）'], rows: [['in', 'Die Kinder sind in der Schule.', 'Die Kinder gehen in die Schule.'], ['an', 'Das Bild hängt an der Wand.', 'Ich hänge das Bild an die Wand.'], ['auf', 'Der Brief liegt auf dem Tisch.', 'Midori legt den Brief auf den Tisch.']] },
          { t: 'note', text: '状態の動詞 stehen / liegen / hängen(掛かっている) は3格、動作の動詞 stellen / legen / hängen(掛ける) は4格と組むのが基本。' },
        ],
      },
      {
        title: '融合形',
        blocks: [
          { t: 'table', head: ['', '', '', ''], rows: [['an dem → am', 'an das → ans', 'in dem → im', 'in das → ins'], ['zu dem → zum', 'zu der → zur', 'von dem → vom', 'bei dem → beim'], ['auf das → aufs', '', '', '']] },
          { t: 'ex', de: 'Heute gehe ich ins Kino.', ja: '今日は映画に行く。' },
          { t: 'ex', de: 'Erik schwimmt im Fluss.', ja: 'エーリクは川で泳いでいる。' },
        ],
      },
      {
        title: '曜日・月・季節と熟語',
        blocks: [
          { t: 'list', items: ['曜日に: **am** Montag', '月に: **im** August', '季節に: **im** Herbst'] },
          { t: 'list', items: ['für ～⁴ danken: ～を感謝する', 'an ～⁴ denken: ～のことを考える', 'auf ～⁴ warten: ～を待つ', 'mit ～³ zufrieden sein: ～に満足している'] },
          { t: 'ex', de: 'Tomoko wartet auf ihre Söhne.', ja: 'トモコは息子たちを待っている。' },
        ],
      },
    ],
    quiz: [
      { id: '4A-1', type: 'input', q: '前置詞（私たちはバスで行く）', de: 'Wir fahren ___ dem Bus.', answers: ['mit'] },
      { id: '4A-2', type: 'input', q: '前置詞（ニーナはその女性教師から鞄をもらう）', de: 'Nina bekommt ___ der Lehrerin eine Tasche.', answers: ['von'], explain: '人から何かをもらう → von。aus は「中から・出身」。' },
      { id: '4A-3', type: 'input', q: '前置詞（私たちはその旅行について話している）', de: 'Wir sprechen ___ die Reise.', answers: ['über'] },
      { id: '4A-4', type: 'input', q: '前置詞（夕食の後、君のところへ行く）', de: 'Nach dem Abendessen komme ich ___ dir.', answers: ['zu'] },
      { id: '4A-5', type: 'input', q: '前置詞＋冠詞（ミドリは手紙を机の上に置く）', de: 'Midori legt den Brief ___ den Tisch.', answers: ['auf'] },
      { id: '4A-6', type: 'input', q: '融合形（エーリクは川で泳いでいる r Fluss）', de: 'Erik schwimmt ___ Fluss.', answers: ['im'] },
      { id: '4A-7', type: 'input', q: '融合形（明日は大学へ行く e Uni）', de: 'Morgen fahre ich ___ Uni.', answers: ['zur'] },
      { id: '4A-8', type: 'choice', q: 'その絵は壁にかかっている: Das Bild hängt an ___ Wand.', options: ['die', 'der', 'den', 'dem'], answer: 1, explain: '場所を表すので3格（女性3格 der）。' },
      { id: '4A-9', type: 'choice', q: '子どもたちは学校へ行く: Die Kinder gehen in ___ Schule.', options: ['die', 'der', 'dem', 'den'], answer: 0, explain: '方向なので4格（女性4格 die）。' },
      { id: '4A-10', type: 'input', q: '前置詞（トモコは息子たちを待っている）', de: 'Tomoko wartet ___ ihre Söhne.', answers: ['auf'] },
      { id: '4A-11', type: 'choice', q: '「日曜日に」は？', options: ['im Sonntag', 'am Sonntag', 'um Sonntag', 'an Sonntag'], answer: 1 },
    ],
  },
  {
    id: '4B',
    title: '話法の助動詞と分離動詞',
    subtitle: 'Lektion 4B ・ 枠構造',
    goals: ['können, müssen など話法の助動詞の変化', '助動詞の文では不定詞が文末（枠構造）', '分離動詞の前つづりは文末'],
    sections: [
      {
        title: '話法の助動詞の現在人称変化',
        blocks: [
          { t: 'table', head: ['主語', 'können', 'müssen', 'sollen', 'wollen', 'dürfen', 'möchte'], rows: conj(['kann', 'kannst', 'kann', 'können', 'könnt', 'können'], ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'], ['soll', 'sollst', 'soll', 'sollen', 'sollt', 'sollen'], ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'], ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'], ['möchte', 'möchtest', 'möchte', 'möchten', 'möchtet', 'möchten']) },
          { t: 'note', text: 'ich と er/sie/es が同じ形で、語尾がつきません（möchte 以外）。' },
          { t: 'table', head: ['助動詞', '意味'], rows: [['können', '～できる（能力・可能性）'], ['müssen', '～しなければならない'], ['sollen', '～すべきだ ／ ～しましょうか（Soll ich …?）'], ['wollen', '～するつもりだ ／ ～しない？（Wollen wir …?）'], ['dürfen', '～してもよい ／ nicht dürfen: ～してはいけない'], ['möchte', '～したいのですが（丁寧な願望）']] },
        ],
      },
      {
        title: '枠構造',
        blocks: [
          { t: 'p', text: '話法の助動詞が**定動詞（2番目）**になり、本動詞は**不定詞のまま文末**に置かれます。この「枠」の間に他の要素が入ります。' },
          { t: 'ex', de: 'Ich muss jetzt zum Bahnhof gehen.', ja: '私は今、駅に行かなければならない。' },
          { t: 'ex', de: 'Taro kann zum Bahnhof kommen.', ja: 'タロウは駅に来ることができる。' },
          { t: 'ex', de: 'Man darf in seiner Wohnung nicht rauchen.', ja: '彼の住まいでは喫煙してはいけない。' },
          { t: 'ex', de: 'Soll ich das Fenster schließen?', ja: '窓を閉めましょうか？' },
          { t: 'note', text: 'よくある間違い: × Taro kann kommen zum Bahnhof. → 不定詞 kommen は**必ず最後**。' },
        ],
      },
      {
        title: '分離動詞',
        blocks: [
          { t: 'p', text: '本体の動詞にアクセントのある**前つづり**がついた動詞。定動詞になると前つづりが分離して**文末**へ。辞書では an|rufen のように表示されます。' },
          { t: 'ex', de: 'Ich rufe dich heute Abend an.', ja: '今晩君に電話するね。' },
          { t: 'ex', de: 'Ich stehe jeden Tag um sieben Uhr auf.', ja: '私は毎日7時に起きる。' },
          { t: 'ex', de: 'Wann fängt das Fest an?', ja: 'お祭りはいつ始まるの？' },
          { t: 'p', text: '助動詞と一緒に使うと、分離動詞は**1語の不定詞**のまま文末: Ich möchte dir meinen Freund **vorstellen**.' },
          { t: 'ex', de: 'Max muss an dem Sprachkurs teilnehmen.', ja: 'マックスはその語学コースに参加しなければならない。' },
          { t: 'list', items: ['ab|fahren 出発する', 'an|fangen 始まる', 'an|kommen 到着する', 'auf|stehen 起きる', 'fern|sehen テレビを見る', 'mit|kommen 一緒に来る', 'statt|finden 開催される', 'teil|nehmen 参加する', 'vor|haben 予定している'] },
        ],
      },
    ],
    quiz: [
      { id: '4B-1', type: 'order', q: 'タロウは駅へ来ることができる。', words: ['Taro', 'kann', 'zum', 'Bahnhof', 'kommen', '.'] },
      { id: '4B-2', type: 'order', q: '彼の住まいではたばこを吸ってはいけない。', words: ['Man', 'darf', 'in', 'seiner', 'Wohnung', 'nicht', 'rauchen', '.'] },
      { id: '4B-3', type: 'order', q: '窓を閉めましょうか？', words: ['Soll', 'ich', 'das', 'Fenster', 'schließen', '?'] },
      { id: '4B-4', type: 'order', q: '月曜日、私は7時に起きる。', words: ['Am', 'Montag', 'stehe', 'ich', 'um', '7', 'Uhr', 'auf', '.'] },
      { id: '4B-5', type: 'order', q: 'マックスはその語学コースに参加しなくてはならない。', words: ['Max', 'muss', 'an', 'dem', 'Sprachkurs', 'teilnehmen', '.'], answers: [['Max', 'muss', 'an', 'dem', 'Sprachkurs', 'teilnehmen', '.']] },
      { id: '4B-6', type: 'input', q: '(können)', de: '___ du morgen zu mir kommen?', answers: ['Kannst', 'kannst'] },
      { id: '4B-7', type: 'input', q: '(wollen)', de: 'Im August ___ ich nach Wien fahren.', answers: ['will'] },
      { id: '4B-8', type: 'input', q: '(anfangen) 現在形', de: 'Wann ___ das Fest ___?', answers: ['fängt an', 'fängt…an', 'fängt ... an'], hint: '2つの空欄をスペースで区切って入力（例: fängt an）' },
      { id: '4B-9', type: 'choice', q: '「ここに駐車してもいいですか？」', options: ['Muss ich hier parken?', 'Darf ich hier parken?', 'Soll ich hier parken?', 'Will ich hier parken?'], answer: 1 },
      { id: '4B-10', type: 'choice', q: 'Hast du am Wochenende schon etwas vor? の意味は？', options: ['週末に何か持っている？', '週末にもう何か予定ある？', '週末の前に何かした？', '週末は何が好き？'], answer: 1 },
    ],
  },
];
