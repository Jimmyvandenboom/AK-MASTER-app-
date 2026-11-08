# GFR EXAM QUEST — Water Wars (pilot)

**Doel:** SE Water 4TL, 23 november 2026. Gebaseerd op de negen-wereldenvisie: eerst de drie waterhoofdstukken. **De game is een pilot**, geen voltooide CE-examendatabase. V2 omvat een interactieve globe, geïllustreerde subwereldkaarten en meer open vragen.

## Leerling
- Open `/AK-MASTER-app-/quest/` op GitHub Pages.
- Vul je **voornaam** en de **klascode** in die de docent geeft.
- Je krijgt een uniek profiel. De app onthoudt je herstelcode automatisch op dit apparaat.
- **Bewaar de herstelcode** wanneer je op een ander apparaat verder wilt. Deel de herstelcode niet.
- Draai de orthografische wereldbol en reis naar H7 (Nederland), H8 (China) of H9 (Midden-Oosten). Binnen de subwereld kies je een van drie hoofdstuk-acts en een checkpoint. Beantwoord de vraag, lees feedback en oefen opnieuw.
- Alle drie de subwerelden hebben 24 vragen: **10 gesloten en 14 open**. In totaal **72 vragen, waarvan 42 open**. Vragen zijn eigen, examenachtige oefenvragen en nog geen authentieke CE-opgaven.
- Gesloten vragen worden op de server gecontroleerd. Open vragen worden opgeslagen en tonen na inzending **het eigen antwoord naast een voorbeeldantwoord**, maar krijgen **geen automatische deelpunten**. De docent ziet ingestuurde open antwoorden in het dashboard.
- XP en Geo Coins krijg je uitsluitend voor een eerste correct antwoord op een unieke gesloten vraag.
- Video Boost verwijst naar NOS Stories-fragmenten; H9 heeft voorlopig een zoeklink.

## Docent
- Klik op **Docent** en log in met een bestaand geautoriseerd Supabase GFR-docentaccount (Supabase Auth wachtwoord).
- Het dashboard toont: leerlingen, H7/H8/H9-voortgang, XP, antwoorden, gemiddelde tijd, laatste activiteit, foutpatronen en maximaal 20 recente open antwoorden ter bespreking.
- De klascode wordt na docentlogin getoond. Deel deze uitsluitend met de klas.
- **Actieve tijd** is een schatting op basis van zichtbare browseractiviteit; geen garantie dat de leerling alle tijd echt heeft geleerd.
- Beheersing is op basis van **unieke juiste gesloten vragen**, niet op basis van aantal kliks.
- Dubbele voornamen zijn afzonderlijke leerlingprofielen; controleer eventueel later op dubbele aanmeldingen.

## Architectuur
- Frontend: `public/quest/index.html` (zelfstandig HTML + CSS + JavaScript); `public/quest/globe.js` tekent de roterende orthografische globe; `globe.css` en `levelmap.css` stylen de expedities. Naast AK MASTER, zonder diens onderdelen aan te passen.
- Publicatie: bestaande Vite/GitHub Actions + Pages-workflow kopieert `public/quest` naar `dist/quest`.
- Backend: Supabase Edge Function `exam-quest`, met acties `join`, `me`, `questions`, `answer`, `heartbeat`, `avatar`, `buy`, `teacher`.
- Datatabellen: `quest_classes`, `quest_students`, `quest_attempts`, `quest_rewards`, `quest_purchases`.
- RLS aan en geen clientpolicies op de quest-tabellen; lezen/schrijven alleen via gecontroleerde Edge Function.
- Studentauthenticatie: 192-bit willekeurig hersteltoken waarvan uitsluitend SHA-256-hash op de server wordt opgeslagen.
- Docentautorisatie: Supabase Auth JWT + bestaande `energy_teachers`-tabel.
- Credits alleen server-side en eenmaal per unieke juiste vraag. Geo Shop gebruikt een server-side transactie.
- Docentlogin gebruikt rechtstreeks Supabase Auth REST; er is geen runtime afhankelijkheid van een extern JavaScript-CDN. API-sleutels met serviceprivileges worden nooit in de browser opgenomen.

