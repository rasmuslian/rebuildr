import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { BadUserInputException } from 'src/exceptions';
import { CmsProductStatisticsGroupByEnum } from 'src/resolvers/statistics.resolver';

dayjs.extend(utc);
dayjs.extend(timezone);

export const STOCKHOLM = 'Europe/Stockholm';
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
//Naive-column values are compared as UTC wall-clock strings (sargable),
//timestamptz columns as Date parameters.
const NAIVE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Timestamp columns in this schema are of two kinds and MUST be treated
 * differently in Stockholm-local date math:
 * - 'naive'      : plain `timestamp` storing UTC wall-clock
 *                  (product.publishedAt, product/user/event.createdAt)
 * - 'timestamptz': real timezone-aware columns (purchase milestones,
 *                  message/conversation.createdAt, publishedAsUpcomingAt)
 * A uniform conversion silently shifts naive columns by the UTC offset.
 */
export type ColumnKind = 'naive' | 'timestamptz';

export interface StatisticsRange {
  start: Date;
  end: Date;
  startNaive: string;
  endNaive: string;
  prevStart: Date;
  prevStartNaive: string;
}

/**
 * A purchase counts as a sale once payment is accepted and it has not failed.
 * Every revenue-bearing query shares this definition, so a refund drops out
 * of the tiles, the charts and the drill-downs at the same time.
 */
export const SALE_PREDICATE = (alias = 'pu') =>
  `${alias}."paymentAcceptedAt" IS NOT NULL AND ${alias}."failedAt" IS NULL`;

/**
 * Order value in SEK. Prices live in öre, and the snapshot taken at purchase
 * time wins over the product's current price so history cannot drift when a
 * seller edits the listing afterwards.
 */
export const GMV_EXPR = (purchase = 'pu', product = 'pr') =>
  `COALESCE(${purchase}."priceAtPurchase", ${product}."price") * COALESCE(${purchase}."purchasedQuantity", 1)`;

/**
 * Matches a product against a category and all of its descendants, mirroring
 * the root-level rollup used by the top-category lists.
 */
export const CATEGORY_SUBTREE_CONDITION = (
  productAlias = 'pr',
  paramName = 'categoryId',
) => `EXISTS (
    SELECT 1 FROM "category_tree" ct
    WHERE ct."id" = ${productAlias}."categoryId"
      AND (ct."id" = :${paramName} OR :${paramName} = ANY(ct."ancestorIds"))
  )`;

export function stockholmExpr(column: string, kind: ColumnKind): string {
  const tzValue = kind === 'naive' ? `(${column} AT TIME ZONE 'UTC')` : column;
  return `${tzValue} AT TIME ZONE '${STOCKHOLM}'`;
}

export function truncExpr(
  groupBy: CmsProductStatisticsGroupByEnum,
  column: string,
  kind: ColumnKind,
): string {
  return `TO_CHAR(DATE_TRUNC('${groupBy.toLowerCase()}', ${stockholmExpr(
    column,
    kind,
  )}), 'YYYY-MM-DD')`;
}

function parseStockholmDay(value: string, field: string): Dayjs {
  if (!DATE_FORMAT.test(value)) {
    throw BadUserInputException(`${field} must be formatted YYYY-MM-DD`);
  }
  const day = dayjs.tz(value, STOCKHOLM);
  if (!day.isValid()) {
    throw BadUserInputException(`${field} is not a valid date`);
  }
  return day;
}

/**
 * [from, to] as inclusive Stockholm calendar days -> half-open UTC instants
 * [start, end), plus the equal-length window immediately before (for
 * period-over-period deltas). Returns undefined when no range was given.
 */
export function resolveRange(
  from?: string,
  to?: string,
): StatisticsRange | undefined {
  if (!from && !to) return undefined;
  if (!from || !to) {
    throw BadUserInputException('Both from and to must be provided');
  }
  const start = parseStockholmDay(from, 'from');
  parseStockholmDay(to, 'to');
  //Day arithmetic runs on date-only values in UTC: DST days are 23/25 hours
  //long, so diffing/subtracting the tz-aware instants drifts by an hour.
  const days = dayjs.utc(to).diff(dayjs.utc(from), 'day') + 1;
  if (days <= 0) {
    throw BadUserInputException('from must be before or equal to to');
  }
  const end = dayjs.tz(
    dayjs.utc(to).add(1, 'day').format('YYYY-MM-DD'),
    STOCKHOLM,
  );
  const prevStart = dayjs.tz(
    dayjs.utc(from).subtract(days, 'day').format('YYYY-MM-DD'),
    STOCKHOLM,
  );
  return {
    start: start.toDate(),
    end: end.toDate(),
    startNaive: start.utc().format(NAIVE_FORMAT),
    endNaive: end.utc().format(NAIVE_FORMAT),
    prevStart: prevStart.toDate(),
    prevStartNaive: prevStart.utc().format(NAIVE_FORMAT),
  };
}

export function requireRange(from?: string, to?: string): StatisticsRange {
  const range = resolveRange(from, to);
  if (!range) {
    throw BadUserInputException('Both from and to must be provided');
  }
  return range;
}
