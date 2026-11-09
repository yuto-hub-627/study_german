#!/usr/bin/env python3
"""Merge data/textbook_words.tsv with the lexicon -> src/data/textbook.json
Usage: build_textbook.py public/dict/lexicon.json data/textbook_words.tsv src/data/textbook.json
"""
import sys, json, re
lex = json.load(open(sys.argv[1], encoding='utf-8'))
idx = {}
for e in lex:
    idx.setdefault((e['w'], e['p']), e)
    idx.setdefault((e['w'], '*'), e)
# perfect auxiliary per textbook (Lektion 5A): movement / change of state -> sein
SEIN = set('kommen gehen fahren fallen fliegen laufen reisen steigen aufstehen einschlafen geschehen passieren sterben werden sein bleiben ankommen abfahren mitkommen abfliegen aufwachsen vergehen ziehen schwimmen'.split())
out, seen = [], set()
for line in open(sys.argv[2], encoding='utf-8'):
    if line.startswith('#') or not line.strip():
        continue
    cols = line.rstrip('\n').split('\t')
    cols += [''] * (6 - len(cols))
    lesson, word, pos, gender, plural, ja = cols[:6]
    refl = word.startswith('sich ')
    base = word[5:] if refl else word
    sep = None
    if '|' in base:
        sep, rest = base.split('|', 1)
        base = sep + rest
    key = (base, pos)
    if (word, pos) in seen:
        continue
    seen.add((word, pos))
    e = {'id': 'tb:' + word.replace(' ', '_').replace('|', '') + (':' + pos if pos in ('adv', 'num', 'det', 'pron') else ''),
         'de': base, 'pos': pos, 'ja': ja, 'lesson': lesson, 'src': 'textbook'}
    lx = idx.get(key) or (idx.get((base, '*')) if pos not in ('phrase',) else None)
    if lx and lx.get('en'):
        e['en'] = lx['en'][0]
    if lx and lx.get('ipa'):
        e['ipa'] = lx['ipa']
    if pos == 'noun':
        if plural == 'Pl':
            e['plOnly'] = True
        else:
            if gender: e['g'] = gender
            elif lx and lx.get('g'): e['g'] = lx['g']
            if plural and plural != '-': e['pl'] = plural
            elif lx and lx.get('pl') and plural != '-': e['pl'] = lx['pl']
            if lx and lx.get('gen'): e['gen'] = lx['gen']
            if lx and lx.get('wk'): e['weak'] = True
    elif pos == 'verb':
        if refl: e['refl'] = True
        if sep: e['sep'] = sep
        v = dict(lx['v']) if lx and lx.get('v') else {}
        if base in SEIN or (sep and base[len(sep):] in SEIN and base not in ('anrufen',)):
            v['ax'] = 'sein'
        elif v.get('ax', '').startswith('sein') or v.get('ax') == 'haben/sein':
            v['ax'] = 'haben'
        if not v:
            print('WARN no verb data', word, file=sys.stderr)
        e['v'] = v
    elif pos == 'adj':
        if lx and lx.get('c'): e['c'] = lx['c']
    out.append(e)
json.dump(out, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('words', len(out))
