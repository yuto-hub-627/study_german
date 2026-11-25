#!/usr/bin/env python3
"""単語の語源・成り立ち・関連語 -> public/dict/info/<頭文字>.json

Inputs: kaikki German (en.wiktionary) の生データ de_raw.jsonl と lexicon.json
Usage: build_info.py <de_raw.jsonl> <lexicon.json> <out_dir>
各単語 "品詞:見出し語" -> {
  pt: 成り立ち [[部品, 英語の意味?], ...]   (Bahnhof = Bahn + Hof, verstehen = ver- + stehen)
  o:  由来 [[言語コード, 語, i(受け継いだ)/b(借用)/d(由来)], ...]
  en: 同じ語源の英単語 [...]
  sy: 類義語, an: 反義語, dv: この語からできた語 (辞書にあるものだけ)
  tx: Wiktionary の語源の原文 (英語)
}
License: Wiktionary CC BY-SA 4.0
"""
import sys, os, re, json, collections
raw, lexp, outd = sys.argv[1:4]
lex = json.load(open(lexp, encoding='utf-8'))
POSMAP = {'article': 'det', 'postp': 'prep', 'particle': 'adv', 'name': 'noun'}
have = {(e['p'], e['w']) for e in lex}
rank = {}
for e in lex:
    if e['p'] != 'phrase': rank[e['w']] = min(rank.get(e['w'], 10**9), e['r'])

def fold(s):
    s = s.lower().replace('ä', 'a').replace('ö', 'o').replace('ü', 'u').replace('ß', 'ss')
    s = s.replace('ae', 'a').replace('oe', 'o').replace('ue', 'u')
    return re.sub(r'[^a-z]', '', s)

def clean(w):
    w = re.sub(r'<[^>]*>', '', w or '').strip()
    return w.split(',')[0].strip()

PART_T = {'compound', 'com', 'af', 'affix', 'prefix', 'pre', 'suffix', 'suf', 'confix', 'con', 'surf', 'blend'}
ORIG_T = {'inh': 'i', 'inh+': 'i', 'inherited': 'i', 'bor': 'b', 'bor+': 'b', 'borrowed': 'b', 'lbor': 'b', 'slbor': 'b', 'der': 'd', 'der+': 'd', 'derived': 'd', 'clq': 'b', 'calque': 'b'}

def parts_of(t):
    n, a = t['name'], t.get('args', {})
    if a.get('1') != 'de': return None
    pos = []
    i = 2
    while str(i) in a and i < 9:
        pos.append((clean(a[str(i)]), a.get('t' + str(i - 1)) or a.get('gloss' + str(i - 1)) or ''))
        i += 1
    pos = [p for p in pos if p[0]]
    if n in ('prefix', 'pre') and len(pos) >= 2:
        pos[0] = (pos[0][0].rstrip('-') + '-', pos[0][1])
    if n in ('suffix', 'suf') and len(pos) >= 2:
        pos[-1] = ('-' + pos[-1][0].lstrip('-'), pos[-1][1])
    if n in ('confix', 'con') and len(pos) >= 2:
        pos[0] = (pos[0][0].rstrip('-') + '-', pos[0][1]); pos[-1] = ('-' + pos[-1][0].lstrip('-'), pos[-1][1])
    return pos if len(pos) >= 2 else None

def words(lst):
    out = []
    for x in lst or []:
        w = x.get('word')
        if w and w not in out: out.append(w)
    return out

info = {}
for line in open(raw, encoding='utf-8'):
    try: d = json.loads(line)
    except Exception: continue
    p = POSMAP.get(d.get('pos'), d.get('pos')); w = d.get('word')
    if (p, w) not in have or (p, w) in info: continue
    r = {}
    tpls = d.get('etymology_templates') or []
    for t in tpls:
        if t['name'] in PART_T:
            pt = parts_of(t)
            if pt:
                r['pt'] = [[a, b] if b else [a] for a, b in pt]; break
    o = []
    for t in tpls:
        k = ORIG_T.get(t['name']); a = t.get('args', {})
        if not k or a.get('1') != 'de': continue
        lang, word = a.get('2'), clean(a.get('3'))
        if lang and word and not any(x[0] == lang for x in o): o.append([lang, word, k])
    if o: r['o'] = o[:4]
    en = []
    for t in tpls:
        a = t.get('args', {})
        if t['name'] in ('cog', 'cognate', 'noncog') and a.get('1') == 'en':
            x = clean(a.get('2'))
            if x and not x.startswith('*') and x not in en: en.append(x)
    tx = d.get('etymology_text') or ''
    for m in re.finditer(r"(?:Cognate with|cognate with)[^.]*?\bEnglish ([A-Za-z'-]+)", tx):
        if m.group(1) not in en: en.append(m.group(1))
    # 「Compare (also) English X」は同じ語源ではない参考語なので外す
    cmp = set(re.findall(r"Compare (?:also )?English ([A-Za-z'-]+)", tx))
    en = [x for x in en if x not in cmp]
    if en: r['en'] = en[:3]
    syn = words(d.get('synonyms')); ant = words(d.get('antonyms'))
    for s in d.get('senses', []):
        syn += [x for x in words(s.get('synonyms')) if x not in syn]
        ant += [x for x in words(s.get('antonyms')) if x not in ant]
    syn = [x for x in syn if x in rank and x != w][:6]
    ant = [x for x in ant if x in rank and x != w][:6]
    if syn: r['sy'] = syn
    if ant: r['an'] = ant
    dv = sorted({x for x in words(d.get('derived')) if x in rank and x != w}, key=lambda x: rank[x])[:10]
    if dv: r['dv'] = dv
    if tx.startswith('Etymology tree'):
        ls = tx.split('\n'); i = next((j for j, l in enumerate(ls) if l.strip() == f'German {w}'), -1)
        tx = '\n'.join(ls[i + 1:]) if i >= 0 else ''
    tx = re.sub(r'\s+', ' ', tx).strip()
    if tx:
        r['tx'] = tx if len(tx) <= 420 else tx[:400].rsplit(' ', 1)[0] + ' …'
    # 英語の同族語・原文は画面に出さない (2026-11-25 ユーザー判断) のでデータからも外す
    r.pop('en', None); r.pop('tx', None)
    if r: info[(p, w)] = r

shards = collections.defaultdict(dict)
for (p, w), r in info.items():
    shards[fold(w)[:1] or '_'][p + ':' + w] = r
os.makedirs(outd, exist_ok=True)
for f in os.listdir(outd):
    if f.endswith('.json'): os.remove(os.path.join(outd, f))
tot = 0
for c, m in shards.items():
    fn = os.path.join(outd, c + '.json')
    json.dump(m, open(fn, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    tot += os.path.getsize(fn)
cnt = collections.Counter(k for r in info.values() for k in r)
print('words', len(info), dict(cnt), 'bytes', tot)
