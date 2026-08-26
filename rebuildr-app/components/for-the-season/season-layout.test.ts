import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildSeasonLayout,
  chipSizeFor,
  estimateChipWidth,
  estimateRowWidth,
  gapFor,
} from "./season-layout";

const cats = (...names: string[]) => names.map((name) => ({ name }));

const ALL_TWELVE = cats(
  "Byggmaterial",
  "Dörrar",
  "Golv",
  "Interiör",
  "Kakel & Sten",
  "Elinstallation",
  "Träprodukter",
  "Fönster",
  "Tak",
  "Färg & Tapet",
  "Kök & bad",
  "Arbetsplats",
);

describe("chipstorlek", () => {
  test("desktop är större än mobil", () => {
    assert.equal(chipSizeFor(true), 56);
    assert.equal(chipSizeFor(false), 44);
    assert.ok(chipSizeFor(true) > chipSizeFor(false));
  });

  test("mobil klarar Apples minsta träffyta på 44 px", () => {
    assert.ok(chipSizeFor(false) >= 44);
  });

  test("gapet är större på desktop", () => {
    assert.equal(gapFor(true), 12);
    assert.equal(gapFor(false), 8);
  });
});

describe("breddberäkning", () => {
  test("längre etikett ger bredare chip", () => {
    const kort = estimateChipWidth("Tak", 48);
    const lang = estimateChipWidth("Arbetsplatstillbehör", 48);
    assert.ok(lang > kort, `${lang} ska vara större än ${kort}`);
  });

  test("större chip ger bredare resultat för samma etikett", () => {
    assert.ok(estimateChipWidth("Golv", 48) > estimateChipWidth("Golv", 40));
  });

  test("radbredd räknar in gap mellan chips, inte efter sista", () => {
    const row = cats("Tak", "Golv");
    const utan = row.reduce((a, c) => a + estimateChipWidth(c.name, 48), 0);
    assert.equal(estimateRowWidth(row, 48, 12), utan + 12);
  });

  test("ensamt chip får inget gap", () => {
    const row = cats("Tak");
    assert.equal(estimateRowWidth(row, 48, 12), estimateChipWidth("Tak", 48));
  });

  test("tom rad är noll bred", () => {
    assert.equal(estimateRowWidth([], 48, 12), 0);
  });
});

describe("radfördelning", () => {
  test("alla kategorier kommer med — inget trunkeras", () => {
    const { rows } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 1200,
      isDesktop: true,
    });
    const utfall = rows.flat().map((c) => c.name);
    assert.equal(utfall.length, ALL_TWELVE.length);
    for (const c of ALL_TWELVE) {
      assert.ok(utfall.includes(c.name), `${c.name} saknas`);
    }
  });

  test("två rader blir ungefär lika breda", () => {
    const { rows, chipSize, gap } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 1200,
      isDesktop: true,
    });
    assert.equal(rows.length, 2);
    const [a, b] = rows.map((r) => estimateRowWidth(r, chipSize, gap));
    const skillnad = Math.abs(a - b);
    const bredast = Math.max(a, b);
    assert.ok(
      skillnad < bredast * 0.25,
      `raderna skiljer ${skillnad}px av ${bredast}px`,
    );
  });

  test("allt på en rad när det ryms", () => {
    const { rows } = buildSeasonLayout({
      categories: cats("Tak", "Golv"),
      containerWidth: 4000,
      isDesktop: true,
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].length, 2);
  });

  test("inga tomma rader när kategorierna är få", () => {
    const { rows } = buildSeasonLayout({
      categories: cats("Tak"),
      containerWidth: 100,
      isDesktop: true,
    });
    assert.ok(rows.every((r) => r.length > 0));
  });

  test("tom lista kraschar inte", () => {
    const layout = buildSeasonLayout({
      categories: [],
      containerWidth: 1200,
      isDesktop: true,
    });
    assert.deepEqual(layout.rows, []);
    assert.equal(layout.widestRowWidth, 0);
    // Inget att visa ryms trivialt — komponenten renderar ändå ingenting.
    assert.equal(layout.fitsWithoutScroll, true);
  });
});

describe("rutnät kontra scroll", () => {
  test("breda skärmar slipper scroll", () => {
    const { fitsWithoutScroll } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 1600,
      isDesktop: true,
    });
    assert.equal(fitsWithoutScroll, true);
  });

  test("smal desktop faller tillbaka på scroll i stället för att kapa", () => {
    const { fitsWithoutScroll, rows } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 500,
      isDesktop: true,
    });
    assert.equal(fitsWithoutScroll, false);
    assert.equal(rows.flat().length, ALL_TWELVE.length);
  });

  test("mobil scrollar alltid", () => {
    const { fitsWithoutScroll } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 4000,
      isDesktop: false,
    });
    assert.equal(fitsWithoutScroll, false);
  });

  test("omätt container antar scroll", () => {
    const { fitsWithoutScroll } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 0,
      isDesktop: true,
    });
    assert.equal(fitsWithoutScroll, false);
  });

  test("widestRowWidth är den bredaste raden", () => {
    const { rows, widestRowWidth, chipSize, gap } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 1200,
      isDesktop: true,
    });
    const bredast = Math.max(
      ...rows.map((r) => estimateRowWidth(r, chipSize, gap)),
    );
    assert.equal(widestRowWidth, bredast);
  });
});

describe("storleken mot en liten laptop", () => {
  // Innehållskolumnen på en 1280 px-skärm efter sidopadding.
  const SMAL_DESKTOP = 1130;

  test("tolv kategorier ryms på en stor skärm", () => {
    const { fitsWithoutScroll } = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: 1450,
      isDesktop: true,
    });
    assert.equal(fitsWithoutScroll, true);
  });

  // Fördelningen är girig: varje chip hamnar på den rad som är smalast just då.
  // Det gör resultatet känsligt för i vilken ordning kategorierna kommer, så
  // samma antal kan rymmas i en ordning och skrollas i en annan. Testet låser
  // fast att känsligheten finns, så att en framtida ändring av algoritmen
  // märks här i stället för i produktion.
  test("radbredden beror på ordningen, inte bara på antalet", () => {
    const bred = buildSeasonLayout({
      categories: ALL_TWELVE,
      containerWidth: SMAL_DESKTOP,
      isDesktop: true,
    });
    const omkastad = buildSeasonLayout({
      categories: [...ALL_TWELVE].reverse(),
      containerWidth: SMAL_DESKTOP,
      isDesktop: true,
    });
    assert.notEqual(
      Math.round(bred.widestRowWidth),
      Math.round(omkastad.widestRowWidth),
    );
  });

  test("scroll-läget tappar inga kategorier", () => {
    const manga = [
      ...ALL_TWELVE,
      ...cats("Ytterdörrar", "Byggskivor", "Tegelpannor"),
    ];
    const { rows, fitsWithoutScroll } = buildSeasonLayout({
      categories: manga,
      containerWidth: SMAL_DESKTOP,
      isDesktop: true,
    });
    assert.equal(fitsWithoutScroll, false);
    assert.equal(rows.flat().length, manga.length);
  });
});
