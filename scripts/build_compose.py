#!/usr/bin/env python3
"""作文問題（カードを並べて文を作る）のデータ -> public/dict/compose.json

Tatoeba のドイツ語・日本語の対訳から、短くて全部の語を分析できる文を選ぶ。
各語は「基本形のカード」にして、長押しで形を変えられる語（動詞・冠詞・形容詞・名詞）には選択肢を付ける。

Usage: build_compose.py <lexicon.json> <textbook.json> <de_ja_pairs.tsv> <de_full.txt> <out.json>
出力: {
  s: [[de, ja, lv, [tile, ...]], ...]   lv = 文で使う教科書の課 (0..15) / -1 = 教科書にない語を含む
     tile = 表層形の文字列 (変えられない語) | [表層形, 選択肢グループのキー]
  g: { key: [[形, 説明], ...] }            先頭が基本形 (カードに最初に出す形)
}
License: Tatoeba CC BY 2.0 FR / Wiktionary CC BY-SA 4.0
"""
import sys, re, json, math, collections, random
lexp, tbp, pairs, freqp, out = sys.argv[1:6]
lex = json.load(open(lexp, encoding='utf-8'))
tb = json.load(open(tbp, encoding='utf-8'))
LESSONS = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B']
rank = {}
for i, l in enumerate(open(freqp, encoding='utf-8')):
    if i > 300000: break
    rank.setdefault(l.split()[0].lower(), i + 1)

PERS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']
groups = {}  # key -> [[form, label], ...]
form2 = collections.defaultdict(list)  # surface -> [(key, kind, lemma)]

# ---- 冠詞類（定冠詞・不定冠詞・否定冠詞・所有冠詞）----
CASES = ['1格', '2格', '3格', '4格']
def art_table(stem):
    # 男性, 女性, 中性, 複数 × 1-4格
    if stem == 'd':
        t = [['der', 'des', 'dem', 'den'], ['die', 'der', 'der', 'die'], ['das', 'des', 'dem', 'das'], ['die', 'der', 'den', 'die']]
    else:
        s = stem
        t = [[s, s + 'es', s + 'em', s + 'en'], [s + 'e', s + 'er', s + 'er', s + 'e'], [s, s + 'es', s + 'em', s], [s + 'e', s + 'er', s + 'en', s + 'e']]
        if stem == 'ein':
            t[3] = None
        if stem == 'euer':
            t = [[f.replace('euere', 'eure').replace('eueres', 'eures').replace('euerem', 'eurem').replace('eueren', 'euren').replace('euerer', 'eurer') if f else f for f in row] for row in t]
    labels = collections.OrderedDict()
    for gi, g in enumerate(['男性', '女性', '中性', '複数']):
        if not t[gi]: continue
        for ci, f in enumerate(t[gi]):
            labels.setdefault(f, []).append(f'{g}{CASES[ci]}')
    return [[f, '・'.join(v)] for f, v in labels.items()]
ARTS = {'d': 'der', 'ein': 'ein', 'kein': 'kein', 'mein': 'mein', 'dein': 'dein', 'sein': 'sein', 'ihr': 'ihr', 'unser': 'unser', 'euer': 'euer'}
for stem, base in ARTS.items():
    key = 'a:' + base
    groups[key] = art_table(stem)
    for f, _ in groups[key]:
        form2[f].append((key, 'art', base))
ART_FORMS = set(form2)

# ---- 動詞・形容詞・名詞 ----
tbw = {(w['pos'], w['de']): LESSONS.index(w['lesson']) for w in tb if w.get('lesson') in LESSONS}
best = {}
for e in lex:
    if e['p'] in ('verb', 'adj', 'noun') and (e['p'], e['w']) not in best:
        best[(e['p'], e['w'])] = e
