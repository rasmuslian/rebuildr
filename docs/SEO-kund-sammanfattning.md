# RebuildR SEO – vad vi har gjort

SEO-granskningen gav **38/100**. Efter våra åtgärder ligger bygget på **~75/100**
(samma nivå rapporten förutspådde). Sajten ser likadan ut – allt är "under huven".

## ✅ Fixat

- **Sidorna levereras nu färdiga** – Google, AI-tjänster och länkdelning ser allt
  innehåll direkt (förut: tomt skal). → *Detta är den enskilt största fixen.*
- **Egen titel + beskrivning på varje sida** (artiklar, partners, sök m.m.) – förut
  saknade halva sajten titel. → *artiklar kan nu ranka i Google.*
- **Riktiga rubriker (H1)** på varje sida. → *Google förstår vad sidan handlar om.*
- **Sitemap + robots.txt** som uppdateras automatiskt vid varje bygge. Sitemap:en
  innehåller statiska sidor, alla artiklar **och alla publicerade produkter/annonser**
  (sålda/borttagna utesluts). Skalar automatiskt till ett sitemap-index om
  produktantalet växer förbi 50 000. → *Google hittar alla annonser; nya kommer
  med av sig själva vid nästa bygge.*
- **Strukturerad data (JSON-LD)** för företag, sajt-sök och artiklar. → *snyggare
  Google-träffar + AI kan citera RebuildR.*
- **llms.txt** för AI-sökmotorer (ChatGPT/Perplexity). → *AI-synlighet.*
- **Korrekt länkdelning** (titel/bild/beskrivning i LinkedIn/Slack m.m.).
- **Riktig 404-sida** (markerad "indexera ej").
- **Snabbare upplevd laddning** (förrendering hjälper Core Web Vitals).
- **Automatiska alt-texter på bilder** – produktbilder, produktgalleri och
  partner-/hubb-loggor får beskrivande, nyckelordsrika alt-texter som genereras
  automatiskt från produkttitel/namn. → *bättre bild-SEO + tillgänglighet, helt
  utan manuellt arbete.*

## 🔧 Kvar att göra

**Vi kan fixa nu (i koden):**
- Författarnamn på artiklar (E-E-A-T).
- FAQ- och brödsmule-schema (extra rich results).
- WebP/AVIF-format på bilder (snabbare laddning).

**Swace behöver göra (drift/deploy):**
- Deploya det nya bygget (statisk export) till produktion.
- Sätta produktionsvärden för bygget: `EXPO_PUBLIC_SITE_URL=https://rebuildr.se`
  och produktions-API-URL.
- Ställa in Cloudflare så okända adresser returnerar statuskod **404** (inte 200).

**Backend (litet):**
- Rätta trasig footer-länk (`/www.rebuildr.se/signup` → `/signup`) i CMS:et.

## 📈 Effekt
Tekniska förbättringar syns i Google Search Console inom dagar. Ranking och trafik
växer normalt över 4–12 veckor. Länkdelning och AI-synlighet förbättras direkt vid
lansering.
