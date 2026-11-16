# GFR EXAM QUEST · Water Wars

De leerlingomgeving staat op [GitHub Pages](https://jimmyvandenboom.github.io/AK-MASTER-app-/quest/). Meld aan met je voornaam en de klascode van je docent. Via **Mijn code** kopieer je je persoonlijke herstelcode om op een ander apparaat verder te gaan. Deel die code alleen met jezelf.

## Spelen en oefenen

- Draai de wereldbol en kies Nederland, China of het Midden-Oosten. Elke regio heeft drie oefengebieden en een route **CE-bronnen**.
- De oorspronkelijke 72 oefenmissies blijven beschikbaar. Daarnaast zijn er 24 authentieke Water-opgaven uit het centraal examen, met bronbeelden en links naar Examenblad. Tik op een bronafbeelding om die groter te openen.
- Een eerste correct antwoord geeft 60 XP en 12 Geo Coins. Bij open antwoorden bewaar je je eigen antwoord en vergelijk je dit met het voorbeeldantwoord of officiële correctiemodel. De docent kan de ingestuurde antwoorden bespreken.
- De Daily Shop wisselt om middernacht in Nederland. Zes uitrustingsstukken en twee achtergronden komen uit een catalogus van 45 items. De gratis Battle Pass ontgrendelt tien eigen beloningen, met 180 XP per niveau.
- In Avatar Studio kies je een karakter en combineer je uitrusting en een achtergrond. Het uiterlijk, de aankopen, badges, XP en antwoorden verhuizen mee wanneer je met je persoonlijke code verder speelt.
- Na drie verschillende correcte antwoorden gaan Captain’s Memory en Rivierroute open. Iedere eerste correcte gesloten vraag geeft een vaste kans van 1 op 500 op de Pirate Token.
- Mission Control gebruikt het bestaande geautoriseerde docentaccount.

## Publicatie en backend

GitHub Actions test de app en publiceert de Vite-build inclusief `dist/quest`. Controleer bij een gemiste update de build- en deploystappen in Actions en vergelijk vervolgens de live HTML met de commit. De browserproef test desktop en een iPhone 13-viewport met een nagebootste API.

De Supabase Edge Function `exam-quest` gebruikt `index.ts` en `ce.json` uit `supabase/functions/exam-quest`. Voeg bij het deployen `public/quest/catalog.js` toe aan dezelfde map in de bundel als `catalog.js`. Dit houdt de client en server op dezelfde catalogus. Pas de SQL-migratie toe vóór de Edge Function. De functie valideert zijn bestaande hersteltokens en docent-JWT's zelf. Antwoorden en bijbehorende beloningen worden in één database-transactie opgeslagen.
