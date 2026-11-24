#!/usr/bin/env python3
"""辞書の各単語に例文を割り当てる -> public/dict/ex/<頭文字>.json

Inputs:
  lexicon.json        : build_lexicon.py の出力
  de_ja_pairs.tsv     : tatoeba_pairs.py の出力 (id, d|p, German, Japanese)
  de_examples.jsonl   : extract_de.py の第2出力 (Wiktionary の例文・英訳)
  de_full.txt         : 頻度リスト (やさしい文を優先するため)
Usage: build_examples.py <lexicon.json> <data_dir> <out_dir>
License: Tatoeba CC BY 2.0 FR / Wiktionary CC BY-SA 4.0
"""
import sys, os, re, json, math, collections, unicodedata
lexp, src, outd = sys.argv[1:4]
lex = json.load(open(lexp, encoding='utf-8'))

def fold(s):
    s = s.lower().replace('ä', 'a').replace('ö', 'o').replace('ü', 'u').replace('ß', 'ss')
    s = s.replace('ae', 'a').replace('oe', 'o').replace('ue', 'u')
    return re.sub(r'[^a-z]', '', s)

rank = {}
for i, l in enumerate(open(os.path.join(src, 'de_full.txt'), encoding='utf-8')):
    if i > 300000: break
    rank.setdefault(l.split()[0].lower(), i + 1)

SKIP_POS = {'det', 'pron', 'phrase'}
# token -> set(lemma key);  名詞は大文字のまま、それ以外は小文字で照合
tok = collections.defaultdict(set)
sep = collections.defaultdict(set)  # (first, particle) -> key
def K(e): return e['p'] + ':' + e['w']
for e in lex:
    if e['p'] in SKIP_POS: continue
    k = K(e); w = e['w']
    if e['p'] == 'noun':
        for f in (w, e.get('pl'), e.get('gen')):
            if f: tok[f].add(k)
        if e.get('pl') and not re.search('[ns]$', e['pl']): tok[e['pl'] + 'n'].add(k)
        continue
    forms = {w.lower()}
    v = e.get('v')
    if v:
        for arr in (v.get('pr'), v.get('pt'), v.get('k2'), v.get('im')):
            for f in arr or []:
                if not f: continue
                ps = f.split(' ')
                if len(ps) == 2: sep[(ps[0].lower(), ps[1].lower())].add(k)
                else: forms.add(f.lower())
        if v.get('pp'): forms.add(v['pp'].lower())
    c = e.get('c')
    stems = [w.lower()]
    if c:
        for f in c:
            if f: stems.append(f.replace('am ', '').lower())
        if c[1] and c[1].endswith('en'): stems.append(c[1].replace('am ', '')[:-2].lower())
    if e['p'] == 'adj':
        for st in stems:
            forms.add(st)
            b = st[:-1] if st.endswith('e') else st
            for end in ('e', 'en', 'em', 'er', 'es'): forms.add(b + end)
            if re.search('e[lr]$', st):
                for end in ('e', 'en', 'em', 'er', 'es'): forms.add(st[:-2] + st[-1] + end)
    for f in forms: tok[f].add(k)

wkey = {K(e): e for e in lex}
TOK = re.compile(r"[A-Za-zÄÖÜäöüß]+")

def lemmas_of(s):
    ts = TOK.findall(s)
    last = ts[-1].lower() if ts else ''
    found = set()
    for i, t in enumerate(ts):
        if i == 0 and t[0].isupper() and tok.get(t.lower()):
            found |= tok.get(t.lower(), set())  # 文頭の大文字は小文字の語として読む (Es ist… の Es は名詞にしない)
        else:
            found |= tok.get(t, set())  # 名詞は大文字のまま照合
        tl = t.lower()
        hit = sep.get((tl, last))
        if hit and i < len(ts) - 1: found |= hit
    return ts, found

def score(ts, de, ja, kind):
    rs = [rank.get(t.lower(), 300000) for t in ts]
    hard = sum(math.log(r) for r in rs) / len(rs)
    n = len(ts)
    return hard + abs(n - 6) * 0.25 + (0 if kind == 'd' else 0.6) + len(ja) / 80

best = collections.defaultdict(list)  # key -> [(score, de, ja)]
seen_de = set()
for l in open(os.path.join(src, 'de_ja_pairs.tsv'), encoding='utf-8'):
    _, kind, de, ja = l.rstrip('\n').split('\t')
    if de in seen_de or len(de) > 80 or len(ja) > 60 or '\n' in de: continue
    seen_de.add(de)
    ts, found = lemmas_of(de)
    if not (3 <= len(ts) <= 13): continue
    sc = score(ts, de, ja, kind)
    for k in found:
        b = best[k]
        b.append((sc, de, ja))
        if len(b) > 12:
            b.sort(); del b[8:]

wik = {}
for l in open(os.path.join(src, 'de_examples.jsonl'), encoding='utf-8'):
    d = json.loads(l)
    p = {'article': 'det', 'postp': 'prep', 'particle': 'adv', 'name': 'noun'}.get(d['p'], d['p'])
    wik.setdefault(p + ':' + d['w'], d['x'])

def similar(a, b):
    ta, tb = TOK.findall(a.lower()), TOK.findall(b.lower())
    return ta[:3] == tb[:3] or len(set(ta) ^ set(tb)) <= 2

shards = collections.defaultdict(dict)
nja = nen = 0
for e in lex:
    k = K(e)
    if e['p'] == 'phrase': continue
    picks = []
    for sc, de, ja in sorted(best.get(k, [])):
        if any(similar(de, p[0]) for p in picks): continue
        picks.append([de, ja])
        if len(picks) >= 3: break
    for de, en in wik.get(k, []):
        if len(picks) >= 4: break
        if any(similar(de, p[0]) for p in picks): continue
        picks.append([de, None, en])
    if not picks: continue
    nja += sum(1 for p in picks if p[1]); nen += sum(1 for p in picks if len(p) == 3)
    c = fold(e['w'])[:1] or '_'
    shards[c][k] = picks
os.makedirs(outd, exist_ok=True)
for f in os.listdir(outd):
    if f.endswith('.json'): os.remove(os.path.join(outd, f))
tot = 0
for c, m in shards.items():
    fn = os.path.join(outd, c + '.json')
    json.dump(m, open(fn, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    tot += os.path.getsize(fn)
print('words with examples', sum(len(m) for m in shards.values()), 'ja sentences', nja, 'en sentences', nen, 'bytes', tot)
