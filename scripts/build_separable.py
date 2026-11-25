#!/usr/bin/env python3
"""分離動詞の一覧に足す語 -> src/data/separable_extra.json
辞書 (lexicon.json) の分離動詞のうち、よく使う語 (頻度順位 MAXR 以内) で日本語訳のあるもの。
src/data/separable.ts に手で書いた語はそちらを優先する (ここでは除く)。
出力: [[分離動詞, 前つづり, 本体, 日本語, 頻度順位, 3単現 (fängt … an), 過去分詞, 本体の日本語], ...]
Usage: build_separable.py <lexicon.json> <separable.ts> <out.json>
"""
import sys, json, re
lexp, tsp, out = sys.argv[1:4]
MAXR = 15000
MUST = {'abwaschen', 'anmelden', 'ausfüllen', 'herunterladen', 'hochladen', 'umsteigen', 'abmelden', 'umtauschen'}
# 映画字幕の頻度なので、学習向きでない語 (物騒・俗語・まれな意味) は外す
DROP = set('umbringen angreifen einsperren festnehmen abfeuern hinrichten abschießen rummachen aufreißen ausflippen durchdrehen auslöschen aufspüren anklagen einbrechen eindringen vorsprechen vorsingen vorspielen auferstehen untertauchen aufschneiden ablassen ansetzen anstoßen vortäuschen zuschlagen absetzen abfangen ausnutzen rausschmeißen einmischen vorenthalten anführen hochgehen davonkommen einfangen anhängen einlassen anvertrauen abhören abtreten durchdringen loswerden auftreten antreten eintreten aufklären aufbringen einlegen aufziehen vorgehen nachsehen aufstellen abhängen einnehmen anlegen ausrichten ausstehen zurückziehen fortfahren aussetzen'.split())
FIX = {
    'aufhalten': '引き止める、足止めする', 'weitermachen': '続ける', 'festhalten': 'しっかりつかむ', 'anschauen': '（じっと）見る',
    'einfallen': '思いつく、思い出す', 'mitteilen': '知らせる、伝える', 'ausschalten': '（スイッチを）切る', 'angehen': '（電気が）つく、関係する',
    'zurücklassen': '残していく、置いていく', 'aussprechen': '発音する、言い表す', 'abschließen': '鍵をかける、終える', 'ablegen': '（服を）脱ぐ、（試験を）受ける',
    'anzeigen': '表示する、届け出る', 'anschließen': 'つなぐ、接続する', 'aufbrechen': '出発する、こじ開ける', 'aufregen': '（sich）興奮する、腹を立てる',
    'abziehen': '引き抜く、差し引く', 'mitbekommen': '気づく、耳にする', 'aufheben': '拾い上げる、取っておく', 'umkehren': '引き返す、逆にする',
    'einrichten': '（部屋を）しつらえる、設置する', 'einschalten': '（スイッチを）入れる', 'zurückhalten': '引き止める、控える', 'durchkommen': '通り抜ける、（試験に）受かる',
    'fortsetzen': '続ける', 'eintreffen': '到着する', 'darstellen': '表す、描く', 'einschlagen': '打ち込む、（道を）とる', 'klarkommen': 'うまくやっていく',
    'einholen': '追いつく、（情報を）集める', 'eingreifen': '介入する', 'einsehen': '理解する、認める', 'einhalten': '（約束などを）守る', 'abreißen': '取り壊す、ちぎる',
    'aufwärmen': '温め直す、ウォーミングアップする', 'abstimmen': '投票する、調整する', 'vormachen': 'やって見せる、ごまかす', 'auskommen': '（mit）やっていく、足りる',
    'andeuten': 'ほのめかす', 'aufsteigen': '登る、昇進する', 'abheben': '（お金を）引き出す、離陸する', 'ablaufen': '（期限が）切れる、進行する', 'fortgehen': '立ち去る',
    'auswählen': '選ぶ', 'aufladen': '充電する、積む', 'vorziehen': '（〜より）好む、前に出す', 'zurücknehmen': '取り消す、引き取る', 'unterbringen': '泊める、収容する',
    'abliefern': '引き渡す、届ける', 'zusammenkommen': '集まる', 'abschlagen': '断る、切り落とす', 'aufführen': '上演する', 'anbringen': '取り付ける',
    'festlegen': '決める、定める', 'eingeben': '入力する', 'großziehen': '育てる', 'zulegen': '（体重などが）増える、手に入れる', 'durchsetzen': '押し通す、実現させる',
    'abwenden': '防ぐ、（顔を）そむける', 'einführen': '導入する、輸入する', 'aufessen': '残さず食べる', 'zusammenbrechen': '崩壊する、倒れる', 'einfrieren': '凍らせる、冷凍する',
    'hochladen': 'アップロードする', 'abmelden': 'ログアウトする、（転出の）届けを出す', 'anmelden': '登録する、申し込む', 'zusammenleben': '一緒に暮らす',
    'aufgehen': '（太陽が）昇る、開く', 'umfallen': '倒れる', 'abbrechen': '中断する、折る', 'abschalten': '（スイッチを）切る、休む', 'einatmen': '息を吸う',
    'zurückzahlen': '返済する', 'wiedergutmachen': '埋め合わせる、償う', 'anhaben': '着ている', 'zustimmen': '賛成する', 'durchführen': '実行する',
    'wegnehmen': '取り上げる', 'umdrehen': '裏返す、（sich）振り返る', 'reingehen': '中に入る', 'anstellen': '雇う、（列に）並ぶ', 'abhalten': '妨げる、（会を）開く',
    'einsetzen': '使う、投入する', 'aufbauen': '組み立てる、築く', 'zurückziehen': '引っ込める', 'abwarten': '（結果を）待つ', 'umtauschen': '交換する、両替する',
    'ausdrücken': '表現する、絞る', 'ablenken': '気をそらす', 'feststellen': '確認する、気づく', 'aushalten': '耐える、我慢する', 'auslösen': '引き起こす',
    'auslassen': '抜かす、省く', 'einreichen': '提出する', 'hinstellen': '置く', 'ausüben': '（職業などを）営む、行使する', 'beitragen': '貢献する',
    'anerkennen': '認める', 'abschneiden': '切り取る', 'ausreichen': '足りる', 'nachgeben': '譲歩する、たわむ', 'anpassen': '合わせる、適応させる',
}
lex = json.load(open(lexp, encoding='utf-8'))
src = open(tsp, encoding='utf-8').read()
cur = set()
for m in re.finditer(r"\{ base: '(\w+)'.*?items: \[(.*?)\] \}", src):
    for p in re.findall(r"\['(\w+)'", m.group(2)): cur.add(p + m.group(1))
bases = {}
for e in sorted(lex, key=lambda e: -e['r']):
    if e['p'] == 'verb': bases[e['w']] = '、'.join(re.split(r'[、,]\s*', e.get('ja') or '')[:2])
res = []
seen = set()
for e in sorted(lex, key=lambda e: e['r']):
    if e['p'] != 'verb' or not e.get('v') or e['w'] in seen: continue
    pr = (e['v'].get('pr') or [None] * 3)[2]
    if not pr or ' ' not in pr: continue
    part = pr.split(' ')[1]
    w = e['w']
    if not w.startswith(part) or w in cur: continue
    base = w[len(part):]
    if w in DROP or base not in bases or not (e.get('ja') or w in FIX) or not e['v'].get('pp'): continue
    if e['r'] > MAXR and w not in MUST: continue
    ja = FIX.get(w) or '、'.join(re.split(r'[、,]\s*', e['ja'])[:2])
    seen.add(w)
    res.append([w, part, base, ja, e['r'], pr.replace(' ', ' … '), e['v']['pp'], bases[base]])
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('extra', len(res), 'curated', len(cur))
