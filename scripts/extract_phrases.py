#!/usr/bin/env python3
"""kaikki.org German (en.wiktionary) jsonl (stdin) -> 熟語・成句 (phrase / prep_phrase / proverb / multi-word verb) jsonl"""
import sys, json, re
out = open(sys.argv[1], 'w', encoding='utf-8')
POS = {'phrase', 'prep_phrase', 'proverb', 'verb', 'adv', 'intj', 'noun', 'adj'}
for line in sys.stdin:
    if '"pos"' not in line:
        continue
    try:
        d = json.loads(line)
    except Exception:
        continue
    w = d.get('word', '')
    p = d.get('pos')
    if p not in POS or ' ' not in w or len(w) > 60:
        continue
    senses = [s for s in d.get('senses', []) if 'form-of' not in s.get('tags', []) and not s.get('form_of')]
    gl = []
    for s in senses:
        for g in s.get('glosses', [])[:1]:
            g = re.sub(r'\s+', ' ', g).strip()
            if g and g not in gl:
                gl.append(g[:90])
    if not gl:
        continue
    out.write(json.dumps({'w': w, 'p': p, 'en': gl[:3]}, ensure_ascii=False) + '\n')
out.close()
