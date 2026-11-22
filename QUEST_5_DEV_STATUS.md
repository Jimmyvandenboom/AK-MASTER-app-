# GFR Exam Quest 5.0 — Development branch

**Branch:** `feature/gfr-quest-5-foundation`
**Status:** development only — **do not merge or publish without a green CI run and manual browser review**.

## Goals completed in this branch
- First personal expedition-camp lobby, driven by existing student XP and read-only profile data
- Responsive geography atlas for H7 Netherlands, H8 China, H9 Middle East
- Central actions to existing shop, Avatar Studio, personal quest and knowledge boost
- Light/dark CSS and reduced-motion support
- Legacy question/map/quiz views retained
- Battle Pass navigation hidden (existing rewards preserved)
- Added Quest 5 unit tests and adapted Playwright smoke assertions
- Added a branch-only GitHub Actions workflow which does not deploy to Pages

## Safety
- No SQL schema or row mutations performed
- No Supabase student data extracted; only aggregate row counts inventoried
- Existing authentication and recovery flow untouched until migration strategy is tested
- `main` is unchanged, as is the live student URL
- The new UI is **not yet a final 3D geographic engine**; it is the phase-2 styling/interaction foundation

## Test requirements before a preview release
1. `npm ci && npm test && npm run build`
2. `npx playwright install --with-deps chromium`
3. `npm run test:pages && node scripts/check-quest.mjs`
4. Verify desktop light/dark, mobile scrolling and tap targets, old accounts and recovered sessions
5. Inspect design on at least 390px mobile and 1365px desktop
6. Confirm Supabase rewards/purchases/attempts match before and after testing with nonproduction test players
7. Publish only after explicit approval

## Next development
- Replace initial CSS diorama/illustrated region previews with a true performant isometric terrain renderer
- Build an authenticated player login migration without discarding old recovery codes
- Confirm review of complete CE source and AI grading workflows
- Add accessible focus and navigation tests for all major controls

## Supabase snapshot (22 Nov 2026, aggregate counts only)
`quest_students`: 31; `quest_attempts`: 529; `quest_purchases`: 18; `quest_rewards`: 207.

These counts are an **inventory**, not a database backup. A real backup/export remains required before any migration.

## Development increment: vector atlas (22 Nov 2026)
- Added `public/quest/v5-terrain.js` with three self-contained SVG isometric geography miniatures: Dutch polder/dikes, Chinese river/mountains/dam, Middle East arid land/oasis.
- Connected the miniatures to existing clickable geography regions in `v5-lobby.js`; updated mobile styling and unit/browser test assertions.
- Ran eight direct runtime checks of atlas markup/navigation, progress immutability, labels and escaping — **8/8 passed**.
- This is **not a claim of Playwright success**. CI status was not returned by the GitHub status API; full build/browser verification remains a release blocker.
- Production Pages remains on `main`, no database writes occurred.

## Ontwerpkeuzes voor GFR Exam Quest 5.0

De 29 keuzes van 22 november vormen het ontwerp voor de volledige game. Fase 1–2 richt zich op lobby, wereldkaart en HUD.

- Wereld en kamp (1–6, 17–19) — Geo Adventure 3D, een interactieve wereldkaart op een miniatuuraarde, een levende wereld met geheimen, een persoonlijke lobby en een eenvoudige avatar-editor met een spectaculaire uitstraling. Het expeditiekamp groeit automatisch. De vragen krijgen een rustige presentatie en de beloningen mogen uitbundig zijn.
- Voorwerpen en samenspel (7–8, 13–16) — power-ups met effect op het spel, avataritems, uiteenlopende beloningen, arcade- en geografische minigames en een verzameling met zeldzame vondsten. Klasgenoten kunnen met veilige schermnamen hun avatar, huisdieren, vondsten en prestaties laten zien. Klassementen en uitdagingen horen bij Social Adventure. Openbare chat valt buiten het ontwerp. De Battle Pass is uitgesteld.
- Examentraining (9–12, 22–26) — Complete Exam Adventure, Adventure Mode en Exam Mode, een adaptieve kennisboost, persoonlijke leerroutes en een Exam Boss. Leerlingen kunnen bij open vragen met deelpunten zowel AI-feedback als het correctiemodel gebruiken. De examentrainer omvat onderwerpen, oude examens, samengestelde toetsen en passende weergave van bronnen. De moeilijkheid van het spel past zich aan.
- Begeleiding en afwerking (20–21, 27–29) — een docent ziet voortgang, moeilijke onderwerpen en veelgemaakte fouten. De beoogde toegang gebruikt spelersnaam en pincode. Geluid, een feedbackknop voor leerlingtesters en een evenwicht tussen leren en spelen horen bij de volledige vernieuwing.

