import json
from pathlib import Path
repo=Path(__file__).resolve().parents[1];p=repo/'src/water/questions.json';qs=json.loads(p.read_text());d=json.load(open(repo/'research/water/distractors.json'))
for q in qs:
 q['prompt']=q['prompt'].replace(': t ijdens',': tijdens')
 if 'statements' in q:q['statements']={k:v.replace('t ijdens','tijdens') for k,v in q['statements'].items()}
 if q['kind']=='choice':
  right=next(o for o in q['options'] if o['value']==q['correct'])
  q['distractors']=d.get(q['id'],{})
  for o in q['options']:
   if o['value']==q['correct']:continue
   if o.get('parts'):
    diffs=[f"{part['label']}: jij koos {part['value']}, maar de bron vraagt {expected['value']}" for part,expected in zip(o['parts'],right['parts']) if part['value']!=expected['value']]
    q['distractors'][o['value']]='. '.join(diffs)+'. '+q['pitfall']
   if o['value'] not in q['distractors']:
    q['distractors'][o['value']]=f"Je keuze {o['label']} verschilt van {right['label']}. "+q['pitfall']
  assert len(q['distractors'])==len(q['options'])-1,q['id']
p.write_text(json.dumps(qs,ensure_ascii=False,indent=2))
