# AK MASTER v0.1

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
- Voornaam, XP, aantal beantwoorde vragen, afgeronde sessies en beste score worden opgeslagen onder `ak-master-v1` in localStorage. Een lopende quiz wordt niet hervat na herladen of verlaten; opgeslagen totalen blijven behouden. Wissen van browsergegevens verwijdert voortgang. Er wordt niets naar een server gestuurd. Bij geblokkeerde opslag verschijnt een waarschuwing.
- De aftelling gebruikt 21 mei 2027, 09:00 in Nederland (`2027-05-21T09:00:00+02:00`). Na dat moment blijft de teller op nul.
- De vragen zijn geen officiële examenvragen. Inhoud en examenplanning moeten later worden gecontroleerd aan de officiële syllabus en het officiële rooster voor 2027.

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