## Gecontroleerd in fase 1–2

De draaibare aarde gebruikt kustgegevens van Natural Earth. Regiokaarten openen de bestaande missies. Het kamp toont de volgende zichtbare verbetering en de benodigde XP. De desktoptest gebruikt Chromium, de mobiele ontwikkeltest gebruikt WebKit met een iPhone 13-profiel. Beide gebruiken fictieve spelers en gesimuleerde API-antwoorden. De [geslaagde run met screenshots](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45016917412) bevat de productiebuild, de tests en vier beelden van de lobby en atlas. Een test op een fysieke iPhone en een volledige beoordeling van de 3D-uitwerking staan nog open.

## Voortgang, toegankelijkheid en gegevenscontrole

- De lobby toont het aantal goed beantwoorde gesloten vragen ten opzichte van het werkelijke aanbod in de gekozen regio. De balk heeft een naam en waarde voor schermlezers en verdwijnt als er voor die regio geen gesloten vragen beschikbaar zijn.
- De regioknoppen hebben duidelijkere toetsenbordfocus en de actietekst in het lichte thema heeft een gemeten contrast van 7,08:1. Bij verminderde beweging vervalt ook de verschuiving van kaartillustraties. De kleinere lobbyknoppen hebben een minimaal tikgebied van 44 px.
- Zeven renderertests zijn rechtstreeks uitgevoerd, inclusief de regressietest voor de nieuwe voortgangsbalk. De Playwright-test bevat nu een controle dat die balk de gesimuleerde voortgang na herladen opnieuw toont. De eerder bevestigde groene workflowrun hoort bij commit `89bbc56`. [Run 45022191126](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45022191126) bevestigt de productiebuild, unit tests en browsertests voor commit `016ea49`. Chromium test de voortgang na herladen. Mobiel WebKit test op 375, 390 en 430 px het beantwoorden van een vraag via aanraking, plus de lobby, regiokaart, theorie, shop en Avatar Studio. De workflow levert vier screenshots op.
- Een nieuwe controle van Supabase leverde dezelfde totaaltellingen op als de eerdere inventarisatie. RLS is actief op alle zes Quest-tabellen en er zijn geen directe RLS-policies voor deze tabellen. De controle las uitsluitend tabelmetadata en totaaltellingen. Er is geen migratie of databasewijziging uitgevoerd.
- Toegang gebruikt momenteel een willekeurige herstelcode waarvan de server een hash opslaat. Naam met persoonlijke pincode en begrenzing van aanmeldpogingen moeten nog worden uitgewerkt en getest op een aparte testomgeving. Bestaande herstelcodes moeten bruikbaar blijven.


## Leerling- en docentproef

De meest recente groene browserworkflow gebruikte een fictieve leerling en een nagebootste API. De leerling doorliep een meerkeuzevraag met eerst een fout antwoord en daarna het juiste antwoord, leverde een open antwoord in, sloot de browser en ging in een nieuwe browsersessie verder. De herstelcode is ook getest in een lege browsersessie. De proef controleert dat XP, opgeslagen antwoorden, regiovoortgang en de volgende oefenvraag na terugkeer kloppen.

Dezelfde nagebootste klas gaf de docent één testleerling, diens voortgang, XP, actieve oefentijd en opgeslagen open antwoord. De docent wisselde van klas, ververste het overzicht en logde uit. De leerlingtest schreef niet naar de echte Supabase-data en gebruikte geen echt docentaccount.

De eerste Examentrainer Water is toegevoegd. Leerlingen kunnen beschikbare examenvragen per jaar en tijdvak openen, met links naar de volledige opgave en het correctievoorschrift. De browserproef opent een voorbeeldvraag en keert terug naar de lijst. Een complete examendekking 2017–2026 en de grotere 5.0-onderdelen uit het ontwerp zijn nog niet klaar.

[Groene testworkflow](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45032098868) omvat npm-tests, productiebuild, pagina-smoketest en de leerling-, docent- en mobiele browsertests. De screenshots staan als workflow-artifact klaar. Geen echte account- of leerlingrecords zijn voor deze browsertest gebruikt.


