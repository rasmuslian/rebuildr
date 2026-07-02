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

export const UPCOMING_LABEL = "Snart till salu";

/**
 * Human label for a "coming soon" (UPCOMING) listing, respecting the date
 * precision so uncertainty reads naturally. Returns null for available items.
 * New listings always use EXACT; MONTH/QUARTER/UNKNOWN are kept for legacy rows.
 *   EXACT   -> "Snart till salu · 1 sep 2026"
 *   MONTH   -> "Snart till salu · sep 2026"
 *   QUARTER -> "Snart till salu · Q3 2026"
 *   UNKNOWN -> "Snart till salu – datum ej satt"
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
    return `${UPCOMING_LABEL} – datum ej satt`;
  }

  const d = new Date(estimatedAvailableAt);
  if (isNaN(d.getTime())) return `${UPCOMING_LABEL} – datum ej satt`;

  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();

  switch (precision) {
    case ProductAvailabilityPrecisionEnum.Quarter:
      return `${UPCOMING_LABEL} · Q${Math.floor(d.getMonth() / 3) + 1} ${year}`;
    case ProductAvailabilityPrecisionEnum.Month:
      return `${UPCOMING_LABEL} · ${month} ${year}`;
    case ProductAvailabilityPrecisionEnum.Exact:
    default:
      return `${UPCOMING_LABEL} · ${d.getDate()} ${month} ${year}`;
  }
}

/** Full date label, e.g. "1 sep 2026" — used for the optional end date. */
export function formatExactDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