## Wat nog NIET klaar is
- Authentieke CE-opgaven 2017–2026 met originele bronnen, vraag-correctiemodelmapping: nog **niet ingebouwd**; huidige 36 vragen zijn eigen, syllabusgerelateerde oefenvragen.
- Volledige H8/H9-boekteks­ten ontbreken nog; vragen zijn voorlopig gebaseerd op de aanwezige leerdoelen en begrippen.
- Automatische AI-correctie van open vragen: **niet geactiveerd**; hiervoor zijn een afzonderlijke AI-API, kostencontrole en validatie nodig.
- De game heeft nu een getekende roteerbare wereldbol met geografische hotspots, reisanimatie en drie geïllustreerde 2,5D-achtige landschapkaarten met drie acts en checkpoints. **Dit is nog geen volledige vrij rondlopende 3D-avatar en de kunst is nog geen professioneel uitgewerkte 3D-assetset**.
- Statische frontend-syntax en vraagschema zijn gecontroleerd, en de Supabase credit- en aankoopfuncties zijn transactioneel getest. Een geautomatiseerde Playwright-smoketest is toegevoegd aan GitHub Actions. **De geslaagde live deployment en echte browser- en docent-login-proef zijn nog niet bevestigd.**
- Een volledig examen onder tijdsdruk, CE-eindbaas en live gepushte docentenweergave (nu handmatig verversen): gepland.

## Didactische uitgangspunten
- Retrieval practice: eerst antwoord proberen, daarna feedback.
- Spacing: herhaalknop; volledig geautomatiseerde planningsengine volgt later.
- Interleaving: vrij wisselen tussen H7/H8/H9; automatische gemengde opdrachten volgen later.
- Beheersing is gescheiden van XP en tijd.
- Open vragen zijn leerzaam om te oefenen, maar de voorlopig getoonde voorbeeldantwoorden mogen niet als geautomatiseerde examennormering worden opgevat.

## Versie 2: kernbeslissingen
- Wereldbol volledig client-side in canvas, zonder externe WebGL-afhankelijkheid; iconen tonen H7/H8/H9-hotspots.
- Twaalf extra open vragen per hoofdstuk, samen met de twee oorspronkelijke open vragen = 14 open vragen per hoofdstuk.
- Boss Battle bestaat nu uit drie open en twee gesloten vragen. Er wordt geen valse CE-score voor open antwoorden geclaimd.
- Werelden Klimaat en Bevolking blijven zichtbaar als toekomstige uitbreidingen.
- De leerlaag blijft in Supabase, gescheiden van de visuele kaart: uitbreidbaar naar andere vakken.

## Veiligheids-/testcheck vóór de les
1. Test 2 nieuwe leerlingprofielen met de klascode.
2. Maak een correct en fout antwoord; sluit af, heropen, controleer voortgang.
3. Test dubbele aankopen/XP-aanvragen; controleer in dashboard.
4. Log in als docent, controleer leerlinggegevens en lesadviezen.
5. Test op schoollaptop en schoolwifi. Controleer dat externe ES module en API bereikbaar zijn.
6. Neem testaccounts niet op in de analyses van echte leerlingen.
7. School-AVG-afspraken, privacyverklaring, bewaartermijn en toegang via school-ICT controleren.

## Bronnen
- Projectbestanden De Geo: 4KGT leerdoelen, Water begrippen, H7 theorie en docenttoetsvragen.
- NOS Stories Eindexamenspreekuur AK vmbo GL/TL 2026, onderwerp-tijdcodes.
- Camp et al. (2026): meta-analyse retrieval/spacing/interleaving in klaslokalen.
