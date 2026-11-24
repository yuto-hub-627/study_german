#!/usr/bin/env python3
"""Tatoeba から ドイツ語→日本語 の対訳ペアを作る（直接リンク＋1言語を挟んだリンク）.
Usage: tatoeba_pairs.py <dir with deu_sentences.tsv jpn_sentences.tsv links.csv> <out.tsv>
License: Tatoeba CC BY 2.0 FR
"""
import sys, os, collections
d, out = sys.argv[1], sys.argv[2]
def load(fn):
    m = {}
    for l in open(os.path.join(d, fn), encoding='utf-8'):
        p = l.rstrip('\n').split('\t')
        if len(p) >= 3: m[int(p[0])] = p[2]
    return m
de, ja = load('deu_sentences.tsv'), load('jpn_sentences.tsv')
direct = collections.defaultdict(set)
de_mid = collections.defaultdict(list)
mid_ja = collections.defaultdict(list)
for l in open(os.path.join(d, 'links.csv')):
    a, b = l.split('\t'); a = int(a); b = int(b)
    if a in de:
        if b in ja: direct[a].add(b)
        elif b not in de: de_mid[a].append(b)
    elif b in ja and a not in ja:
        mid_ja[a].append(b)
n1 = n2 = 0
with open(out, 'w', encoding='utf-8') as f:
    for i, s in de.items():
        js = direct.get(i)
        kind = 'd'
        if not js:
            c = collections.Counter(j for m in de_mid.get(i, []) for j in mid_ja.get(m, []))
            js = [j for j, _ in c.most_common(1)]
            kind = 'p'
        if not js: continue
        j = min(js, key=lambda x: len(ja[x]))
        f.write(f'{i}\t{kind}\t{s}\t{ja[j]}\n')
        if kind == 'd': n1 += 1
        else: n2 += 1
print('direct', n1, 'pivot', n2)
