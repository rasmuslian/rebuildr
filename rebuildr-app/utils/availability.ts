import {
  ProductAvailabilityEnum,
  ProductAvailabilityPrecisionEnum,
} from "@/gql/graphql";

const MONTHS = [
  "jan",
  "feb",
  "mars",
  "apr",
  "maj",
  "juni",
  "juli",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];

export const isUpcoming = (
  availability?: ProductAvailabilityEnum | null,
): boolean => availability === ProductAvailabilityEnum.Upcoming;

/**
 * Human label for a "coming soon" (UPCOMING) listing, respecting the date
 * precision so uncertainty reads naturally. Returns null for available items.
 *   EXACT   -> "Kommande · 1 sep 2026"
 *   MONTH   -> "Kommande · sep 2026"
 *   QUARTER -> "Kommande · Q3 2026"
 *   UNKNOWN -> "Kommande – datum ej satt"
 */
export function formatAvailability(
  availability?: ProductAvailabilityEnum | null,
  estimatedAvailableAt?: string | null,
  precision?: ProductAvailabilityPrecisionEnum | null,
): string | null {
  if (availability !== ProductAvailabilityEnum.Upcoming) return null;

  if (
    !estimatedAvailableAt ||
    precision === ProductAvailabilityPrecisionEnum.Unknown
  ) {
    return "Kommande – datum ej satt";
  }

  const d = new Date(estimatedAvailableAt);
  if (isNaN(d.getTime())) return "Kommande – datum ej satt";

  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();

  switch (precision) {
    case ProductAvailabilityPrecisionEnum.Quarter:
      return `Kommande · Q${Math.floor(d.getMonth() / 3) + 1} ${year}`;
    case ProductAvailabilityPrecisionEnum.Month:
      return `Kommande · ${month} ${year}`;
    case ProductAvailabilityPrecisionEnum.Exact:
    default:
      return `Kommande · ${d.getDate()} ${month} ${year}`;
  }
}
