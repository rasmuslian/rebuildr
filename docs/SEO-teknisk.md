# SEO – teknisk dokumentation (rebuildr-app)

Hur den server-renderade SEO-uppsättningen fungerar, vad som byggs, och vad
hostingen (DigitalOcean App Platform + Cloudflare) måste göra för att det ska
fungera live. För affärsöversikt, se `SEO-forbattringar-forklaring.md`.

## Arkitektur

`rebuildr-app` är en Expo Router 6 / React Native Web-app. Webben exporteras som
**statisk HTML** (`web.output: "static"` i `app.json`). Tre delar gör SEO möjligt:

1. **SSR upplåst i `app/_layout.tsx`.** Tidigare returnerade layouten `null` tills
   Apollo + fonts laddats i en `useEffect` — vilket aldrig körs under Node-exporten,
   så varje sida exporterades tom. Nu renderas `<Slot/>` direkt. På servern
   (`typeof window === "undefined"`) används en synkron Apollo-klient utan auth-länk
   (`apollo/server-client.ts`); i klienten den vanliga async-initierade klienten.
   `app/(app)/_layout.tsx` blockerar bara inloggade (`isLoggedInVar() && !data`).

2. **`generateStaticParams`** i dynamiska routes (`app/(app)/article/[slug].tsx`)
   räknar upp alla slugs vid build, så varje artikel förrenderas till en egen
   HTML-fil i stället för att falla tillbaka till SPA-skalet.

3. **Metadata per route** via `components/meta-data/rebuildr-head.tsx` (`RebuildrHead`):
   titel, description, canonical, OG och JSON-LD. Finns på home, artiklar, partners,
   hubbar, signup, product-list, sök.

## Viktigt: JSON-LD renderas i body, inte i `<Head>`

`expo-router/head` (react-helmet) emitterar **inte** `<script>`-taggar till den
statiska HTML:en — bara `title`/`meta`/`link`. Därför renderas JSON-LD som ett
**web-only DOM-`<script>`** i komponentträdet (giltigt var som helst i dokumentet,
läses av Google/AI), guardat med `Platform.OS === "web"` så React Native aldrig
försöker rendera ett element den inte stödjer. Se `RebuildrHead`.

## Semantiska rubriker

`components/typography/text.tsx` har en `heading?: 1|2|3|4|5|6`-prop. På webben →
`role="heading"` + `aria-level` (RN Web ger ett äkta `<h1>`-ekvivalent som Google
behandlar som rubrik); på native → `accessibilityRole="header"`.

## Sitemap & robots

- `public/robots.txt` — statisk, pekar på `/sitemap.xml`.
- `public/llms.txt` — statisk, för AI-sökmotorer.
- **`sitemap.xml` genereras vid varje bygge** av `scripts/generate-sitemap.ts`
  (körs via `tsx` före `expo export`). Den hämtar alla artiklar + alla PUBLICERADE
  produkter via `lib/seo-fetch.ts` och skriver `public/sitemap.xml`. Över 45 000
  URL:er delas den automatiskt upp i ett **sitemap-index** + chunkade filer.
  `public/sitemap*.xml` är gitignorerad (byggs färsk varje gång).
- `lib/articles-seo.generated.json` (committad som `{}`-platshållare) fylls vid
  bygget med `slug → {title, excerpt}` så artiklar får server-renderad titel +
  textutdrag utan klient-fetch.

## Bygg & env

```bash
npm install                 # tsx ingår nu i dependencies (krävs av sitemap-skriptet)
npm run build:web           # lokalt: op run + tsx generate-sitemap + expo export → dist/
npm run build:web:ci        # CI/hosting: tsx generate-sitemap + expo export (ingen op)
```

`build:web:ci` är till för hosting/CI där env injiceras av plattformen (inte 1Password).

## Deploy (DigitalOcean App Platform)

Appen `rebuildr-app` är en DO-service: bygger med `expo export`, kör `npx serve dist`,
auto-deployar vid push till `main` (`deploy_on_push`). Aktuell App Spec, och vad som
behöver justeras:

1. **Byggkommando — MÅSTE ändras.** Idag: `npx expo export --platform web`. Det kör
   **inte** sitemap-generatorn, så `sitemap.xml` saknas och artiklarna tappar sina
   titlar (titel/utdrag kommer från `articles-seo.generated.json` som generatorn
   fyller). Ändra till: **`npm run build:web:ci`**.
2. **Env — redan korrekt.** `EXPO_PUBLIC_SITE_URL`, `EXPO_PUBLIC_API_URL`
   (`https://api.rebuildr.se`), `GTM_ID`, `STRIPE_PK` är satta som `RUN_AND_BUILD_TIME`.
   Inget att göra.
3. **Routing — redan OK.** `serve dist` lämnar ut riktiga filer först (förrenderade
   sidor, `robots.txt`, `sitemap.xml`). Inget att ändra.
4. **404 (lågprio):** `serve dist --single` ger soft-404 (okända adresser → `index.html`
   200). Att ta bort `--single` fixar det men 404:ar djuplänkar till klient-bara routes
   (konto, köp, ej förrenderade produkter). Lämna tills en mer granulär lösning finns.

> Obs: nuvarande `main`-deploy felar (`DEPLOYMENT_FAILED`) — separat infra-problem som
> måste lösas innan något (vårt eller annat) når live.

## Verifiering

```bash
npm run build:web
npx serve dist -l 5050
```
Visa sidkälla på sidorna och kontrollera: `<title>`, `<meta name="description">`,
`<link rel="canonical">`, `<h1 role="heading">`, `application/ld+json`. Bekräfta
`dist/robots.txt`, `dist/sitemap.xml` (artiklar + `/product/<id>`).

## Övrigt

- Trasig footer-länk `/www.rebuildr.se/signup` → `/signup` ligger i backend-CMS
  (footer via GraphQL `LIST_FOOTER_SECTION`), inte i appkoden.
- Native (iOS/Android) opåverkat: all SEO är web-only eller plattformsneutral.
  `_layout`-ändringen påverkar uppstartssekvensen marginellt — värt en snabb
  device-QA (inloggning).