for (p, w), e in best.items():
    if p == 'verb' and e.get('v') and ' ' not in ((e['v'].get('pr') or ['', '', ''])[2] or ''):
        v = e['v']; g = [[w, '不定詞（基本形）']]
        def tense(arr, name):
            if not arr: return
            for f in dict.fromkeys(arr):
                if not f or ' ' in f: continue
                who = '・'.join(PERS[i] for i, x in enumerate(arr) if x == f)
                lab = f'{name}（{who}）'
                ex = next((x for x in g if x[0] == f), None)
                if ex: ex[1] += ' / ' + lab
                else: g.append([f, lab])
        tense(v.get('pr'), '現在形')
        tense(v.get('pt'), '過去形')
        if v.get('pp'):
            ex = next((x for x in g if x[0] == v['pp']), None)
            lab = f"過去分詞（{(v.get('ax') or 'haben').split('/')[0]} ＋ {v['pp']}）"
            if ex: ex[1] += ' / ' + lab
            else: g.append([v['pp'], lab])
        if w in ('haben', 'sein', 'werden', 'können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen'):
            tense(v.get('k2'), '接続法第2式')
        im = v.get('im') or []
        if im and im[0] and ' ' not in im[0]:
            ex = next((x for x in g if x[0] == im[0]), None)
            if ex: ex[1] += ' / du への命令形'
            else: g.append([im[0], 'du への命令形'])
        key = 'v:' + w; groups[key] = g
        for f, _ in g: form2[f].append((key, 'verb', w))
    elif p == 'adj':
        base = w.lower()
        if not re.fullmatch(r'[a-zäöüß]+', base): continue
        g = [[base, '語尾なし（基本形）']]
        st = base[:-1] if base.endswith('e') else base
        st2 = base[:-2] + base[-1] if re.search('e[lr]$', base) and len(base) > 4 else st
        for end, lab in (('e', '-e'), ('en', '-en'), ('em', '-em'), ('er', '-er'), ('es', '-es')):
            f = st2 + end if st2 != st and end != 'en' else st + end
            if f != base: g.append([f, f'格語尾 {lab}'])
        c = e.get('c') or []
        if c and c[0]:
            g.append([c[0], '比較級'])
            for end in ('e', 'en', 'em', 'er', 'es'): g.append([c[0] + end, f'比較級＋格語尾 -{end}'])
        if len(c) > 1 and c[1]:
            g.append([c[1], '最上級'])
            s2 = c[1].replace('am ', '')
            if s2.endswith('en'):
                for end in ('e', 'en', 'er', 'es'): g.append([s2[:-2] + end, f'最上級＋格語尾 -{end}'])
        seen = set(); g = [x for x in g if not (x[0] in seen or seen.add(x[0]))]
        key = 'j:' + w; groups[key] = g
        for f, _ in g: form2[f].append((key, 'adj', w))
    elif p == 'noun' and e.get('pl') and e['pl'] != w and ' ' not in e['pl']:
        g = [[w, '単数（基本形）'], [e['pl'], '複数']]
        if not re.search('[ns]$', e['pl']): g.append([e['pl'] + 'n', '複数3格'])
        if e.get('gen') and e['gen'] not in (w, e['pl']): g.append([e['gen'], '単数2格'])
        key = 'n:' + w; groups[key] = g
        for f, _ in g: form2[f].append((key, 'noun', w))

# 変えられない語（前置詞・代名詞・副詞など）として許す語
fixed_ok = set()
for e in lex:
    if e['p'] in ('pron', 'prep', 'conj', 'adv', 'det', 'intj', 'num', 'noun') or (e['p'] in ('adj', 'verb')):
        fixed_ok.add(e['w']); fixed_ok.add(e['w'].lower())
FREE = {'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie', 'mich', 'dich', 'sich', 'uns', 'euch', 'mir', 'dir', 'ihm', 'ihn', 'ihnen', 'Ihnen',
        'nicht', 'ja', 'nein', 'und', 'oder', 'aber', 'auch', 'noch', 'schon', 'sehr', 'zu', 'in', 'im', 'an', 'am', 'auf', 'mit', 'von', 'vom', 'zum', 'zur',
        'nach', 'aus', 'bei', 'für', 'um', 'ins', 'hier', 'da', 'dort', 'heute', 'morgen', 'jetzt', 'gern', 'gerne', 'was', 'wer', 'wo', 'wie', 'wann', 'warum',
        'woher', 'wohin', 'über', 'unter', 'vor', 'hinter', 'neben', 'zwischen', 'durch', 'gegen', 'ohne', 'seit', 'während', 'wegen', 'bis', 'außer', 'gegenüber', 'statt', 'trotz', 'sondern', 'denn', 'ob', 'als', 'dann', 'doch', 'sogar', 'wieder', 'bald', 'zusammen', 'allein', 'ganz', 'genug', 'zurück', 'dass', 'wenn', 'weil', 'man', 'etwas', 'nichts', 'alles', 'viel', 'so', 'immer', 'nie', 'oft', 'bitte', 'danke', 'gut', 'mal', 'nur'}

