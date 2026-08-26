const sekFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("sv-SE");

const oneDecimalFormatter = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatSek = (value: number) => sekFormatter.format(value);

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatCo2 = (kg: number) => {
  if (kg >= 1000) {
    return `${oneDecimalFormatter.format(kg / 1000)} ton`;
  }
  return `${numberFormatter.format(Math.round(kg))} kg`;
};

export const formatPercent = (value: number) =>
  `${oneDecimalFormatter.format(value)} %`;

export const formatPercentDelta = (changePercent: number | null) => {
  if (changePercent === null) {
    return "–";
  }
  return `${oneDecimalFormatter.format(Math.abs(changePercent))} % vs föregående period`;
};

/**
 * Value and unit split apart so a tile can size them differently — the number
 * carries the weight, the unit stays quiet beside it.
 */
export type ValueParts = { value: string; unit?: string };

export const formatSekParts = (value: number): ValueParts => ({
  value: numberFormatter.format(Math.round(value)),
  unit: "kr",
});

export const formatNumberParts = (value: number): ValueParts => ({
  value: numberFormatter.format(Math.round(value)),
});

export const formatCo2Parts = (kg: number): ValueParts =>
  kg >= 1000
    ? { value: oneDecimalFormatter.format(kg / 1000), unit: "ton" }
    : { value: numberFormatter.format(Math.round(kg)), unit: "kg" };

export const formatPercentParts = (value: number): ValueParts => ({
  value: oneDecimalFormatter.format(value),
  unit: "%",
});

/** Compact axis labels: 12 500 → 12,5 tn, 1 200 000 → 1,2 mn. */
export const formatCompact = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return `${oneDecimalFormatter.format(value / 1_000_000)} mn`;
  }
  if (Math.abs(value) >= 10_000) {
    return `${oneDecimalFormatter.format(value / 1000)} tn`;
  }
  return numberFormatter.format(Math.round(value));
};
