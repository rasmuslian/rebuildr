/**
 *
 * CODE simplified and modified to handle only NCS to RGB by ChatGPT from
 * this js-file: https://www.w3schools.com/lib/w3color.js.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function ncsToRgb(ncs: string): RGB | null {
  const cleaned = normalizeNcs(ncs);
  if (!cleaned) return null;

  const { black, chroma, hue, percent } = cleaned;

  if (hue === "N") {
    const grey = clamp(Math.round((1 - black / 100) * 255));
    return { r: grey, g: grey, b: grey };
  }

  const blackFactor = 1.05 * black - 5.25;
  const chromaFactor = chroma;

  const { r: r1, g: g1, b: b1 } = baseHueRgb(hue, percent);

  const avg = (r1 + g1 + b1) / 3;

  const r2 = avg + (r1 - avg) * (chromaFactor / 100);
  const g2 = avg + (g1 - avg) * (chromaFactor / 100);
  const b2 = avg + (b1 - avg) * (chromaFactor / 100);

  const max = Math.max(r2, g2, b2) || 1;
  const scale = (1 - blackFactor / 100) / max;

  return {
    r: clamp(Math.round(r2 * scale * 255)),
    g: clamp(Math.round(g2 * scale * 255)),
    b: clamp(Math.round(b2 * scale * 255)),
  };
}

/* ───────────────────────── helpers ───────────────────────── */

type Hue = "Y" | "R" | "B" | "G" | "N";

function normalizeNcs(input: string): {
  black: number;
  chroma: number;
  hue: Hue;
  percent: number;
} | null {
  const ncs = input
    .toUpperCase()
    .replace(/[()]/g, "")
    .replace(/^(?:NCS\s+)?S?\s*/, "");

  const match = ncs.match(/^(\d{2})(\d{2})[- ]([YRGBN])(\d{0,2})?/);
  if (!match) return null;

  return {
    black: parseInt(match[1], 10),
    chroma: parseInt(match[2], 10),
    hue: match[3] as Hue,
    percent: parseInt(match[4] || "0", 10),
  };
}

function baseHueRgb(hue: Hue, percent: number) {
  let r = 0,
    g = 0,
    b = 0;

  switch (hue) {
    case "Y":
      r = 1;
      g = (85 - 0.85 * percent) / 100;
      b = percent > 80 ? (percent - 80) / 100 : 0;
      break;

    case "R":
      r = percent <= 80 ? 1 - percent / 100 : 0;
      g = percent > 60 ? (percent - 60) / 100 : 0;
      break;

    case "B":
      b = percent <= 80 ? 1 - percent / 100 : 0;
      g = percent <= 60 ? percent / 100 : 0.9;
      break;

    case "G":
      g = 0.9;
      r = percent > 40 ? (percent - 40) / 100 : 0;
      break;
  }

  return { r, g, b };
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, n));
}
