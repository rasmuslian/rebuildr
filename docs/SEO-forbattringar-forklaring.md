# SEO-förbättringar för rebuildr.se – förklaring för alla

> Den här texten förklarar i vanlig svenska vad vi har gjort, varför, och vad
> som behöver göras för att det ska fungera live. Ingen SEO-kunskap krävs.

## Problemet i en mening

När Google, Facebook/LinkedIn eller AI-tjänster (ChatGPT, Perplexity) besökte
rebuildr.se fick de en **tom sida**. All text och alla rubriker laddades in av
JavaScript *efteråt* – men många robotar väntar inte på det. Resultatet: sidan
var i praktiken osynlig i sök och såg tom ut när någon delade en länk.

Tänk dig att varje sida skickade ut ett tomt papper, och först när du själv
fyllde i texten för hand syntes innehållet. Robotar fyller inte i för hand.

## Vad vi har gjort (enkelt förklarat)

1. **Sidorna skickas nu färdigskrivna.** Varje sida (startsida, artiklar,
   partners osv.) levererar nu sin text, rubrik och titel direkt – innan
   JavaScript ens körts. Robotar ser allt på en gång.

2. **Varje sida har en egen titel och beskrivning.** Förut hade hälften av
   sidorna ingen titel alls. Nu får t.ex. varje artikel sin riktiga rubrik som
   sidtitel (det som syns i webbläsarfliken och i Googles sökträff).

3. **Riktiga rubriker.** Sidornas huvudrubrik är nu en "riktig" rubrik i kod
   (en s.k. `<h1>`), vilket Google använder för att förstå vad sidan handlar om.

4. **En karta över alla sidor (sitemap) och en instruktionsfil (robots.txt).**
   Två filer som hjälper Google hitta och förstå alla sidor. Sitemap:en byggs om
   automatiskt varje gång sajten byggs och innehåller startsidan, alla artiklar
   **och alla publicerade annonser/produkter** (sålda och borttagna utesluts så
   Google inte slösar tid på döda sidor). Den delas automatiskt upp i flera filer
   (sitemap-index) om antalet annonser växer förbi 50 000 – så det skalar för en
   marknadsplats. Nya annonser och artiklar kommer med av sig själva.

5. **Extra information för Google och AI** (s.k. strukturerad data + en
   `llms.txt`). Det hjälper Google visa snyggare sökträffar och gör att
   AI-tjänster kan citera RebuildRs innehåll korrekt.

6. **Länkdelning fungerar.** När någon delar en RebuildR-länk i LinkedIn/Slack
   visas nu titel, beskrivning och bild i stället för en tom ruta.

## Syns det någon skillnad för en vanlig besökare?

**Nästan ingen visuell skillnad – sajten ser likadan ut.** Förbättringarna är
"under huven" (titlar, koder, robotinstruktioner). De enda märkbara sakerna:

- Rätt titel visas nu i webbläsarfliken på varje sida.
- På artikelsidor visas en kort textingress direkt medan resten laddar in
  (en liten förbättring, ingen ny design).

Ingen layout, design eller funktion har ändrats.

## Förväntat resultat

Den externa SEO-granskningen satte betyget **38/100** och bedömde att de här
åtgärderna lyfter det till **ca 75/100**. Konkret:

- Google kan börja ranka artiklarna (de har bra innehåll men kunde inte ranka
  förut eftersom de saknade titlar).
- AI-tjänster kan hitta och citera RebuildR.
- Länkdelningar ser professionella ut.

Tekniska fixar syns i Google Search Console inom några dagar; effekt på
ranking/trafik tar normalt 4–12 veckor.

---

## För utvecklarna (Swace) – vad som krävs för att gå live

All kod är klar och verifierad lokalt (`expo export -p web` bygger korrekt,
typecheck rent). För att det ska fungera i produktion:

1. **Installera beroenden:** `npm install` i `rebuildr-app` (vi lade till
   `tsx` som dev-beroende för sitemap-genereringen).

2. **Produktionsmiljövariabler vid bygget** – dessa MÅSTE ha produktionsvärden
   när `npm run build:web` körs (sätts i 1Password `Frontend prod env`,
   Cloudflare-inställningar eller CI):
   - `EXPO_PUBLIC_SITE_URL=https://rebuildr.se` (viktigast – styr alla canonical-,
     og- och sitemap-länkar; finns en fallback men bör sättas explicit)
   - `EXPO_PUBLIC_API_URL=<produktions-GraphQL-URL>` (måste nås vid bygget så att
     artiklar räknas upp i sitemap och förrenderas)
   - `EXPO_PUBLIC_GTM_ID`, `EXPO_PUBLIC_STRIPE_PK`

3. **Servera den statiska exporten:** deployen måste leverera mappen `dist/`
   från `expo export -p web` – inte den gamla klient-renderade varianten.

4. **404 i Cloudflare:** låt hostingen returnera HTTP 404 för okända adresser
   och servera `+not-found.html` (löser "soft-404" i granskningen).

5. **Färskhet:** nya artiklar kommer med automatiskt vid varje bygge. För att
   de ska synas snabbt: trigga ett ombygge när en artikel publiceras (webhook)
   eller kör ett nattligt ombygge.

### Viktigaste filerna som ändrats
- `rebuildr-app/app/_layout.tsx` + `apollo/server-client.ts` – gör att sidor
  renderas färdiga (kärnan i hela fixen).
- `rebuildr-app/components/meta-data/rebuildr-head.tsx` – titlar, beskrivningar,
  strukturerad data.
- `rebuildr-app/app/(app)/article/[slug].tsx` – artiklar förrenderas med titel.
- `rebuildr-app/scripts/generate-sitemap.ts` + `lib/seo-fetch.ts` – sitemap.
- `rebuildr-app/public/robots.txt`, `public/llms.txt`.
