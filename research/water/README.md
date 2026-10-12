# Water-examentrainer: inhoud en broncontrole

Deze release bevat 245 echte Water-vragen uit 16 centrale examens vmbo GL/TL, 2018/2019 en 2021–2026, tijdvak 1 en 2. 2020 ontbreekt door de afgelaste centrale examens.

## Drie leerroutes

De indeling is redactioneel, geen officiële extra verdeling van de syllabus:

- `bodem`: Regen, bodem & drinkwater — 60 vragen.
- `rivieren`: Rivieren & waterveiligheid — 86 vragen.
- `wereld`: Waterschaarste & wereld — 99 vragen.

Een vraag krijgt één primaire leerroute, ook als een verband meerdere onderwerpen raakt.

## Beoordeling

- 38 meerkeuzevragen.
- 33 juist/onjuist-vragen.
- 15 gestructureerde invulvragen.
- 3 volgordevragen.
- 1 selectie van vier begrippen.
- 154 open vragen met transparante zelfbeoordeling.
- 1 vraag buiten scoring: 2019-I vraag 18.

De 90 gesloten vragen gebruiken vaste sleutels. De volledige en gedeeltelijke score zijn vraaggebonden, uit het officiële model. Bij open vragen geeft de leerling zelf een score na vergelijking met het model; dit wordt apart opgeslagen als `self`. Er is geen AI-nakijker of trefwoordgrader voor vrije antwoorden.

## Bronbestanden en verwerking

`sources.json` registreert de 32 relevante opgaven/correctievoorschriften en de drie Water-wijzigingsdocumenten, met officiële URL’s en SHA-256. Ook de 169 WebP-bronpagina’s hebben een controlehash. De afbeeldingen zijn ongewijzigde renders van de oorspronkelijke PDF-pagina’s. Ze bevatten soms meerdere vragen/bronnen; de leerling kan de volledige pagina vergroten. De vraagtranscriptie volgt de originele vraag; de instructie bij 2026-I vraag 20 is licht verduidelijkt en als zodanig gelabeld. Antwoordtabellen zijn in 18 vragen reflowed naar benoemde kaartvelden.

De belangrijke wijzigingen:

- 2019-I vraag 18: automatisch officieel punt wegens foutieve bron; in de trainer niet als meetvraag scoren.
- 2021-II vraag 15: optie D is door het erratum geschrapt.
- 2026-I vraag 29: deelpuntregel betreft een foutief geplaatste letter. De trainer controleert een volledige, unieke reeks en de weglating van één letter voor het deelpunt.

## Redactionele bestanden

- `editorial.txt`: per vraag de primaire leerroute, korte titel, eigen uitleg en aandachtspunt.
- `statements.json`: uitleg per afzonderlijke uitspraak.
- `distractors.json`: uitleg van foutieve enkelvoudige meerkeuzeopties; verschillen in tabelkolommen worden daarnaast uit de vaste kolomwaarden gegenereerd.
- `extracted.json`: oorspronkelijke extractie, als controlelaag vóór redactionele verwerking. Deze is niet de leerlingdataset.
- `editorial-review.json`: basiscontrole en formatverdeling.
- De definitieve leerlingdataset staat in `src/water/questions.json`.

De vragen zijn op nummering, punten, gesloten sleutels en wijzigingsregels gecontroleerd aan officiële tekst. De uitleg is redactionele leshulp, geen officiële uitbreiding van het correctievoorschrift. Voor twijfelgevallen kan de leerling altijd het officiële model openen. Aansluiting op de syllabus 2027 staat nog open.

## Reproductie

De verwerkingsscripts staan in `scripts/water-*.py`. Ze verwachten de eerder gedownloade officiële bestanden in `/workspace/examenbronnen`, de `pdftotext -layout`-extracties en de onderzoeksindex in `/workspace/examenanalyse`. De scripts gebruiken Python, PyMuPDF en Pillow. De app-build gebruikt uitsluitend de reeds gecontroleerde dataset en pagina-afbeeldingen; geen downloads of Python zijn nodig bij installatie, CI of gebruik door leerlingen.

Volgorde: `water-extract.py` → `water-editorial.py` → `water-polish.py` → `water-feedback.py`. Controleer bij hergeneratie de oorspronkelijke bronnen en eventuele nieuwe aanvullingen, en voer `npm test`, `npm run build` en `npm run test:pages` uit. Een succesvolle parser alleen vervangt geen inhoudelijke review.