## Shopartikel met een effect op oefenen

De shop bevat nu het Kompas van inzicht. Na aankoop kan een leerling per meerkeuzevraag één fout antwoord laten wegstrepen. Het gebruik wordt in het bestaande Quest-profiel opgeslagen, zodat dezelfde hint bij hervatten niet opnieuw gebruikt kan worden. De Avatar Studio toont dit artikel bij de game-upgrades en laat het niet als draagbaar kledingstuk behandelen. De browsertest koopt het kompas met fictieve coins en test het effect in de meerkeuzevraag.


## 22 november: metgezellen en leerlingfocus

De shop bevat nu drie koopbare dieren met eigen profielvak. In Avatar Studio kiest de leerling één metgezel; het serverprofiel bewaart de keuze en de avatar toont het dier in de HUD en studio. Het Kompas van inzicht blijft een aparte game-upgrade.

In Mission Control kan de docent per leerling foutclusters op basis van opgeslagen pogingen en het aantal nog niet nagekeken open antwoorden uitklappen. De bestaande klasfilter, gemiddelde oefentijd en H7–H9-voortgang blijven beschikbaar.

De fictieve leerlingtest koopt een Kompas en Dijkvos, kiest de metgezel, start opnieuw in een verse browsersessie en controleert dat de voortgang en het dier terugkomen. De docenttest controleert de eigen analyse van Sam, een klaswissel, verversen en uitloggen. Chromium en mobiel WebKit (375, 390 en 430 px) zijn groen in [workflow 45040196363](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45040196363). De tests gebruiken nagebootste API-antwoorden; echte leerlingrecords en Supabase-voortgang zijn niet gewijzigd.

De resterende grote onderdelen blijven: complete examendekking en bronverzameling, Social Adventure met veilige opt-in, verder uitgewerkte gamewerelden, pincode-login naast herstelcodes en uitgebreide toegankelijkheidstests. Dit is een ontwikkelbranch en geen release van de live omgeving.


## 22 november: volledige beschikbare waterbank in de examentrainer

Quest laadt nu alle 245 bronvragen uit de bestaande waterbank, met antwoordmodel, punten, links naar examen en correctievoorschrift en 169 lokale bronafbeeldingen. De extra vraagbanktests vergelijken iedere import met de oorspronkelijke brondata, controleren de antwoordindexen en bestaan van de afbeeldingen. De bestaande 24 handmatig samengestelde items zijn vervangen door deze volledige vraagbank.

De hoofdstukkaart toont examenmissies in pagina's van acht checkpoints, zodat lange examensets binnen de kaart passen. De examentrainer groepeert iedere vraag op jaar en tijdvak. De beschikbare bank bevat 2018, 2019 en 2021–2026. De volledige examens van 2017, tijdvak I en II, zijn nu in de Examentrainer als PDF te openen, inclusief correctievoorschriften. Deze archiefkopieën zijn nog niet per vraag in de interactieve vraagbank opgenomen en hebben geen lokale bronbeelden. In 2020 is wegens corona geen centraal examen afgenomen, dus voor dat jaar bestaat geen CE-vraagbank om toe te voegen. Bron: [Examenblad over oude examens](https://www.examenblad.nl/2025/veelgestelde-vragen) en [Examenblad over 2020](https://www.examenblad.nl/2020/onderwerpen/errata-cse1).


## Laatste groene controle — 22 november 2026

[Workflow 45041748931](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45041748931) is groen op commit `8b960ff`. Alle stappen zijn geslaagd: npm-tests, productiebuild zonder publiceren, pagina-smoketest en de Chromium/WebKit-browsertests. Die browsertests controleren op desktop en 375, 390 en 430 px onder meer de testleerling, docentweergave, bewaren en hervatten van voortgang, shopaankoop, metgezelkeuze, examencheckpoints en laden van een echte lokale examenbronafbeelding. De nieuwste controle bevestigt ook dat het Kompas na gebruik bij dezelfde vraag niet opnieuw beschikbaar komt na opnieuw openen.

De leerlingen- en docentflow gebruikt fictieve accounts en nagebootste API-antwoorden. Er zijn geen echte leerlingrecords, docentaccounts of Supabase-voortgang gewijzigd. De run controleert de ontwikkelbranch; dit is geen handmatige review of vrijgave van Quest 5.0.


