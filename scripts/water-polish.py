import json,re
from pathlib import Path
repo=Path(__file__).resolve().parents[1];path=repo/'src/water/questions.json';qs=json.loads(path.read_text())
headers={
'2018-1-15':['Grondwater','Oppervlaktewater','Zoet water','Zout water'],
'2018-1-16':['Rivier 1','Rivier 2','Lijn 3','Lijn 4'],
'2018-1-26':['Grootste verdamping','Grootste kans op verzilting'],
'2018-2-19':['Grind','Klei','Zand'],
'2018-2-22':['Snelheid op foto 1','Debiet op foto 1'],
'2019-1-15':['Cijfer 1','Cijfer 2','Cijfer 3'],
'2019-1-20':['Grondwater','Leidingwater','Oppervlaktewater'],
'2019-1-27':['Minste verdamping','Meeste verdamping'],
'2019-2-25':['Grootste debiet','Grootste slibafvoer'],
'2021-2-17':['P','Q'],
'2021-2-21':['Liao He','Huang He','Chang Jiang'],
'2022-2-18':['P','Q','R'],
'2023-1-25':['Hoogste gebruik','Daarna','Laagste gebruik'],
'2023-2-24':['Grootste afhankelijkheid','Daarna','Kleinste afhankelijkheid'],
'2024-1-25':['Foto 1','Verzilting foto 1','Foto 2','Verzilting foto 2'],
'2024-2-21':['Eerste cijfer','Tweede cijfer'],
'2025-2-17':['Beste periode','Sluizen en stuwen die sluiten']
}
manual={
'2025-1-26':[
 ['Bodem doorspoelen met zoetwater','Overstappen op visteelt in brak water'],
 ['Overstappen op visteelt in brak water','Zouttolerante gewassen telen'],
 ['Zouttolerante gewassen telen','Bodem doorspoelen met zoetwater'],
 ['Zouttolerante gewassen telen','Overstappen op visteelt in brak water']
]
}
headers['2025-1-26']=['Aanpassen aan verzilting','Bestrijden van verzilting']
for q in qs:
 if q['id'] in headers:
  q['prompt']=q['prompt'].split('\n\n')[0]
  for i,option in enumerate(q['options']):
   values=manual[q['id']][i] if q['id'] in manual else re.split(r'\s{2,}',option['label'].strip())
   assert len(values)==len(headers[q['id']]),(q['id'],option['value'],values)
   option['parts']=[{'label':header,'value':value} for header,value in zip(headers[q['id']],values)]
   option['label']=' · '.join(f'{p["label"]}: {p["value"]}' for p in option['parts'])
 else:
  if q['kind']=='choice' and all(not o['label'].startswith('Optie ') for o in q['options']):q['table']=False
 # Context-reading improvements to the two open questions whose extracted wording is only a task.
 if q['id']=='2026-1-20':q['prompt']='Bekijk de tabel en de vier uitspraken a tot en met d op de bronpagina. Daar staan demografische, natuurlijke en ruimtelijke voor- en nadelen van het drinkwaterplan voor Zeeuws-Vlaanderen. Neem de letters a tot en met d over en noteer het juiste cijfer uit de tabel erachter.';q['transcriptionNote']='De instructie is voor schermlezen licht aangepast. De originele vraag staat op de bronpagina.'
 if q['id']=='2026-1-17':q['prompt']='Bekijk bron 18. De foto’s zijn genomen op verschillende plekken langs de rivier de Maas. Noteer de cijfers van de foto’s in de juiste volgorde van bron richting monding.'
path.write_text(json.dumps(qs,ensure_ascii=False,indent=2))
print('Readable tables:',len(headers))
