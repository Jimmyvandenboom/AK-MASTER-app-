import json,re,collections
from pathlib import Path
repo=Path(__file__).resolve().parents[1];qs=json.load(open(repo/'research/water/extracted.json'));ed={}
for line in open(repo/'research/water/editorial.txt'):
 if line.startswith('#') or not line.strip():continue
 parts=line.strip().split('|');ed[parts[0]]=parts[1:]
statementEx=json.load(open(repo/'research/water/statements.json'))
words={'twee':2,'drie':3,'vier':4,'vijf':5,'zes':6,'zeven':7}
manual={
 '2018-2-21':('multi',{'correctValues':['1','2','3','5'],'values':list('1234567'),'pick':4,'bands':[[4,2],[2,1],[0,0]]}),
 '2021-1-27':('shorts',{'expected':{'1':'S','2':'V'},'bands':[[2,2],[1,1],[0,0]]}),
 '2023-1-16':('sequence',{'sequence':['1','3','2']}),
 '2026-1-17':('sequence',{'sequence':['2','1','3']}),
 '2026-1-29':('sequence',{'sequence':['f','b','d','c','e','a'],'partialRemoval':True}),
 '2024-2-17':('shorts',{'expected':{'X':'Schelde','Y':'Maas','Z':'Rijn'},'bands':[[3,1],[0,0]]})
}
for q in qs:
 theme,title,explanation,pitfall=ed[q['id']];q.update(theme=theme,title=title,explanation=explanation,pitfall=pitfall)
 q['prompt']=re.sub(r'(?<=:)\s*([dhive])\s+(e|et|n|en|anaf|at)\b',lambda m:' '+m[1]+m[2],q['prompt'])
 q['prompt']=re.sub(r'\((?:1 punt|2 punten)\)','',q['prompt']);q['prompt']=re.sub(r'\n[ \t]+','\n',q['prompt']);q['prompt']=re.sub(r'(?<!\n)\n(?!\n)',' ',q['prompt']);q['prompt']=re.sub(r' +',' ',q['prompt']).strip()
 q['officialAnswer']=re.sub(r'Vraag\s+Antwoord\s+Scores','',q['officialAnswer']);q['officialAnswer']=re.sub(r'GT ?0131[^►]*►►►','',q['officialAnswer']).strip()
 ans=q['officialAnswer']
 if q['kind']=='open' and re.match(r'^\s*[1-9a-f]\s*=',ans):
  pairs=re.findall(r'\b([1-9a-f])\s*=\s*(.*?)(?=\s+[1-9a-f]\s*=|\s+indien|\s+Opmerking|\s+per juist|$)',ans)
  if pairs and all(len(v)<100 for _,v in pairs):q['kind']='shorts';q['expected']={k:v.strip() for k,v in pairs}
 if q['kind'] in ['statements','shorts']:
  n=len(q['expected']);q['bands']=[[n,q['maxPoints']],[0,0]]
  if q['maxPoints']==2:
   # Check exact official thresholds; no universal partial-score rule is assumed.
   levels=[]
   for m in re.finditer(r'indien ((?:twee|drie|vier|vijf|zes|zeven)(?:[, ]+(?:(?:of|en) )?(?:twee|drie|vier|vijf|zes|zeven))*)\s+(?:antwoorden juist|juiste antwoorden)\s+([012])\b',ans):
    nums=[words[w] for w in re.findall(r'\w+',m[1]) if w in words]
    if nums:levels.append([min(nums),int(m[2])])
   if levels:q['bands']=sorted(levels+[[0,0]],reverse=True)
 q['statementExplanations']=statementEx.get(q['id'],[])
 if q['kind']=='statements':
  q['statements']={n:' '.join(s.strip().split()) for n,s in re.findall(r'Uitspraak\s*(\d)\s*[:.]\s*(.*?)(?=Uitspraak\s*\d|→|Neem de|$)',q['prompt'],re.S)}
  if len(q['statements'])!=len(q['expected']):q['statements']={n:f'Uitspraak {n} uit de originele bronpagina' for n in q['expected']}
 if q['id'] in manual:
  q['kind'],extra=manual[q['id']];q.update(extra)
 if q['id']=='2019-1-18':
  q['kind']='excluded';q['amendment']='Deze vraag verviel als meetvraag: de officiële aanvulling kent iedereen 1 punt toe door een fout in de bron. De trainer registreert hier geen goed/fout of score.';q['amendmentUrl']='https://www.examenblad.nl/2019/vmbo-tl/documenten/cse-1/gt-0131-a-19-a-c-a'
 if q['id']=='2021-2-15':
  q['options']=[o for o in q['options'] if o['value']!='D'];q['amendment']='Officieel erratum: antwoordoptie D is geschrapt. Gebruik de andere opties.';q['amendmentUrl']='https://www.examenblad.nl/2021/vmbo-tl/documenten/cse-2/gt-0131-a-21-2-o-e'
 if q['id']=='2026-1-29':
  q['officialAnswer']=q['officialAnswer'].replace('foutief geplaatst nummer','foutief geplaatste letter');q['amendment']='De officiële aanvulling corrigeert “nummer” naar “letter” in de regel voor een gedeeltelijk juiste volgorde.';q['amendmentUrl']='https://www.examenblad.nl/2026/vmbo-tl/documenten/cse-1/gt-0131-a-26-1-c-a1'
 if q['id']=='2026-1-19':q['options'][-1]['label']='Zeeuws-Vlaanderen heeft te maken met verzilting van het grondwater.'
 if q['id']=='2026-2-27':
  q['prompt']='Bekijk bron 26. Het watergebruik in Saudi-Arabië staat onder druk. Er is weinig aanbod van zoetwater, terwijl de vraag naar water stijgt. Wat zijn de twee juiste oorzaken voor het dalende aanbod van zoetwater?'
  q['options']=[{'value':'A','label':'De neerslag is groter dan de verdamping + Saudi-Arabië heeft een droog klimaat.'},{'value':'B','label':'De neerslag is groter dan de verdamping + ontziltingsinstallaties hebben te weinig aanvoer van water.'},{'value':'C','label':'Saudi-Arabië heeft alleen wadi’s en geen rivieren + Saudi-Arabië heeft een droog klimaat.'},{'value':'D','label':'Saudi-Arabië heeft alleen wadi’s en geen rivieren + ontziltingsinstallaties hebben te weinig aanvoer van water.'}]
  q['table']=False
 q['rubricNote']='Vergelijk jouw antwoord met het officiële model. Zelfbeoordeling: de app beoordeelt de betekenis van vrije tekst niet automatisch.'
 if 'alleen toekennen' in ans:q['rubricNote']+=' Let op: in deze vraag telt een losse keuze vaak pas met de gevraagde uitleg; lees de officiële scorevoorwaarde.'
 # Keep only substantive page images, source URLs and answer data in the app.
 assert q['explanation'] and q['pitfall'] and q['sourcePages']
 assert q['kind']!='choice' or q['correct'] in [o['value'] for o in q['options']]
 assert q['kind']!='statements' or q['id']=='2019-1-18' or len(q['statementExplanations'])==len(q['expected'])
(repo/'src/water/questions.json').write_text(json.dumps(qs,ensure_ascii=False,indent=2))
(repo/'research/water/editorial-review.json').write_text(json.dumps({'questions':len(qs),'themes':dict(collections.Counter(q['theme'] for q in qs)),'formats':dict(collections.Counter(q['kind'] for q in qs)),'review':'Per-vraag uitleg, correcties en gesloten sleutels gecontroleerd aan geëxtraheerde officiële tekst; bronpagina’s zijn ongewijzigde renders van de PDF. Uitleg is eigen redactionele tekst.'},ensure_ascii=False,indent=2))
print('Final:',collections.Counter(q['kind'] for q in qs),collections.Counter(q['theme'] for q in qs))
for q in qs:
 if q['kind']=='shorts':print(q['id'],q['expected'],q['bands'])
