# AK MASTER v0.2

Nederlandstalige, responsive aardrijkskunde-webapp voor 4 vmbo-TL/mavo, ter voorbereiding op het CE 2027. Gebouwd met React, Vite en gewone CSS. Geen accounts, backend, externe API's of betaalde diensten.

## Lokaal starten

Gebruik Node.js 22.12+ (of 20.19+).

```sh
npm install
npm run dev
```

Open het adres dat Vite in de terminal toont. Vul bij het eerste bezoek je voornaam in.

```sh
npm test
npm run build
npm run preview
```

`npm run build` maakt de productieversie in `dist/`. `npm run preview` dient die versie lokaal op. Gebruik voor herhaalbare installatie met het meegeleverde lockbestand `npm ci`.

## GitHub Pages

1. Commit en push deze bestanden naar `main` van `Jimmyvandenboom/AK-MASTER-app-`.
2. Open op GitHub **Settings → Pages**. Kies onder **Build and deployment → Source** voor **GitHub Actions**.
3. De workflow in `.github/workflows/deploy.yml` installeert dependencies, voert de tests uit, bouwt de app en publiceert `dist/`. Indien nodig start je de workflow via **Actions → Deploy AK MASTER to GitHub Pages → Run workflow**.
4. Na een succesvolle deployment staat de app op **https://jimmyvandenboom.github.io/AK-MASTER-app-/**. De definitieve URL is ook zichtbaar bij de deployment en in Settings → Pages.

Vite gebruikt `base: '/AK-MASTER-app-/'`, zodat CSS, JavaScript en andere assets onder het juiste GitHub Pages-projectpad laden. Navigatie gebeurt binnen de app zonder aparte URL-routes, waardoor verversen geen Pages-404 veroorzaakt. De website wordt pas bijgewerkt na een succesvolle GitHub Actions-deployment; lokaal bouwen alleen publiceert niets. Als Pages alleen README-tekst toont, controleer dan of de appbestanden op `main` staan en de bron op GitHub Actions is ingesteld (niet Deploy from a branch).

## Inhoud en voortgang

- Home, Leren, Oefenen en Profiel werken. Alleen Water is actief; andere thema's staan op Binnenkort.
- Water behandelt infiltratie, verstening en wateroverlast met vijf originele meerkeuzevragen en uitleg.
- Goed antwoord: 20 XP, ook bij herhaling. Elk antwoord telt direct mee. Na de vijfde vraag telt de sessie zodra het resultaatscherm wordt geopend. Beste score wordt behouden.
- Voortgang op Home telt werkelijk beantwoorde vragen in blokken van vijf, inclusief herhalingen. Het is geen beheersingspercentage. Oefenen toont de voortgang van de lopende sessie.
- Voornaam, XP, aantal beantwoorde vragen, afgeronde sessies en beste score worden opgeslagen onder `ak-master-v1` in localStorage. Een lopende korte quiz wordt niet hervat na herladen of verlaten; opgeslagen totalen blijven behouden. De examentrainer bewaart daarnaast de invoer van de laatst geopende vraag. Wissen van browsergegevens verwijdert voortgang. Er wordt niets naar een server gestuurd. Bij geblokkeerde opslag verschijnt een waarschuwing.
- De aftelling gebruikt 21 mei 2027, 09:00 in Nederland (`2027-05-21T09:00:00+02:00`). Na dat moment blijft de teller op nul.
- De korte quiz bevat originele vragen. De Water-examentrainer bevat officiële examenvragen met eigen uitleg. Inhoud en examenplanning moeten later worden gecontroleerd aan de officiële syllabus en het officiële rooster voor 2027.

## Bestanden

- `src/main.jsx`: schermen en componenten, navigatie en quizflow.
- `src/data.js`: leeronderwerpen en originele oefenvragen.
- `src/storage.js`: opslagvalidatie, scores en aftelling.
- `src/styles.css`: responsive vormgeving en focus states; geen externe fonts of assets.
- `src/storage.test.js`: tests voor opslag, herhaling, tijdzone en vraagstructuur.
- `index.html`, `vite.config.js`, `package.json`, `package-lock.json`: ingang en buildconfiguratie.
- `.github/workflows/deploy.yml`: automatische GitHub Pages-publicatie.
- `.gitignore`: excludes voor dependencies en buildoutput.

## Controle op een wit scherm

De workflow controleert de productieversie met Chromium voordat `dist/` wordt gepubliceerd. De controle test JavaScript- en CSS-paden, renderen, quiz, opslag, navigatie en herladen onder `/AK-MASTER-app-/`. Hij controleert ook dat Pages als bron GitHub Actions gebruikt.

Lokaal dezelfde controle uitvoeren:

```sh
npm run build
npx playwright install chromium
npm run test:pages
```

Bij een bestaande Chromium-installatie kun je `CHROMIUM_PATH=/pad/naar/chromium npm run test:pages` gebruiken.

Een Pages-publicatie van bronbestanden bevat nog `src/main.jsx`: browsers kunnen dat bestand niet rechtstreeks als productie-app uitvoeren. Kies **Settings → Pages → Source → GitHub Actions**, en voer de deploymentworkflow opnieuw uit. Controleer dat de nieuwste run groen is en herlaad de website daarna met Ctrl+Shift+R (Mac: Cmd+Shift+R). Er zijn geen aparte URL-routes: de vier navigatieknoppen wisselen schermen op dezelfde Pages-URL.

