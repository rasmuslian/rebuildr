import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/sv";

import { colors } from "tailwind.config";

dayjs.extend(isoWeek);
dayjs.locale("sv");

export type GroupBy = "DAY" | "WEEK" | "MONTH";

/**
 * Chart colors are derived from the brand ramps but not identical to them:
 * the UI teal and sand are deliberately low-chroma, which makes them read as
 * grey next to each other in a plot. These steps keep the brand hues while
 * clearing the perceptual thresholds — the set passes every check of the
 * palette validator (lightness band, chroma floor, colour-blind separation,
 * normal-vision separation, surface contrast) in both light and dark mode.
 *
 * Assign in this fixed order and never cycle: a fifth series folds into
 * "Övrigt" or becomes its own chart instead.
 */
export const CHART_COLORS = {
  /** Series 1 — brand violet, the default for single-series charts. */
  primary: "#863CFF",
  /** Series 2 — saturated take on the brand teal. */
  teal: "#009B80",
  /** Series 3 — gold, in the direction of the sand secondary. */
  gold: "#B8860B",
  /** Series 4 — blue, furthest from the others under colour-blindness. */
  blue: "#2E7DD1",
} as const;

export const CATEGORICAL = [
  CHART_COLORS.primary,
  CHART_COLORS.teal,
  CHART_COLORS.gold,
  CHART_COLORS.blue,
] as const;

/** Magnitude ramp (one hue, light → dark) for histograms and heat-style fills. */
export const SEQUENTIAL = [
  colors.accent_200,
  colors.accent_300,
  colors.accent_400,
  colors.accent_500,
  colors.accent_700,
] as const;

/**
 * Reserved for state, never for "series 5" — a red bar next to a green one
 * must always mean something is wrong, not just that it is a different series.
 */
export const STATUS_COLORS = {
  good: colors.primary_600,
  critical: colors.semantic_error_600,
} as const;

export const CHART_INK = {
  axis: colors.neutrals_500,
  grid: colors.neutrals_200,
  label: colors.neutrals_600,
} as const;

/** Recessive axes: no axis line, no tick marks, muted small labels. */
export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: CHART_INK.axis },
} as const;

/** Horizontal rules only — vertical ones fight the bars. */
export const gridProps = {
  strokeDasharray: "3 3",
  vertical: false,
  stroke: CHART_INK.grid,
} as const;

export const tooltipProps = {
  cursor: { fill: colors.neutrals_200, fillOpacity: 0.4 },
  contentStyle: {
    borderRadius: 8,
    border: `1px solid ${colors.neutrals_200}`,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    fontSize: 12,
  },
  labelStyle: { fontWeight: 600, color: colors.neutrals_900 },
} as const;

/** Thin marks: bars keep a 4px rounded top, lines are 2px with no dots. */
export const barProps = {
  radius: [4, 4, 0, 0] as [number, number, number, number],
  maxBarSize: 56,
} as const;

export const lineProps = {
  strokeWidth: 2,
  dot: false,
  activeDot: { r: 4 },
} as const;

export const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 8 } as const;

/**
 * Tooltip formatter wrapper. Recharts types the incoming value as a union
 * that includes undefined and arrays, so narrowing happens once here instead
 * of in every chart.
 */
export const tooltipFormatter =
  (format: (value: number) => string, label: string) =>
  (value: unknown): [string, string] =>
    [format(Number(value ?? 0)), label];

/**
 * The single date formatter for every chart axis and tooltip — the three
 * chart components used to carry their own slightly different copies.
 */
export function formatChartDate(date: string, groupBy: GroupBy): string {
  const day = dayjs(date);
  if (!day.isValid()) return date;
  switch (groupBy) {
    case "DAY":
      return day.format("D MMM");
    case "WEEK":
      return `v.${day.isoWeek()}`;
    case "MONTH":
    default:
      return day.format("MMM YYYY");
  }
}
