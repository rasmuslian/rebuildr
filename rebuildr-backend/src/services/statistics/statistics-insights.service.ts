import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Purchase } from 'src/entities/purchase.entity';
import {
  CmsPriceDistributionInput,
  CmsPriceDistributionResponse,
  CmsProductStatisticsGroupByEnum,
  CmsPurchaseBreakdownsInput,
  CmsPurchaseBreakdownsResponse,
  CmsReviewStatsInput,
  CmsReviewStatsResponse,
  CmsTimeToSellInput,
  CmsTimeToSellResponse,
} from 'src/resolvers/statistics.resolver';
import {
  CATEGORY_SUBTREE_CONDITION,
  GMV_EXPR,
  requireRange,
  SALE_PREDICATE,
  truncExpr,
} from './statistics-shared';

/** SEK edges for the price histogram; the last bucket is open-ended. */
const PRICE_BUCKETS_SEK = [0, 100, 250, 500, 1000, 2500, 5000, 10000] as const;

@Injectable()
export class StatisticsInsightsService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  /**
   * Days from publication to sale, per period. The median is reported
   * alongside the quartiles because a mean is dominated by the handful of
   * listings that sit for months.
   */
  async cmsTimeToSell(
    input: CmsTimeToSellInput,
  ): Promise<CmsTimeToSellResponse> {
    const range = requireRange(input.from, input.to);
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const bucket = truncExpr(groupBy, 'pu."paymentAcceptedAt"', 'timestamptz');

    //publishedAt is a naive column storing UTC wall-clock; read it as UTC to
    //get a real instant before subtracting from the timestamptz
    //paymentAcceptedAt, otherwise every gap is inflated by the UTC offset.
    const publishedInstant = `(pr."publishedAt" AT TIME ZONE 'UTC')`;
    const daysExpr = `EXTRACT(EPOCH FROM (pu."paymentAcceptedAt" - ${publishedInstant})) / 86400.0`;

    const rows: {
      date: string;
      medianDays: number;
      p25Days: number;
      p75Days: number;
      count: number;
    }[] = await this.purchaseRepository.query(
      `
      SELECT ${bucket} AS "date",
        percentile_cont(0.5) WITHIN GROUP (ORDER BY ${daysExpr})::float AS "medianDays",
        percentile_cont(0.25) WITHIN GROUP (ORDER BY ${daysExpr})::float AS "p25Days",
        percentile_cont(0.75) WITHIN GROUP (ORDER BY ${daysExpr})::float AS "p75Days",
        COUNT(*)::int AS "count"
      FROM "purchase" pu
      JOIN "product" pr ON pr."id" = pu."productId"
      WHERE ${SALE_PREDICATE()}
        AND pr."publishedAt" IS NOT NULL
        --Guards against listings whose backfilled publishedAt lands after the
        --sale, which would otherwise produce negative durations.
        AND pu."paymentAcceptedAt" >= ${publishedInstant}
        AND pu."paymentAcceptedAt" >= $1
        AND pu."paymentAcceptedAt" < $2
        ${input.categoryId ? `AND ${CATEGORY_SUBTREE_CONDITION('pr').replace(/:categoryId/g, '$3')}` : ''}
      GROUP BY ${bucket}
      ORDER BY "date" ASC
      `,
      input.categoryId
        ? [range.start, range.end, input.categoryId]
        : [range.start, range.end],
    );

    return { data: rows.map((row) => ({ ...row, count: Number(row.count) })) };
  }

  /** How buyers pay and how goods move, by count and by value. */
  async cmsPurchaseBreakdowns(
    input: CmsPurchaseBreakdownsInput,
  ): Promise<CmsPurchaseBreakdownsResponse> {
    const range = requireRange(input.from, input.to);
    const params = [range.start, range.end];

    const breakdown = (column: string) =>
      this.purchaseRepository.query(
        `
        SELECT COALESCE(pu."${column}"::text, 'UNKNOWN') AS "method",
          COUNT(*)::int AS "count",
          (COALESCE(SUM(${GMV_EXPR()}), 0) / 100.0)::float AS "gmvSek"
        FROM "purchase" pu
        JOIN "product" pr ON pr."id" = pu."productId"
        WHERE ${SALE_PREDICATE()}
          AND pu."paymentAcceptedAt" >= $1
          AND pu."paymentAcceptedAt" < $2
        GROUP BY 1
        ORDER BY "count" DESC
        `,
        params,
      ) as Promise<{ method: string; count: number; gmvSek: number }[]>;

    const [transport, payment] = await Promise.all([
      breakdown('transportationMethod'),
      breakdown('paymentMethod'),
    ]);

    return { transport, payment };
  }

  /**
   * Review volume and sentiment. Counts reviews rather than purchases — a
   * purchase can carry one from each side.
   */
  async cmsReviewStats(
    input: CmsReviewStatsInput,
  ): Promise<CmsReviewStatsResponse> {
    const range = requireRange(input.from, input.to);
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    //review.createdAt is a naive column storing UTC wall-clock, so it is
    //compared against the range's naive wall-clock strings.
    const bucket = truncExpr(groupBy, 'r."createdAt"', 'naive');
    const params = [range.startNaive, range.endNaive];

    const [[totals], distribution, series] = await Promise.all([
      this.purchaseRepository.query(
        `SELECT COALESCE(AVG(r."stars"), 0)::float AS "average", COUNT(*)::int AS "count"
         FROM "review" r WHERE r."createdAt" >= $1 AND r."createdAt" < $2`,
        params,
      ) as Promise<{ average: number; count: number }[]>,
      this.purchaseRepository.query(
        `SELECT r."stars"::int AS "stars", COUNT(*)::int AS "count"
         FROM "review" r WHERE r."createdAt" >= $1 AND r."createdAt" < $2
         GROUP BY r."stars" ORDER BY r."stars" ASC`,
        params,
      ) as Promise<{ stars: number; count: number }[]>,
      this.purchaseRepository.query(
        `SELECT ${bucket} AS "date", AVG(r."stars")::float AS "avgStars", COUNT(*)::int AS "count"
         FROM "review" r WHERE r."createdAt" >= $1 AND r."createdAt" < $2
         GROUP BY ${bucket} ORDER BY "date" ASC`,
        params,
      ) as Promise<{ date: string; avgStars: number; count: number }[]>,
    ]);

    //Always report all five ratings so the bars keep a stable shape.
    const byStars = new Map(distribution.map((row) => [row.stars, row.count]));
    return {
      average: totals?.average ?? 0,
      count: totals?.count ?? 0,
      distribution: [1, 2, 3, 4, 5].map((stars) => ({
        stars,
        count: byStars.get(stars) ?? 0,
      })),
      series,
    };
  }

  /**
   * Price histogram over listings published in the period. Giveaways are
   * excluded — a pile of zero-price rows would swamp the first bucket and say
   * nothing about pricing.
   */
  async cmsPriceDistribution(
    input: CmsPriceDistributionInput,
  ): Promise<CmsPriceDistributionResponse> {
    const range = requireRange(input.from, input.to);
    const params: unknown[] = [range.startNaive, range.endNaive];

    const conditions = [
      'pr."publishedAt" >= $1',
      'pr."publishedAt" < $2',
      `pr."status" != 'DELETED'`,
      'pr."isGiveaway" = false',
    ];
    if (input.categoryId) {
      params.push(input.categoryId);
      conditions.push(
        CATEGORY_SUBTREE_CONDITION('pr').replace(
          /:categoryId/g,
          `$${params.length}`,
        ),
      );
    }
    if (input.condition) {
      params.push(input.condition);
      conditions.push(`pr."condition"::text = $${params.length}`);
    }

    //width_bucket maps each price onto the fixed edges; bucket 0 (below the
    //first edge) cannot occur because giveaways are already filtered out.
    const edges = PRICE_BUCKETS_SEK.map((sek) => sek * 100).join(',');
    const rows: { bucket: number; count: number }[] =
      await this.purchaseRepository.query(
        `
        SELECT width_bucket(pr."price", ARRAY[${edges}]) AS "bucket",
          COUNT(*)::int AS "count"
        FROM "product" pr
        WHERE ${conditions.join(' AND ')}
        GROUP BY 1
        `,
        params,
      );

    const counts = new Map(rows.map((row) => [Number(row.bucket), row.count]));
    return {
      buckets: PRICE_BUCKETS_SEK.map((fromSek, index) => ({
        fromSek,
        toSek: PRICE_BUCKETS_SEK[index + 1] ?? null,
        //width_bucket is 1-indexed against the edge array.
        count: counts.get(index + 1) ?? 0,
      })),
    };
  }
}