## Water-examentrainer (v0.2)

Open **Oefenen → Water-examentrainer**, of direct `https://jimmyvandenboom.github.io/AK-MASTER-app-/#water`. De aparte H7-oefentoets is behouden. De examentrainer gebruikt geen account, API-sleutel of backend.

Alle 245 Water-vragen uit 16 GL/TL-examens (2018, 2019 en 2021–2026, tijdvak 1 en 2) zijn verdeeld over drie leerroutes:

- Water in Nederland: 109 vragen.
- Water in China: 46 vragen.
- Water in het Midden-Oosten: 90 vragen.

De vraag uit 2019-I nummer 18 kreeg wegens een foutieve bron officieel automatisch een punt. In deze trainer kan de leerling die bron bestuderen, maar de vraag telt niet als goed/fout. De voortgang telt daarom 244 verschillende beoordeelbare vragen. De erratumoptie D uit 2021-II vraag 15 is verwijderd; de aangepaste deelpuntregel voor 2026-I vraag 29 is verwerkt.

### Leerlingflow

- Oefen vijf vragen of kies zelf uit de vragenbank. Filters: thema, jaar, antwoordvorm en voortgang; daarnaast zoeken en vragen bewaren.
- Originele bronpagina’s zijn lokaal beschikbaar als WebP, met een vergrootvenster en 2× zoom. Kaarten en tabellen zijn ongewijzigd gerenderd uit de officiële PDF. De schermtranscriptie van een vraag staat ernaast; enkele antwoordtabellen zijn omgezet naar kaartjes met dezelfde inhoud. Bij een redactioneel aangepaste instructie staat dat vermeld.
- Meerkeuze, juist/onjuist, invulkeuzes, selecties en volgordevragen worden met de officiële sleutels en scoretabel nagekeken. Tekstinvoer bij gesloten invulkeuzes wordt op de verwachte keuze vergeleken, zonder AI; beperkte expliciete woordvarianten zijn ondersteund.
- Open vragen worden **zelf beoordeeld**: eerst zelf schrijven, dan vergelijken met het officiële model, uitleg en aandachtspunt, daarna 0–max punten kiezen. De app beweert niet vrije tekst inhoudelijk automatisch te beoordelen. Zelfbeoordeling blijft herkenbaar apart in resultaten en voortgang.
- Iedere vraag heeft eigen AK MASTER-uitleg. Foute meerkeuzeopties krijgen gerichte uitleg, fout beantwoorde uitspraken een uitleg per uitspraak. Herhaling telt niet dubbel voor het aantal verschillende nagekeken vragen.
- `ak-master-water-v1` in localStorage bewaart de laatste antwoorden, beoordeling, pogingaantal, bewaarde vragen en invoer van de laatst geopende vraag. Water-punten zijn gescheiden van de XP van de oorspronkelijke korte quiz. Wissen van browsergegevens verwijdert de voortgang.
- Hash-URL’s zoals `#water/2026-2-18` werken zonder serverroutes op GitHub Pages. Een oefenronde als geheel wordt niet na herladen hervat; de vraag en laatst bewaarde invoer wel.

### Inhoud en herkomst

`src/water/questions.json` bevat de vragen, sleutels, eigen uitleg en bronverwijzingen. De officiële bronregistratie en bestandscontrolesommen staan in `research/water/sources.json`. `research/water/editorial.txt`, `statements.json` en `distractors.json` bevatten de redactionele basis. De uitleg is een hulpmiddel; bij onduidelijkheid blijft het gelinkte officiële correctievoorschrift inclusief aanvulling leidend. Historische examendekking is geen garantie voor 2027: de syllabuscontrole staat nog open.

De lettervormgeving gebruikt lokaal gebundelde Atkinson Hyperlegible (400 en 700), ruimere regelafstand en lichte leeskaarten. De bestaande kaartstijl en het Expeditie-logo zijn behouden.

### Controle en onderhoud

```sh
npm test
npm run build
npx playwright install chromium
npm run test:pages
```

De tests controleren alle 245 datarijen, alle gesloten antwoordmodellen met juiste en foute antwoorden, deelpunten, officiële wijzigingen, opslag en herhaling. De productiebrowsertest oefent ook alle antwoordvormen, bronvergroting, zelfbeoordeling, bookmarks, filters, lege resultaten, hervatten en mobiele navigatie.

De scripts `scripts/water-extract.py`, `water-editorial.py`, `water-polish.py` en `water-feedback.py` documenteren de dataverwerking. Deze zijn niet nodig voor `npm install` of de build. Extractie vereist Python met PyMuPDF en Pillow, `pdftotext`, en de lokale bron-PDF’s en onderzoeksindex onder `/workspace/examenbronnen` en `/workspace/examenanalyse`. Na inhoudelijke wijziging moeten ook transcripties, bronkoppelingen en deelpuntregels worden gecontroleerd; automatische extractie alleen is geen inhoudelijke review.