PARTICLES = {'ab', 'an', 'auf', 'aus', 'bei', 'ein', 'fern', 'fest', 'her', 'hin', 'los', 'mit', 'nach', 'vor', 'weg', 'zu', 'zurück', 'zusammen', 'weiter', 'fort', 'vorbei', 'teil', 'statt'}

def tile_of(t, first, last=False):
    cands = [t]
    if first and t[0].isupper(): cands = [t.lower(), t]
    # 代名詞・前置詞・よく使う副詞などは変えられないカード。文末の分離前つづり (… ein.) も同じ
    for c in cands:
        if c in FREE or (last and c in PARTICLES): return c, 'fixed', c
    for c in cands:
        hits = form2.get(c)
        if not hits: continue
        # 冠詞 > 動詞 > 形容詞 > 名詞 の順（大文字なら名詞を優先）
        order = {'art': 0, 'verb': 1, 'adj': 2, 'noun': 3}
        if c[0].isupper(): order['noun'] = -1
        kinds = {h[1] for h in hits}
        if 'verb' in kinds and 'adj' in kinds: return None, None, None  # weiß (wissen / 白い) のような紛らわしい語の文は使わない
        k, kind, lemma = sorted(hits, key=lambda h: order[h[1]])[0]
        if kind == 'noun' and not c[0].isupper(): continue
        if kind in ('verb', 'adj') and c[0].isupper(): continue
        return [c, k], kind, lemma
    for c in cands:
        if c in fixed_ok or c in FREE: return c, 'fixed', c
    return None, None, None

TOK = re.compile(r"[A-Za-zÄÖÜäöüß]+|[.,!?]")
lessons_of = collections.defaultdict(lambda: None)
for (p, w), li in tbw.items(): lessons_of[w] = li if lessons_of[w] is None else min(lessons_of[w], li)

res = []
seen = set()
for l in open(pairs, encoding='utf-8'):
    _, kind, de, ja = l.rstrip('\n').split('\t')
    if de in seen or len(de) > 60 or len(ja) > 40 or not re.fullmatch(r"[A-Za-zÄÖÜäöüß ,.!?]+", de): continue
    seen.add(de)
    toks = TOK.findall(de)
    words = [t for t in toks if t not in '.,!?']
    if not (3 <= len(words) <= 8) or toks[-1] not in '.!?' or ',' in toks: continue
    tiles = []; ok = True; lv = 0; nchg = 0; hard = 0
    for i, t in enumerate(words):
        tile, k, lemma = tile_of(t, i == 0, i == len(words) - 1)
        if tile is None: ok = False; break
        if k != 'fixed':
            nchg += 1
            if k != 'art':
                li = lessons_of[lemma]
                if li is None: lv = -1
                elif lv != -1: lv = max(lv, li)
        elif t not in FREE and t.lower() not in FREE:
            li = lessons_of[t] if lessons_of[t] is not None else lessons_of[t.lower()]
            if li is None: lv = -1
            elif lv != -1: lv = max(lv, li)
        tiles.append(tile)
        hard += math.log(rank.get(t.lower(), 300000))
    if not ok or nchg < 2: continue
    if any(isinstance(x, list) and x[0] != words[i] and not (i == 0 and x[0] == words[i].lower()) for i, x in enumerate(tiles)): continue
    sc = hard / len(words) + (0 if kind == 'd' else 0.5)
    res.append((lv, sc, de, ja, tiles))

# 課ごと・教科書外を、やさしい順に上限まで
by = collections.defaultdict(list)
for r in res: by[r[0]].append(r)
outl = []
for lv, rs in by.items():
    rs.sort(key=lambda r: r[1])
    outl += rs[: (400 if lv >= 0 else 2500)]
used = {x[1] if isinstance(x, list) else None for r in outl for x in r[4]}
g2 = {k: v for k, v in groups.items() if k in used}
random.seed(1); random.shuffle(outl)
data = {'s': [[de, ja, lv, tiles] for lv, sc, de, ja, tiles in outl], 'g': g2}
json.dump(data, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
c = collections.Counter(r[0] for r in outl)
print('sentences', len(outl), 'by lesson', sorted(c.items()), 'groups', len(g2))
