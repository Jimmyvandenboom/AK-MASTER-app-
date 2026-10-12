from pathlib import Path
import re,json,fitz,collections
repo=Path(__file__).resolve().parents[1];root=Path('/workspace/examenanalyse/teksten');pdfroot=Path('/workspace/examenbronnen');assets=repo/'public/water'
rows=json.load(open('/workspace/examenanalyse/vragen.json'));output=[];inventory=[]
def clean(s):
 s=re.sub(r'GT[- ]0131[^\n]*','',s)
 s=re.sub(r'^\s*\d+\s*/\s*\d+\s*(?:lees verder.*)?$','',s,flags=re.M)
 s=re.sub(r'[\x00-\x08\x0b-\x1f\ufeff]','',s).replace('','→').replace('Æ','→').replace('','–').replace('−','–')
 return s.strip()
for year in [2018,2019,2021,2022,2023,2024,2025,2026]:
 for tv in [1,2]:
  code=f'gt-0131-a-{year%100}-{tv}';text=(root/(code+'-o.txt')).read_text();pages=text.split('\f');doc=fitz.open(pdfroot/str(year)/(code+'-o.pdf'));cv=(root/(code+'-c.txt')).read_text().split('Beoordelingsmodel',1)[1]
  cms=list(re.finditer(r'^\s*(?:Vraag\s+)?(\d{1,2})\s+(maximumscore\s+(\d+)|([A-F]))\s*$',cv,re.M));cms={int(m[1]):m for m in cms}
  markers=list(re.finditer(r'^[ \t\f]*(?:\dp[ \t]+(\d+)[ \t]+|Vraag[ \t]+(\d+)[ \t]+)',text,re.M));srcPages={}
  for pageno,page in enumerate(pages):
   for m in re.finditer(r'^\s*bron[ \t]+(\d+)\s*$',page,re.M):srcPages[int(m[1])]=pageno
  relevant=[r for r in rows if r['year']==year and r['timevak']==tv and r['topic']=='Water'];generated=set()
  for r in relevant:
   q=r['question'];m=next((m for m in markers if int(m[1] or m[2])==q),None)
   if m is None:raise ValueError((code,q,[int(m[1] or m[2]) for m in markers]))
   mi=markers.index(m);end=markers[mi+1].start() if mi+1<len(markers) else len(text)
   raw=text[m.end():end];raw=re.split(r'^\s*(?:bron[ \t]+\d+|Bevolking\s+(?:en|&)\s+ruimte)\s*$',raw,flags=re.M)[0];raw=clean(raw)
   pageindex=text[:m.end()].count('\f');before=text[:m.start()];localbefore=clean(pages[pageindex][:len(before.rsplit('\f',1)[-1])])
   lead=''
   if year==2026:
    # A clear paragraph break separates the context from the numbered task.
    lead=re.split(r'\n\s*\n',localbefore)[-1].strip()
    if lead and ('Bekijk' in lead or 'Lees' in lead):raw=lead+'\n'+raw
    if not cms[q][4]:
     pos=list(re.finditer(r'\((?:1 punt|2 punten)\)',raw))
     if pos:
      last=pos[-1].end();rest=raw[last:]
      # Instructions after the point label belong to the task; following context does not.
      if 'Doe het zo:' not in rest:raw=raw[:last]
      else:
       raw=raw[:last]+re.split(r'\n\s*\n',rest.strip())[0]
   refs=set(int(v) for v in re.findall(r'bron\s+(\d+)',raw,re.I))
   # Some tasks inherit sources or have lead-in instructions before their numbered line.
   if not refs:
    previousrefs=re.findall(r'bron\s+(\d+)',clean(before[-1800:]),re.I)
    refs=set(map(int,previousrefs[-3:]))
   pageids={pageindex}|{srcPages[v] for v in refs if v in srcPages}
   # Include immediately preceding pages when a source or explanation spans pages.
   for p in list(pageids):
    if p>0 and not re.search(r'bron\s+\d+',pages[p][:180]) and p==pageindex:pageids.add(p-1)
   imgs=[]
   for p in sorted(pageids):
    if p>=len(doc):continue
    filename=f'{code}-p{p+1}.webp'
    if p not in generated:
     pix=doc[p].get_pixmap(matrix=fitz.Matrix(2.1,2.1),alpha=False)
     from PIL import Image
     image=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
     image.save(assets/filename,'WEBP',quality=85,method=6);generated.add(p)
    imgs.append(dict(src='water/'+filename,page=p+1,refs=[v for v in sorted(refs) if srcPages.get(v)==p]))
   cm=cms[q];kind='choice' if cm[4] else 'open';expected={};statementMatches=re.findall(r'\b(\d)\s*=\s*(juist|onjuist)\b',r['answer'])
   if statementMatches and ('uitspraak' in raw.lower() or 'juist of onjuist' in raw.lower()):kind='statements';expected={n:v for n,v in statementMatches}
   prompt=raw;options=[];table=False
   if kind=='choice':
    lines=raw.splitlines();optionStart=next((i for i,l in enumerate(lines) if re.match(r'^\s*A\s+',l)),None)
    # Compact exam tables are kept in their original page image, never flattened into misleading labels.
    if optionStart is not None:
     questionLines=lines[:optionStart];optlines=lines[optionStart:];letters=[];buf=[]
     for line in optlines:
      match=re.match(r'^\s*([A-F])\s+(.*)',line)
      if match:
       if letters:options.append(dict(value=letters[-1],label=' '.join(buf)))
       letters.append(match[1]);buf=[match[2].strip()]
      elif letters:buf.append(line.strip())
     if letters:options.append(dict(value=letters[-1],label=' '.join(buf)))
     prompt='\n'.join(questionLines).strip()
     table=any(re.search(r'\s{3,}',l.strip()) for l in optlines) or any(len(o['label'])<12 for o in options)
     if len(options)<2 or cm[4] not in [o['value'] for o in options]:options=[]
    if not options:
     letters=re.findall(r'^\s*([A-F])\b',raw,re.M);letters=sorted(set(letters)) or list('ABCD')
     if cm[4] not in letters:letters.append(cm[4]);letters.sort()
     options=[dict(value=l,label=f'Optie {l} — bekijk de originele antwoordtabel') for l in letters];table=True
   # Display the original task from a page image when extraction loses tabular layout.
   sourceUrl=f'https://www.examenblad.nl/{year}/vmbo-tl/documenten/cse-{tv}/{code}-o'
   ans=clean(r['answer']);ans=re.split(r'\b5\s+(?:Inzenden|Aanleveren|Beoordelingsmodel)',ans)[0];ans=re.sub(r'Bevolking\s+(?:en|&)\s+ruimte','',ans).strip()
   output.append(dict(id=f'{year}-{tv}-{q}',year=year,period=tv,number=q,maxPoints=r['points'],kind=kind,prompt=prompt,options=options,table=table,correct=cm[4] or None,expected=expected,officialAnswer=ans,sourcePages=imgs,questionPage=pageindex+1,sourceUrl=sourceUrl,correctionUrl=f'https://www.examenblad.nl/{year}/vmbo-tl/documenten/cse-{tv}/{code}-c',amendment=None))
  doc.close()
assert len(output)==245
(repo/'research/water/extracted.json').write_text(json.dumps(output,ensure_ascii=False,indent=2))
print('Extracted',len(output),'water questions, types:',collections.Counter(q['kind'] for q in output),'images:',len(list(assets.glob('*.webp'))))
for q in output:print(q['id'],q['kind'],q['correct'] or '',q['prompt'][:85].replace('\n',' '))
