import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product, ProductStatus } from 'src/entities/product.entity';
import { Purchase, PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import {
  CmsCo2SavingsInput,
  CmsCo2SavingsResponse,
  CmsKpiSummaryResponse,
  CmsKpiValue,
  CmsProductStatisticsGroupByEnum,
  CmsProductStatisticsInput,
  CmsProductStatisticsResponse,
  CmsPurchaseFailureRateInput,
  CmsPurchaseFailureRateResponse,
  CmsPurchaseStatisticsInput,
  CmsPurchaseStatisticsResponse,
  CmsRepeatBuyerRateInput,
  CmsRepeatBuyerRateResponse,
  CmsTopCategoriesInput,
  CmsTopCategoriesResponse,
  CmsTopCategoryEntry,
  CmsTopProductEntry,
  CmsTopProductsInput,
  CmsTopSearchTermEntry,
  CmsTopSearchTermsInput,
  CmsUsersByCityResponse,
  CmsUserStatisticsInput,
  CmsUserStatisticsResponse,
} from 'src/resolvers/statistics.resolver';
import {
  requireRange,
  resolveRange,
  StatisticsRange,
  truncExpr,
} from 'src/services/statistics/statistics-shared';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  private kpiValue(value: number, previous: number | null): CmsKpiValue {
    return {
      value,
      previousValue: previous,
      changePercent: previous ? ((value - previous) / previous) * 100 : null,
    };
  }

  //--------------- KPI summary ---------------

  async cmsKpiSummary(input: {
    from: string;
    to: string;
  }): Promise<CmsKpiSummaryResponse> {
    const range = requireRange(input.from, input.to);

    const [[products], [purchases], [users], [active], [messages]] =
      await Promise.all([
        this.queryProductKpis(range),
        this.queryPurchaseKpis(range),
        this.queryUserKpis(range),
        this.queryActiveUsers(range),
        this.queryMessageKpis(range),
      ]);

    const avgOrderValue = purchases.paidOrders
      ? purchases.gmvSek / purchases.paidOrders
      : 0;
    const avgOrderValuePrev = purchases.paidOrdersPrev
      ? purchases.gmvSekPrev / purchases.paidOrdersPrev
      : null;
    const avgItemPrice = purchases.itemQty
      ? purchases.itemValueSek / purchases.itemQty
      : 0;
    const avgItemPricePrev = purchases.itemQtyPrev
      ? purchases.itemValueSekPrev / purchases.itemQtyPrev
      : null;

    return {
      listingsPublished: this.kpiValue(
        products.listingsPublished,
        products.listingsPublishedPrev,
      ),
      salesCount: this.kpiValue(purchases.salesCount, purchases.salesCountPrev),
      listingsSold: this.kpiValue(
        purchases.listingsSold,
        purchases.listingsSoldPrev,
      ),
      upcomingListingsCreated: this.kpiValue(
        products.upcomingListingsCreated,
        products.upcomingListingsCreatedPrev,
      ),
      activeUsers: this.kpiValue(active.activeUsers, active.activeUsersPrev),
      newUsers: this.kpiValue(users.newUsers, users.newUsersPrev),
      totalSalesSek: this.kpiValue(purchases.gmvSek, purchases.gmvSekPrev),
      avgOrderValueSek: this.kpiValue(avgOrderValue, avgOrderValuePrev),
      avgItemPriceSek: this.kpiValue(avgItemPrice, avgItemPricePrev),
      co2SavedKg: this.kpiValue(purchases.co2Kg, purchases.co2KgPrev),
      activeListingsNow: {
        value: products.activeListingsNow,
        previousValue: null,
        changePercent: null,
      },
      newBusinessUsers: this.kpiValue(
        users.newBusinessUsers,
        users.newBusinessUsersPrev,
      ),
      messagesSent: this.kpiValue(
        messages.messagesSent,
        messages.messagesSentPrev,
      ),
    };
  }

  private queryProductKpis(range: StatisticsRange): Promise<
    {
      listingsPublished: number;
      listingsPublishedPrev: number;
      upcomingListingsCreated: number;
      upcomingListingsCreatedPrev: number;
      activeListingsNow: number;
    }[]
  > {
    return this.productRepository.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE "publishedAt" >= $1 AND "publishedAt" < $2 AND "status" != 'DELETED')::int AS "listingsPublished",
        COUNT(*) FILTER (WHERE "publishedAt" >= $3 AND "publishedAt" < $1 AND "status" != 'DELETED')::int AS "listingsPublishedPrev",
        --Derived from the live availability flag: the activation cron flips
        --UPCOMING -> AVAILABLE when the date passes, so this counts listings
        --published in the period that are still upcoming.
        COUNT(*) FILTER (WHERE "availability" = 'UPCOMING' AND "publishedAt" >= $1 AND "publishedAt" < $2 AND "status" != 'DELETED')::int AS "upcomingListingsCreated",
        COUNT(*) FILTER (WHERE "availability" = 'UPCOMING' AND "publishedAt" >= $3 AND "publishedAt" < $1 AND "status" != 'DELETED')::int AS "upcomingListingsCreatedPrev",
        COUNT(*) FILTER (WHERE "status" = 'PUBLISHED')::int AS "activeListingsNow"
      FROM "product"
      `,
      [range.startNaive, range.endNaive, range.prevStartNaive],
    );
  }

  private queryPurchaseKpis(range: StatisticsRange): Promise<
    {
      salesCount: number;
      salesCountPrev: number;
      listingsSold: number;
      listingsSoldPrev: number;
      gmvSek: number;
      gmvSekPrev: number;
      paidOrders: number;
      paidOrdersPrev: number;
      itemValueSek: number;
      itemValueSekPrev: number;
      itemQty: number;
      itemQtyPrev: number;
      co2Kg: number;
      co2KgPrev: number;
    }[]
  > {
    const value = `pr."price" * COALESCE(pu."purchasedQuantity", 1)`;
    //Matches the per-user CO2 loader: quantity only multiplies for
    //soldByQuantity products, so dashboard totals reconcile with profiles.
    const co2 = `CASE WHEN pr."soldByQuantity" THEN COALESCE(pu."purchasedQuantity", 1) * pr."co2SavingBuyer" ELSE pr."co2SavingBuyer" END`;
    const cur = `pu."paymentAcceptedAt" >= $2`;
    const prev = `pu."paymentAcceptedAt" < $2`;
    return this.purchaseRepository.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE ${cur})::int AS "salesCount",
        COUNT(*) FILTER (WHERE ${prev})::int AS "salesCountPrev",
        COUNT(DISTINCT pu."productId") FILTER (WHERE ${cur})::int AS "listingsSold",
        COUNT(DISTINCT pu."productId") FILTER (WHERE ${prev})::int AS "listingsSoldPrev",
        (COALESCE(SUM(${value}) FILTER (WHERE ${cur}), 0) / 100.0)::float AS "gmvSek",
        (COALESCE(SUM(${value}) FILTER (WHERE ${prev}), 0) / 100.0)::float AS "gmvSekPrev",
        COUNT(*) FILTER (WHERE ${cur} AND ${value} > 0)::int AS "paidOrders",
        COUNT(*) FILTER (WHERE ${prev} AND ${value} > 0)::int AS "paidOrdersPrev",
        (COALESCE(SUM(${value}) FILTER (WHERE ${cur} AND pr."isGiveaway" = false), 0) / 100.0)::float AS "itemValueSek",
        (COALESCE(SUM(${value}) FILTER (WHERE ${prev} AND pr."isGiveaway" = false), 0) / 100.0)::float AS "itemValueSekPrev",
        COALESCE(SUM(COALESCE(pu."purchasedQuantity", 1)) FILTER (WHERE ${cur} AND pr."isGiveaway" = false), 0)::float AS "itemQty",
        COALESCE(SUM(COALESCE(pu."purchasedQuantity", 1)) FILTER (WHERE ${prev} AND pr."isGiveaway" = false), 0)::float AS "itemQtyPrev",
        COALESCE(SUM(${co2}) FILTER (WHERE ${cur}), 0)::float AS "co2Kg",
        COALESCE(SUM(${co2}) FILTER (WHERE ${prev}), 0)::float AS "co2KgPrev"
      FROM "purchase" pu
      JOIN "product" pr ON pr."id" = pu."productId"
      WHERE pu."paymentAcceptedAt" IS NOT NULL
        AND pu."failedAt" IS NULL
        AND pu."paymentAcceptedAt" >= $1
        AND pu."paymentAcceptedAt" < $3
      `,
      [range.prevStart, range.start, range.end],
    );
  }

  private queryUserKpis(range: StatisticsRange): Promise<
    {
      newUsers: number;
      newUsersPrev: number;
      newBusinessUsers: number;
      newBusinessUsersPrev: number;
    }[]
  > {
    return this.userRepository.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE "createdAt" >= $2 AND "createdAt" < $3)::int AS "newUsers",
        COUNT(*) FILTER (WHERE "createdAt" >= $1 AND "createdAt" < $2)::int AS "newUsersPrev",
        COUNT(*) FILTER (WHERE "createdAt" >= $2 AND "createdAt" < $3 AND "type" = 'BUSINESS')::int AS "newBusinessUsers",
        COUNT(*) FILTER (WHERE "createdAt" >= $1 AND "createdAt" < $2 AND "type" = 'BUSINESS')::int AS "newBusinessUsersPrev"
      FROM "user"
      WHERE "deletedAt" IS NULL
      `,
      [range.prevStartNaive, range.startNaive, range.endNaive],
    );
  }

  private queryMessageKpis(
    range: StatisticsRange,
  ): Promise<{ messagesSent: number; messagesSentPrev: number }[]> {
    //System messages have no sender and are not user activity.
    return this.purchaseRepository.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE "createdAt" >= $2 AND "createdAt" < $3)::int AS "messagesSent",
        COUNT(*) FILTER (WHERE "createdAt" >= $1 AND "createdAt" < $2)::int AS "messagesSentPrev"
      FROM "message"
      WHERE "senderId" IS NOT NULL
      `,
      [range.prevStart, range.start, range.end],
    );
  }

  private queryActiveUsers(
    range: StatisticsRange,
  ): Promise<{ activeUsers: number; activeUsersPrev: number }[]> {
    return this.purchaseRepository.query(
      `
      SELECT
        COUNT(DISTINCT uid) FILTER (WHERE ts >= $2 AND ts < $3)::int AS "activeUsers",
        COUNT(DISTINCT uid) FILTER (WHERE ts >= $1 AND ts < $2)::int AS "activeUsersPrev"
      FROM (
        SELECT "buyerId" AS uid, "createdAt" AS ts FROM "purchase"
        UNION ALL
        SELECT "sellerId", ("createdAt" AT TIME ZONE 'UTC') FROM "product"
        UNION ALL
        SELECT "senderId", "createdAt" FROM "message" WHERE "senderId" IS NOT NULL
        UNION ALL
        SELECT "userId", ("createdAt" AT TIME ZONE 'UTC') FROM "event" WHERE "userId" IS NOT NULL
      ) activity
      WHERE ts >= $1 AND ts < $3
      `,
      [range.prevStart, range.start, range.end],
    );
  }

  //--------------- top categories ---------------

  async cmsTopCategories(
    input: CmsTopCategoriesInput,
  ): Promise<CmsTopCategoriesResponse> {
    const range = requireRange(input.from, input.to);
    const limit = Math.min(input.limit ?? 5, 20);

    //Aggregated on the ROOT category (via the recursive category_tree view):
    //leaf categories are too granular for a founder-facing top list.
    const [salesRows, listingRows] = await Promise.all([
      this.purchaseRepository.query(
        `
        SELECT root."id" AS "categoryId", root."name" AS "categoryName",
          (COALESCE(SUM(pr."price" * COALESCE(pu."purchasedQuantity", 1)), 0) / 100.0)::float AS "salesSek",
          COUNT(*)::int AS "salesCount"
        FROM "purchase" pu
        JOIN "product" pr ON pr."id" = pu."productId"
        JOIN "category_tree" ct ON ct."id" = pr."categoryId"
        JOIN "category" root ON root."id" = COALESCE(ct."ancestorIds"[1], ct."id")
        WHERE pu."paymentAcceptedAt" IS NOT NULL
          AND pu."failedAt" IS NULL
          AND pu."paymentAcceptedAt" >= $1
          AND pu."paymentAcceptedAt" < $2
        GROUP BY root."id", root."name"
        `,
        [range.start, range.end],
      ) as Promise<
        {
          categoryId: string;
          categoryName: string;
          salesSek: number;
          salesCount: number;
        }[]
      >,
      this.productRepository.query(
        `
        SELECT root."id" AS "categoryId", root."name" AS "categoryName",
          COUNT(*)::int AS "listingCount"
        FROM "product" p
        JOIN "category_tree" ct ON ct."id" = p."categoryId"
        JOIN "category" root ON root."id" = COALESCE(ct."ancestorIds"[1], ct."id")
        WHERE p."publishedAt" >= $1 AND p."publishedAt" < $2
          AND p."status" != 'DELETED'
        GROUP BY root."id", root."name"
        `,
        [range.startNaive, range.endNaive],
      ) as Promise<
        { categoryId: string; categoryName: string; listingCount: number }[]
      >,
    ]);

    const entries = new Map<string, CmsTopCategoryEntry>();
    const getEntry = (categoryId: string, categoryName: string) => {
      let entry = entries.get(categoryId);
      if (!entry) {
        entry = {
          categoryId,
          categoryName,
          salesSek: 0,
          salesCount: 0,
          listingCount: 0,
        };
        entries.set(categoryId, entry);
      }
      return entry;
    };
    for (const row of salesRows) {
      const entry = getEntry(row.categoryId, row.categoryName);
      entry.salesSek = row.salesSek;
      entry.salesCount = row.salesCount;
    }
    for (const row of listingRows) {
      getEntry(row.categoryId, row.categoryName).listingCount =
        row.listingCount;
    }

    const all = [...entries.values()];
    return {
      bySales: all
        .filter((entry) => entry.salesCount > 0)
        .sort((a, b) => b.salesSek - a.salesSek)
        .slice(0, limit),
      byListings: all
        .filter((entry) => entry.listingCount > 0)
        .sort((a, b) => b.listingCount - a.listingCount)
        .slice(0, limit),
    };
  }

  //--------------- engagement ---------------

  async cmsTopProducts(
    input: CmsTopProductsInput,
  ): Promise<CmsTopProductEntry[]> {
    const range = requireRange(input.from, input.to);
    const limit = Math.min(input.limit ?? 10, 50);
    //LEFT JOIN keeps view counts for products that were later hard-removed.
    //Casting product.id to text (not value to uuid) can never fail on
    //unexpected event values.
    return this.purchaseRepository.query(
      `
      SELECT e."value" AS "productId",
        pr."title" AS "title",
        pr."status"::text AS "status",
        COUNT(*)::int AS "viewCount"
      FROM "event" e
      LEFT JOIN "product" pr ON pr."id"::text = e."value"
      WHERE e."type" = 'PRODUCT_VIEW'
        AND e."createdAt" >= $1 AND e."createdAt" < $2
      GROUP BY e."value", pr."title", pr."status"
      ORDER BY "viewCount" DESC
      LIMIT $3
      `,
      [range.startNaive, range.endNaive, limit],
    );
  }

  async cmsTopSearchTerms(
    input: CmsTopSearchTermsInput,
  ): Promise<CmsTopSearchTermEntry[]> {
    const range = requireRange(input.from, input.to);
    const limit = Math.min(input.limit ?? 15, 50);
    return this.purchaseRepository.query(
      `
      SELECT LOWER(TRIM("searchString")) AS "term", COUNT(*)::int AS "count"
      FROM "search_result"
      WHERE "deletedAt" IS NULL
        AND TRIM("searchString") != ''
        AND "createdAt" >= $1 AND "createdAt" < $2
      GROUP BY LOWER(TRIM("searchString"))
      ORDER BY "count" DESC
      LIMIT $3
      `,
      [range.startNaive, range.endNaive, limit],
    );
  }

  //--------------- geography ---------------

  //Groups by the normalised city string (users type it themselves, so the
  //same city arrives with mixed casing/whitespace). Sweden-focused user base;
  //no country dimension yet.
  async cmsUsersByCity(): Promise<CmsUsersByCityResponse> {
    const cityExpr = `INITCAP(LOWER(TRIM("city")))`;
    const [cities, [unknown]] = await Promise.all([
      this.userRepository.query(
        `
        SELECT ${cityExpr} AS "city", COUNT(*)::int AS "count"
        FROM "user"
        WHERE "deletedAt" IS NULL
          AND "city" IS NOT NULL
          AND TRIM("city") != ''
        GROUP BY ${cityExpr}
        ORDER BY "count" DESC
        LIMIT 20
        `,
      ) as Promise<{ city: string; count: number }[]>,
      this.userRepository.query(
        `
        SELECT COUNT(*)::int AS "unknownCount"
        FROM "user"
        WHERE "deletedAt" IS NULL
          AND ("city" IS NULL OR TRIM("city") = '')
        `,
      ) as Promise<{ unknownCount: number }[]>,
    ]);

    return { cities, unknownCount: unknown?.unknownCount ?? 0 };
  }

  //--------------- time series ---------------

  private toDataPoints(
    rows: { date: string; count: number | string }[],
  ): { date: string; count: number }[] {
    return rows.map((row) => ({
      date: String(row.date),
      count: Number(row.count),
    }));
  }

  async cmsProductStatistics(
    input: CmsProductStatisticsInput,
  ): Promise<CmsProductStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const range = resolveRange(input.from, input.to);
    const expr = truncExpr(groupBy, 'p."createdAt"', 'naive');
    const qb = this.productRepository
      .createQueryBuilder('p')
      .select(expr, 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where('p.status != :status', { status: ProductStatus.DRAFT });
    if (range) {
      qb.andWhere('p."createdAt" >= :start AND p."createdAt" < :end', {
        start: range.startNaive,
        end: range.endNaive,
      });
    }
    const rows = await qb
      .groupBy(expr)
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: number }>();
    return { data: this.toDataPoints(rows) };
  }

  async cmsUserStatistics(
    input: CmsUserStatisticsInput,
  ): Promise<CmsUserStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const range = resolveRange(input.from, input.to);
    const expr = truncExpr(groupBy, 'u."createdAt"', 'naive');
    const qb = this.userRepository
      .createQueryBuilder('u')
      .select(expr, 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where('u."deletedAt" IS NULL');
    if (range) {
      qb.andWhere('u."createdAt" >= :start AND u."createdAt" < :end', {
        start: range.startNaive,
        end: range.endNaive,
      });
    }
    const rows = await qb
      .groupBy(expr)
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: number }>();
    return { data: this.toDataPoints(rows) };
  }

  async cmsPurchaseStatistics(
    input: CmsPurchaseStatisticsInput,
  ): Promise<CmsPurchaseStatisticsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const range = resolveRange(input.from, input.to);
    const expr = truncExpr(
      groupBy,
      'pu."paymentAcceptedAt"',
      'timestamptz',
    );
    const qb = this.purchaseRepository
      .createQueryBuilder('pu')
      .innerJoin('pu.product', 'pr')
      .select(expr, 'date')
      .addSelect('COUNT(*)::int', 'count')
      .addSelect(
        `(COALESCE(SUM(pr."price" * COALESCE(pu."purchasedQuantity", 1)), 0) / 100.0)::float`,
        'gmvSek',
      )
      .where('pu."paymentAcceptedAt" IS NOT NULL')
      //Same "sale" definition as the KPI tiles: refunded/failed drop out.
      .andWhere('pu."failedAt" IS NULL');
    if (range) {
      qb.andWhere(
        'pu."paymentAcceptedAt" >= :start AND pu."paymentAcceptedAt" < :end',
        { start: range.start, end: range.end },
      );
    }
    const rows = await qb
      .groupBy(expr)
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: number; gmvSek: number }>();
    return {
      data: rows.map((row) => ({
        date: String(row.date),
        count: Number(row.count),
        gmvSek: Number(row.gmvSek),
      })),
    };
  }

  async cmsCo2SavingsStatistics(
    input: CmsCo2SavingsInput,
  ): Promise<CmsCo2SavingsResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const range = resolveRange(input.from, input.to);
    const expr = truncExpr(groupBy, 'pu."paymentAcceptedAt"', 'timestamptz');
    //Same definition as the CO₂ KPI tile so the trend sums to that number:
    //quantity only multiplies for soldByQuantity products.
    const co2 = `CASE WHEN pr."soldByQuantity" THEN COALESCE(pu."purchasedQuantity", 1) * pr."co2SavingBuyer" ELSE pr."co2SavingBuyer" END`;
    const qb = this.purchaseRepository
      .createQueryBuilder('pu')
      .innerJoin('pu.product', 'pr')
      .select(expr, 'date')
      .addSelect(`COALESCE(SUM(${co2}), 0)::float`, 'co2Kg')
      .where('pu."paymentAcceptedAt" IS NOT NULL')
      .andWhere('pu."failedAt" IS NULL');
    if (range) {
      qb.andWhere(
        'pu."paymentAcceptedAt" >= :start AND pu."paymentAcceptedAt" < :end',
        { start: range.start, end: range.end },
      );
    }
    const rows = await qb
      .groupBy(expr)
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; co2Kg: number }>();
    return {
      data: rows.map((row) => ({
        date: String(row.date),
        co2Kg: Number(row.co2Kg),
      })),
    };
  }

  //A purchase counts as "repeat" when it is not the buyer's first ever
  //accepted purchase, bucketed by when it was paid.
  async cmsRepeatBuyerRateStatistics(
    input: CmsRepeatBuyerRateInput,
  ): Promise<CmsRepeatBuyerRateResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const range = resolveRange(input.from, input.to);
    const bucket = truncExpr(
      groupBy,
      'ranked."paymentAcceptedAt"',
      'timestamptz',
    );
    const params: Date[] = [];
    let rangeClause = '';
    if (range) {
      params.push(range.start, range.end);
      rangeClause =
        'WHERE ranked."paymentAcceptedAt" >= $1 AND ranked."paymentAcceptedAt" < $2';
    }
    const rows: { date: string; total: number; repeat: number }[] =
      await this.purchaseRepository.query(
        `
        SELECT ${bucket} AS "date",
          COUNT(*)::int AS "total",
          COUNT(*) FILTER (WHERE ranked.rn > 1)::int AS "repeat"
        FROM (
          SELECT p."buyerId", p."paymentAcceptedAt",
            ROW_NUMBER() OVER (PARTITION BY p."buyerId" ORDER BY p."paymentAcceptedAt") AS rn
          FROM "purchase" p
          WHERE p."paymentAcceptedAt" IS NOT NULL
        ) ranked
        ${rangeClause}
        GROUP BY ${bucket}
        ORDER BY "date" ASC
        `,
        params,
      );
    return {
      data: rows.map((row) => {
        const total = Number(row.total);
        const repeat = Number(row.repeat);
        return {
          date: String(row.date),
          total,
          repeat,
          percent: total > 0 ? (repeat / total) * 100 : 0,
        };
      }),
    };
  }

  //Share of concluded purchases that failed, out of those that reached a
  //terminal success/failure state.
  async cmsPurchaseFailureRateStatistics(
    input: CmsPurchaseFailureRateInput,
  ): Promise<CmsPurchaseFailureRateResponse> {
    const groupBy = input.groupBy ?? CmsProductStatisticsGroupByEnum.MONTH;
    const range = resolveRange(input.from, input.to);
    const expr = truncExpr(groupBy, 'pu."createdAt"', 'timestamptz');
    const qb = this.purchaseRepository
      .createQueryBuilder('pu')
      .select(expr, 'date')
      .addSelect('COUNT(*)::int', 'total')
      .addSelect(
        `COUNT(*) FILTER (WHERE pu."status" = '${PurchaseStatusEnum.FINISHED_FAILED}')::int`,
        'failed',
      )
      .where(
        `pu."status" IN ('${PurchaseStatusEnum.FINISHED_FAILED}', '${PurchaseStatusEnum.FINISHED_SUCCESS}')`,
      );
    if (range) {
      qb.andWhere('pu."createdAt" >= :start AND pu."createdAt" < :end', {
        start: range.start,
        end: range.end,
      });
    }
    const rows = await qb
      .groupBy(expr)
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; total: number; failed: number }>();
    return {
      data: rows.map((row) => {
        const total = Number(row.total);
        const failed = Number(row.failed);
        return {
          date: String(row.date),
          total,
          failed,
          percent: total > 0 ? (failed / total) * 100 : 0,
        };
      }),
    };
  }
}
