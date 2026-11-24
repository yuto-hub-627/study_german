# stream kaikki German (en.wiktionary) jsonl from stdin -> compact lemma json lines
import sys, json, re
POS_OK={'noun','verb','adj','adv','prep','conj','pron','num','intj','det','article','particle','postp'}
out=open(sys.argv[1],'w')
# 2番目の引数があれば、Wiktionary の例文 (英訳つき) も書き出す
exo=open(sys.argv[2],'w') if len(sys.argv)>2 else None
def has(tags,*t): return all(x in tags for x in t)
for line in sys.stdin:
    try: d=json.loads(line)
    except Exception: continue
    pos=d.get('pos')
    if pos not in POS_OK: continue
    senses=d.get('senses',[])
    lemma_senses=[s for s in senses if 'form-of' not in s.get('tags',[]) and 'alt-of' not in s.get('tags',[]) and not s.get('form_of')]
    if not lemma_senses: continue
    w=d['word']
    if ' ' in w and pos!='verb': continue
    e={'w':w,'p':pos}
    gl=[]
    for s in lemma_senses:
        for g in s.get('glosses',[])[:1]:
            g=re.sub(r'\s+',' ',g).strip()
            if g and g not in gl: gl.append(g)
    e['en']=gl[:4]
    tags=set()
    for s in lemma_senses: tags.update(s.get('tags',[]))
    exp=' '.join(h.get('expansion','') for h in d.get('head_templates',[]))
    if pos=='noun':
        g=''
        m=re.match(r'^\S+(?: \S+)* ([mfn](?: or [mfn])?|p)\b', exp)
        for t,c in (('masculine','m'),('feminine','f'),('neuter','n')):
            if t in tags: g+=c
        if not g:
            mm=re.search(r'\s(m|f|n)(?:\s|$|,|\()',exp)
            if mm: g=mm.group(1)
        if 'plural-only' in tags or re.search(r'\sp(?:l)?\s?\(|\splural only',exp): e['po']=1
        e['g']=g[:1] if g else ''
        pl=[f['form'] for f in d.get('forms',[]) if f.get('tags')==['plural']]
        gen=[f['form'] for f in d.get('forms',[]) if f.get('tags')==['genitive']]
        if pl: e['pl']=pl[0]
        if gen: e['gen']=gen[0]
        if 'weak' in tags or 'mixed' in tags: e['wk']=1 if 'weak' in tags else 0
    elif pos=='verb':
        F=d.get('forms',[])
        def pick(*t,src='conjugation'):
            for f in F:
                ft=f.get('tags',[])
                if f.get('source')==src and has(ft,*t) and 'subordinate-clause' not in ft and 'dependent' not in ft:
                    return f['form']
            return None
        pres=[pick(p,n,'present','indicative') for p,n in (('first-person','singular'),('second-person','singular'),('third-person','singular'),('first-person','plural'),('second-person','plural'),('third-person','plural'))]
        pret=[pick(p,n,'preterite','indicative') for p,n in (('first-person','singular'),('second-person','singular'),('third-person','singular'),('first-person','plural'),('second-person','plural'),('third-person','plural'))]
        k2=[pick(p,n,'subjunctive-ii') for p,n in (('first-person','singular'),('second-person','singular'),('third-person','singular'),('first-person','plural'),('second-person','plural'),('third-person','plural'))]
        imp=[pick('imperative','singular'),pick('imperative','plural')]
        pp=pick('participle','past')
        aux=[f['form'] for f in F if f.get('tags')==['auxiliary']]
        if not pp:
            for f in F:
                if f.get('tags')==['participle','past']: pp=f['form'];break
        e['pres']=pres; e['pret']=pret; e['k2']=k2; e['imp']=imp; e['pp']=pp; e['aux']=sorted(set(aux))
        e['refl']=1 if ('reflexive' in tags and all('reflexive' in s.get('tags',[]) for s in lemma_senses)) else 0
        if 'separable' in tags or re.search(r'\bseparable\b',exp): e['sep']=1
        e['wk']= 'weak' in exp and 'strong' not in exp
    elif pos=='adj':
        F=d.get('forms',[])
        comp=[f['form'] for f in F if f.get('tags')==['comparative']]
        sup=[f['form'] for f in F if f.get('tags')==['superlative']]
        if comp: e['cmp']=comp[0]
        if sup: e['sup']=sup[0]
    for s in d.get('sounds',[]):
        if 'ipa' in s: e['ipa']=s['ipa'];break
    out.write(json.dumps(e,ensure_ascii=False)+'\n')
    if exo:
        exs=[]
        for s in lemma_senses:
            for x in s.get('examples',[]):
                t=(x.get('text') or '').strip(); en=(x.get('english') or x.get('translation') or '').strip()
                if x.get('type')!='example' or not en or en.startswith('(please') or '\n' in t or not (8<=len(t)<=110): continue
                if [t,en] not in exs: exs.append([t,en])
        if exs: exo.write(json.dumps({'w':w,'p':pos,'x':exs[:6]},ensure_ascii=False)+'\n')
out.close()
if exo: exo.close()
