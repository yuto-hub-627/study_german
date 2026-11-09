# stream English kaikki; for each translation sense collect de & ja words -> de->ja candidates
import sys, json, re, collections
freq=set(l.split()[0] for l in open(sys.argv[2]))
res=collections.defaultdict(collections.Counter)
n=0
for line in sys.stdin:
    if '"ja"' not in line or '"de"' not in line: continue
    try: d=json.loads(line)
    except Exception: continue
    groups=collections.defaultdict(lambda:([],[]))
    trs=list(d.get('translations',[]))
    for s in d.get('senses',[]): trs+=s.get('translations',[])
    for t in trs:
        lc=t.get('lang_code'); w=t.get('word')
        if not w: continue
        key=t.get('sense','')
        if lc=='de': groups[key][0].append(w)
        elif lc=='ja': groups[key][1].append(w)
    for k,(de,ja) in groups.items():
        if not de or not ja: continue
        ja=[j for j in ja if len(j)<=12][:3]
        for i,w in enumerate(de[:4]):
            if w.lower() in freq or w in freq:
                for r,j in enumerate(ja): res[w][j]+= (3-r)+(2 if i==0 else 0)
    n+=1
out={w:[j for j,_ in c.most_common(4)] for w,c in res.items()}
json.dump(out,open(sys.argv[1],'w'),ensure_ascii=False)
print('entries',n,'words',len(out))