## HUD-streaks en archiefexamens — 22 november 2026

De lobby toont nu opeenvolgende oefendagen en goede gesloten antwoorden achter elkaar, berekend uit de al opgeslagen poginggeschiedenis. Oefendagen volgen de Amsterdamse kalenderdatum; een open antwoord telt niet als een goed gesloten antwoord. Er is geen nieuw opslagveld of SQL-wijziging nodig. De unit-tests controleren een reeks over meerdere dagen, reset na een gemiste dag en de behandeling van open antwoorden. De Playwright-proef controleert dat oefendag en antwoordreeks na opnieuw aanmelden in een verse browsersessie zichtbaar blijven.

De Examentrainer bevat daarnaast directe PDF-links naar 2017 tijdvak I en II en hun correctievoorschriften. Die volledige examens zijn beschikbaar naast de interactieve vraagbank; hun losse vragen en bronbeelden zijn nog niet geïmporteerd.

[Groene workflow 45042932040](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45042932040) is geslaagd op commit `757692b`: unit-tests, productiebuild zonder publiceren, pagina-smoketest, desktop-Chromium en mobiele WebKit op 375, 390 en 430 px. De browsertests gebruiken fictieve leerling- en docentaccounts met gesimuleerde API-antwoorden; echte Supabase-data is niet gewijzigd.


## Game Hub — 22 november 2026

De nieuwe HUD toont nu ook directe ingangen naar de bestaande Chapter Boss en Memory Quest. Unit-tests en Playwright controleren dat beide knoppen in de Game Hub staan en zichtbaar zijn in de leerlingomgeving. De bestaande vraag- en voortgangslogica is hergebruikt.

[Groene workflow 45043766782](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45043766782) is geslaagd op commit `ac3f784`: unit-tests, productiebuild zonder publiceren, pagina-smoketest, desktop-Chromium en mobiele WebKit op 375, 390 en 430 px. De browsertests gebruiken fictieve leerlingen/docenten en gesimuleerde API-antwoorden.


## Laatste controle voor de leerlingpreview — 22 november 2026

[Workflow 45076120640](https://github.com/Jimmyvandenboom/AK-MASTER-app-/actions/runs/45076120640) is groen op commit `078577224a2598e0e973b59a7bf1aca6ecc3913a`. Unit-tests, productiebuild zonder publiceren, pagina-smoketest en de Quest-browsertests voor desktop en mobiel zijn geslaagd. De checks omvatten een fictieve testleerling, docentresultaten, antwoorden, opslaan en hervatten in een nieuwe sessie, shop/hint, metgezel, examentrainer en lokale examenbronnen. Mobiel WebKit test 375, 390 en 430 px; desktop gebruikt Chromium.

De interactieve waterbank is uitgebreid van 245 naar 253 vraagrecords. Daarvan zijn acht meerkeuzevragen uit 2017 tijdvak I en II toegevoegd met antwoordmodel, uitleg en lokale bronbeelden. De overige vragen uit de volledige 2017-PDF's zijn nog niet per vraag interactief.

### Feedbackcontrole

- De PR heeft op 22 november geen review-, inline- of discussieopmerkingen.
- De 29 vastgelegde ontwerpkeuzes zijn gecontroleerd tegen de status hierboven. Lobby/wereldkaart, shopitems, minigames-ingangen, adaptief oefenen, examentrainer, docentfocus, feedbackmogelijkheid als ontwerpkeuze en een aantal toegankelijkheidsmaatregelen zijn beschreven of deels gebouwd.
- De volgende ontwerpkeuzes zijn nog niet volledig uitgevoerd: Social Adventure en veilige opt-in, rijkere wereld/game-uitwerking, naam-en-pincode-login naast bestaande herstelcodes, brede toegankelijkheidscontrole en volledige interactieve examendekking. Battle Pass blijft uitgesteld zoals in de ontwerpkeuzes staat.
- Er zijn geen losse leerlingfeedbackreacties of feedbackknopinzendingen aan deze branch of PR beschikbaar om individueel af te vinken. Daarom is “alle feedback verwerkt” niet aangetoond; de openstaande punten staan expliciet hierboven.

De workflow gebruikt nagebootste leerling- en docent-API-antwoorden. Geen live Pages-publicatie, echte accounttest of wijziging aan Supabase-leerlingrecords is uitgevoerd.