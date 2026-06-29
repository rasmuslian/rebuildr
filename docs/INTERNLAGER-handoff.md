# Internlager — handoff (PR #3)

> Översikt av **vad** som byggts och **hur**, så att Rasmus (och en LLM som
> jobbar i koden) snabbt kommer in. Grenen `feat/internlager` är fristående och
> kan mergas till `staging` för sig. Den innehåller **inte** "kommande
> annonser" (det är en egen PR, #2).

## 1. Mål
Företag ska kunna ha ett **internt lager** av artiklar i appen, byggt på exakt
samma annons-flöde och design som Rebuildrs vanliga annonser — men med valet att
publicera **internt** (bara för det egna företaget) eller **externt** (öppna
marknaden). Dessutom AI-import som fyller samma lager från en artikellista
(CSV/Excel) och/eller foton.

Tre byggstenar:
1. **Organisationsmodell** — företag delar ett internlager via medlemskap + inbjudningar.
2. **Synlighet på Product** — `PUBLIC` vs `INTERNAL`, knutet till en organisation.
3. **AI-import** — lista/foton → strukturerade interna `Product`-rader (bild genereras bara när den saknas).

## 2. Datamodell

### Product (utökad) — `rebuildr-backend/src/entities/product.entity.ts`
- `visibility: ProductVisibilityEnum` (`PUBLIC` | `INTERNAL`), default `PUBLIC`, enumName `product_visibility_enum`.
- `organizationId?: string | null` — **plain FK-kolumn utan ORM-relation** (medvetet, för att undvika import-cykel mellan entiteter). Sätts när en annons blir `INTERNAL`.

### Organisation — tre entiteter
- `organization.entity.ts` — företaget/lagret (org-modellen fanns delvis innan: `organization.service.lookupOrganizationNumber` + migrationen `1743163878149-add-organization-to-user.ts` är äldre; vi har byggt vidare).
- `organization-membership.entity.ts` — kopplar `User` ↔ `Organization` (vem som delar lagret).
- `organization-invite.entity.ts` — inbjudan med token, accepteras av mottagaren.

### File (utökad) — `file.entity.ts`
- `externalUrl?: string` — för AI-genererade bilder som ligger lokalt i stället för S3/Spaces. `file.service.getUrl()` returnerar `externalUrl` direkt om satt (bypassar S3, se §5).

## 3. GraphQL-API

### Organisation — `organization.resolver.ts`
- `query myOrganization` → `MyOrganizationView` (org + medlemmar + inbjudningar för inloggad användare).
- `mutation inviteOrganizationMember(input: InviteOrganizationMemberInput)` → `OrganizationInvite`.
- `mutation acceptOrganizationInvite(token: String)` → `OrganizationMembership`.

Service: `organization.service.ts` — `getOrCreateUserOrganization`, `getUserOrganizationIds`,
`getMyOrganization`, `listMemberships`, `listInvites`, `inviteMember`, `acceptInvite`
(plus äldre `lookupOrganizationNumber`, `getOrganization`).

### AI-import — `inventory.resolver.ts`
- `mutation aiImportInventoryImages(images: [String])` → `[Product]` — ett foto per artikel, **bilden som laddats upp behålls** (ingen generering).
- `mutation aiImportInventoryDocument(file: String, mimeType: String)` → `[Product]` — CSV/Excel (base64). Genererar bild med Gemini **bara när artikeln saknar bild**.

Service: `inventory.service.ts` (`aiImportFromImages`, `aiImportFromDocument`) delegerar till `ai.service.ts`.

### Synlighet/publicering — `product.resolver.ts` + `product.service.ts`
- `UpdateProductInput.visibility?: ProductVisibilityEnum` — sätt `INTERNAL`/`PUBLIC` på en annons. När `INTERNAL` sätts knyts annonsen automatiskt till användarens organisation (`getOrCreateUserOrganization`).
- `ProductsInput.visibility?: ProductVisibilityEnum` — filter. **Utelämnat = bara `PUBLIC`** (öppna marknaden visar aldrig interna annonser). `INTERNAL` är ägar-/org-begränsad i `findAll` (se kommentarer kring rad 346 och 714 i `product.service.ts`).

## 4. AI-import — hur den fungerar (`ai.service.ts`)
- `analyzeInventoryFromText(...)` — CSV/lista → delar upp i artiklar → `runInventoryAnalysisOnParts(..., generateImages=true)`.
- `analyzeInventoryFromImages(...)` — per foto; kör analys och **fäster det uppladdade fotot** (`saveLocalProductImage`), ingen generering.
- `runInventoryAnalysisOnParts(...)` — kör Gemini (text-extraktion, JSON-läge), bygger `Product` via `buildInternalProduct`, och vid behov `generateProductImage`.
- `buildInternalProduct(...)` — mappar AI-fält → `Product` (titel, beskrivning, pris-spann, kategori, kvantitet, mått m.m.). Sätter `visibility = INTERNAL`.
- `generateProductImage` / `saveLocalProductImage` — Gemini-bildgenerering + spara lokalt (se §5).

