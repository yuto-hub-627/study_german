#!/usr/bin/env python3
"""Build the autocomplete lexicon (public/dict/lexicon.json).

Inputs (download first, see docs/DATA.md):
  de_lemmas.jsonl : output of scripts/extract_de.py (kaikki.org German, en.wiktionary)
  ja_de.jsonl     : kaikki.org jawiktionary ドイツ語 dump
  en_pivot.json   : output of scripts/pivot_en.py (German->Japanese via English translation tables)
  de_50k.txt      : FrequencyWords (OpenSubtitles 2018) German top 50k
Usage: build_lexicon.py <data_dir> <out.json>
Data license: Wiktionary content CC BY-SA 4.0 / FrequencyWords CC BY-SA 4.0
"""
import sys, json, re, os, collections
src, out = sys.argv[1], sys.argv[2]
rank = {}
for i, l in enumerate(open(os.path.join(src, 'de_50k.txt'), encoding='utf-8')):
    w = l.split()[0]
    rank.setdefault(w, i + 1)
    rank.setdefault(w.lower(), i + 1)

POSMAP = {'article': 'det', 'postp': 'prep', 'particle': 'adv', 'name': 'noun'}

def clean_ja(g):
    g = re.sub(r'[。．]$', '', g.strip())
    g = re.sub(r'（[^）]{8,}）', '', g)  # drop long explanatory parens
    g = g.replace('。', '、')
    return g.strip('、 ')

ja = collections.defaultdict(list)  # (word,pos)->glosses
ja_any = collections.defaultdict(list)
for l in open(os.path.join(src, 'ja_de.jsonl'), encoding='utf-8'):
    d = json.loads(l)
    pos = POSMAP.get(d.get('pos'), d.get('pos'))
    gl = []
    for s in d.get('senses', []):
        if s.get('form_of'):
            continue
        for g in s.get('glosses', [])[:1]:
            if re.search(r'の(現在|過去|接続法|複数|単数|命令|第[123]|比較級|最上級|属格|与格|対格|主格)', g):
                continue
            c = clean_ja(g)
            if c and c not in gl and len(c) <= 40:
                gl.append(c)
    if gl:
        ja[(d['word'], pos)] += gl
        ja_any[d['word']] += gl
pivot = json.load(open(os.path.join(src, 'en_pivot.json'), encoding='utf-8'))

def ja_for(w, p):
    gl = ja.get((w, p)) or []
    if not gl and p in ('noun', 'adj', 'adv', 'verb'):
        gl = []
    if gl:
        s = '、'.join(gl[:3])
        return s[:48]
    pv = pivot.get(w)
    if pv:
        return '、'.join(pv[:3])
    if ja_any.get(w):
        return '、'.join(ja_any[w][:2])[:48]
    return None

entries = {}
for l in open(os.path.join(src, 'de_lemmas.jsonl'), encoding='utf-8'):
    d = json.loads(l)
    w, p = d['w'], POSMAP.get(d['p'], d['p'])
    if len(w) > 40 or re.search(r'[0-9]', w) and p != 'num':
        continue
    r = rank.get(w) or rank.get(w.lower())
    inja = (w, p) in ja
    if not r and not inja:
        continue
    if p == 'noun' and not d.get('g') and not d.get('po') and not inja and (r or 99999) > 20000:
        continue
    key = (w, p)
    if key in entries:
        e = entries[key]
        for g in d.get('en', []):
            if g not in e['en'] and len(e['en']) < 3:
                e['en'].append(g)
        continue
    e = {'w': w, 'p': p, 'r': r or 60000, 'en': [g[:80] for g in d.get('en', [])[:3]]}
    if p == 'noun':
        if d.get('g'): e['g'] = d['g']
        if d.get('po'): e['po'] = 1
        if d.get('pl'): e['pl'] = d['pl']
        if d.get('gen'): e['gen'] = d['gen']
        if d.get('wk'): e['wk'] = 1
    elif p == 'verb':
        aux = d.get('aux') or []
        flat = set(a for a in aux if a in ('haben', 'sein'))
        if 'sein' in flat and 'haben' in flat: ax = 'sein/haben'
        elif 'sein' in flat: ax = 'sein'
        elif any('sein' in a for a in aux): ax = 'haben/sein'
        else: ax = 'haben'
        v = {'pp': d.get('pp'), 'ax': ax}
        if d.get('pres') and all(d['pres']): v['pr'] = d['pres']
        if d.get('pret') and all(d['pret']): v['pt'] = d['pret']
        if d.get('k2') and all(d['k2']): v['k2'] = d['k2']
        if d.get('imp') and all(d['imp']): v['im'] = d['imp']
        if d.get('refl'): v['rf'] = 1
        if d.get('wk'): v['wk'] = 1
        e['v'] = v
    elif p == 'adj':
        if d.get('cmp') or d.get('sup'):
            e['c'] = [d.get('cmp'), d.get('sup')]
    if d.get('ipa'): e['ipa'] = d['ipa']
    jj = ja_for(w, p)
    if jj: e['ja'] = jj
    entries[key] = e

lst = sorted(entries.values(), key=lambda e: (e['r'], e['w']))
for e in lst:
    if not e['en']: del e['en']
json.dump(lst, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('entries', len(lst), 'with ja', sum(1 for e in lst if 'ja' in e), 'bytes', os.path.getsize(out))