Gemini-modeller: `gemini-3-flash-preview` (text, JSON), `gemini-2.5-flash-image` (bild).

> **Viktigt (medveten begränsning):** AI:n estimerar **aldrig** datum. I denna gren
> finns ingen "Inleverans→kommande"-mappning — den togs bort så grenen inte beror
> på kommande-PR:en. Återinförs som liten följd-PR efter att #2 + #3 mergats (se §8).

## 5. Bilder utan S3 (lokal dev) — `main.ts` + `file.service.ts`
Spaces/S3 är avstängt lokalt. AI-genererade bilder sparas på disk i
`rebuildr-backend/generated-images/` och serveras statiskt:
- `main.ts`: `app.useStaticAssets(<cwd>/generated-images, { prefix: '/generated/' })`.
- `File.externalUrl` pekar på `/generated/<fil>`; `file.service.getUrl()` returnerar den direkt.

I produktion bör detta ersättas med Spaces-uppladdning (se §8).

## 6. App (Expo) — var allt syns
- `app/(app)/account/internal-inventory/index.tsx` — internlager-vyn: import-knappar (CSV/Excel + foto) och lista (query `InternalInventory`, filter `visibility: INTERNAL`).
- `app/(app)/account/organization/index.tsx` — "Mitt företag" (medlemmar/inbjudningar).
- `components/internal-listings/internal-listings-section.tsx` — sektion för interna annonser.
- `app/(app)/(tabs)/index.tsx` — "Interna annonser" på startsidan.
- `components/account/account-content.tsx` + `app/(app)/account/_layout.tsx` — länkar/route.
- `components/upsert-product/preview.tsx` — **synlighetsval** (Publik / Internt lager) i annons-flödet.
- `components/product/product.desktop.tsx` + `product.mobile.tsx` — CTA "Publicera externt" / "Flytta till internt lager" + info-ruta.
- `hooks/product/use-set-product-visibility.ts` — `setVisibility(id, visibility)`.
- Delade fält (`visibility`) i `upsert-product/types.ts`, `queries.ts`, `queries/product-view-fragment.ts`, `upsert-product.tsx`.

Admin: `rebuildr-admin/src/lib/query-keys.ts` har stubbade nycklar
(`LIST_ORGANIZATIONS`, `ORGANIZATION_INVENTORY`, `INVENTORY_SUMMARY`) — scaffolding,
ingen admin-UI byggd ännu.

## 7. Migrationer (kör i ordning)
1. `1782325972315-add-organization-and-inventory.ts`
2. `1782413829293-add-product-visibility.ts`
3. `1782423135483-add-product-organization-and-invites.ts`
4. `1782426993420-drop-inventory-item.ts` *(rensar tidigare separat InventoryItem-modell)*
5. `1782427996173-add-file-external-url.ts`
6. `1782429497744-drop-inventory-import.ts` *(rensar tidigare InventoryImport-modell)*

> Historik: internlagret byggdes först som en separat `InventoryItem`/`InventoryImport`-domän
> men konsoliderades till **en modell = intern `Product`** (`visibility=INTERNAL`),
> så "AI-import matar samma lager som appen använder". Drop-migrationerna städar bort den gamla domänen.

Kör: `cd rebuildr-backend && npm run migration:run` (env via `op run --env-file=".env.local.1p"`).

## 8. Kvar att göra / nästa steg
- **Inleverans→kommande** (följd-PR efter #2+#3): i `ai.service.buildInternalProduct`, läs en explicit `availableFrom`/Inleverans-kolumn och sätt `availability=UPCOMING` + `estimatedAvailableAt` (precision EXACT). Kräver kommande-fälten från #2.
- **Bilder i prod:** byt lokal disk (`/generated`) mot Spaces-uppladdning.
- **Admin-UI:** bygg vyer ovanpå de stubbade query-nycklarna (org-lista, lager, summering).
- **Multi-location** (planerat): under-organisationer (`Organization.parentOrganizationId`), platsväljare vid publicering, "Företag & platser"-vy. Ej påbörjat i denna PR.

## 9. Verifiering i denna PR
- `tsc --noEmit` rent: backend + app + admin (de få kvarvarande app-felen ligger i orörda filer och finns även på `staging`).
- Lokalt testat: CSV-import → interna `Product`-rader med genererade bilder; intern/extern publicering togglar synlighet.
- Inga `availability`/kommande-referenser i grenen (verifierat) → oberoende av #2.
