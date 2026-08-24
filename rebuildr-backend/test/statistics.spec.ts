import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { StatisticsService } from 'src/services/statistics.service';
import { resolveRange } from 'src/services/statistics/statistics-shared';

describe('StatisticsService', () => {
  let module: TestingModule;
  let statisticsService: StatisticsService;
  let productRepository: { query: jest.Mock; createQueryBuilder: jest.Mock };
  let userRepository: { query: jest.Mock; createQueryBuilder: jest.Mock };
  let purchaseRepository: { query: jest.Mock; createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    productRepository = { query: jest.fn(), createQueryBuilder: jest.fn() };
    userRepository = { query: jest.fn(), createQueryBuilder: jest.fn() };
    purchaseRepository = { query: jest.fn(), createQueryBuilder: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: getRepositoryToken(Product), useValue: productRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(Purchase),
          useValue: purchaseRepository,
        },
      ],
    }).compile();

    statisticsService = module.get(StatisticsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('resolveRange', () => {
    it('converts inclusive Stockholm days to half-open UTC instants (CEST)', () => {
      const range = resolveRange('2026-07-01', '2026-07-31');

      expect(range).toBeDefined();
      //Stockholm is UTC+2 in July.
      expect(range.start.toISOString()).toBe('2026-06-30T22:00:00.000Z');
      expect(range.end.toISOString()).toBe('2026-07-31T22:00:00.000Z');
      expect(range.startNaive).toBe('2026-06-30 22:00:00');
      expect(range.endNaive).toBe('2026-07-31 22:00:00');
      //31-day window -> previous window starts 31 calendar days earlier.
      expect(range.prevStart.toISOString()).toBe('2026-05-30T22:00:00.000Z');
    });

    it('handles the spring DST switch (23-hour day)', () => {
      const range = resolveRange('2026-03-29', '2026-03-29');

      //Midnight Mar 29 is CET (+1); midnight Mar 30 is CEST (+2).
      expect(range.startNaive).toBe('2026-03-28 23:00:00');
      expect(range.endNaive).toBe('2026-03-29 22:00:00');
    });

    it('handles the autumn DST switch (25-hour day)', () => {
      const range = resolveRange('2026-10-25', '2026-10-25');

      //Midnight Oct 25 is CEST (+2); midnight Oct 26 is CET (+1).
      expect(range.startNaive).toBe('2026-10-24 22:00:00');
      expect(range.endNaive).toBe('2026-10-25 23:00:00');
    });

    it('returns undefined when no range is given', () => {
      expect(resolveRange()).toBeUndefined();
    });

    it('rejects a missing bound', () => {
      expect(() => resolveRange('2026-07-01')).toThrow();
    });

    it('rejects from after to', () => {
      expect(() =>
        resolveRange('2026-07-02', '2026-07-01'),
      ).toThrow();
    });

    it('rejects malformed dates', () => {
      expect(() =>
        resolveRange('01/07/2026', '2026-07-31'),
      ).toThrow();
      expect(() =>
        resolveRange('2026-07-01', 'yesterday'),
      ).toThrow();
    });
  });

  describe('cmsKpiSummary', () => {
    beforeEach(() => {
      const { productRow, purchaseRow, userRow, activeRow, messageRow } =
        getFixtures();
      productRepository.query.mockResolvedValue([productRow]);
      userRepository.query.mockResolvedValue([userRow]);
      //purchaseRepository.query serves three different statements.
      purchaseRepository.query.mockImplementation((sql: string) => {
        if (sql.includes('FROM "message"')) {
          return Promise.resolve([messageRow]);
        }
        if (sql.includes(') activity')) {
          return Promise.resolve([activeRow]);
        }
        return Promise.resolve([purchaseRow]);
      });
    });

    it('computes period-over-period change', async () => {
      const summary = await statisticsService.cmsKpiSummary({
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(summary.listingsPublished).toEqual({
        value: 10,
        previousValue: 5,
        changePercent: 100,
      });
      expect(summary.salesCount).toEqual({
        value: 8,
        previousValue: 10,
        changePercent: -20,
      });
    });

    it('nulls changePercent when the previous period is empty', async () => {
      const summary = await statisticsService.cmsKpiSummary({
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(summary.upcomingListingsCreated).toEqual({
        value: 3,
        previousValue: 0,
        changePercent: null,
      });
    });

    it('derives average order value from paid orders only', async () => {
      const summary = await statisticsService.cmsKpiSummary({
        from: '2026-07-01',
        to: '2026-07-31',
      });

      //4000 SEK over 5 paid orders; the 3 giveaway orders are excluded.
      expect(summary.avgOrderValueSek.value).toBe(800);
      expect(summary.avgOrderValueSek.previousValue).toBe(500);
    });

    it('derives average item price from non-giveaway quantities', async () => {
      const summary = await statisticsService.cmsKpiSummary({
        from: '2026-07-01',
        to: '2026-07-31',
      });

      //3600 SEK over 12 units.
      expect(summary.avgItemPriceSek.value).toBe(300);
    });

    it('reports the active-listings snapshot without a comparison', async () => {
      const summary = await statisticsService.cmsKpiSummary({
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(summary.activeListingsNow).toEqual({
        value: 42,
        previousValue: null,
        changePercent: null,
      });
    });

    it('handles a period with no sales without dividing by zero', async () => {
      const { productRow, userRow, activeRow, messageRow, emptyPurchaseRow } =
        getFixtures();
      productRepository.query.mockResolvedValue([productRow]);
      userRepository.query.mockResolvedValue([userRow]);
      purchaseRepository.query.mockImplementation((sql: string) => {
        if (sql.includes('FROM "message"')) {
          return Promise.resolve([messageRow]);
        }
        if (sql.includes(') activity')) {
          return Promise.resolve([activeRow]);
        }
        return Promise.resolve([emptyPurchaseRow]);
      });

      const summary = await statisticsService.cmsKpiSummary({
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(summary.avgOrderValueSek.value).toBe(0);
      expect(summary.avgOrderValueSek.changePercent).toBeNull();
      expect(summary.totalSalesSek.value).toBe(0);
    });
  });

  describe('cmsUsersByCity', () => {
    it('returns normalised cities with the uncategorised count', async () => {
      userRepository.query.mockImplementation((sql: string) => {
        if (sql.includes('unknownCount')) {
          return Promise.resolve([{ unknownCount: 12 }]);
        }
        return Promise.resolve([
          { city: 'Stockholm', count: 40 },
          { city: 'Göteborg', count: 15 },
        ]);
      });

      const result = await statisticsService.cmsUsersByCity();

      expect(result.cities).toEqual([
        { city: 'Stockholm', count: 40 },
        { city: 'Göteborg', count: 15 },
      ]);
      expect(result.unknownCount).toBe(12);
    });

    it('defaults the uncategorised count to zero when the query is empty', async () => {
      userRepository.query.mockImplementation((sql: string) => {
        if (sql.includes('unknownCount')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const result = await statisticsService.cmsUsersByCity();

      expect(result.cities).toEqual([]);
      expect(result.unknownCount).toBe(0);
    });
  });

  function getFixtures() {
    const productRow = {
      listingsPublished: 10,
      listingsPublishedPrev: 5,
      upcomingListingsCreated: 3,
      upcomingListingsCreatedPrev: 0,
      activeListingsNow: 42,
    };
    const purchaseRow = {
      salesCount: 8,
      salesCountPrev: 10,
      listingsSold: 6,
      listingsSoldPrev: 7,
      gmvSek: 4000,
      gmvSekPrev: 2500,
      paidOrders: 5,
      paidOrdersPrev: 5,
      itemValueSek: 3600,
      itemValueSekPrev: 2500,
      itemQty: 12,
      itemQtyPrev: 10,
      co2Kg: 120.5,
      co2KgPrev: 80,
    };
    const emptyPurchaseRow = {
      salesCount: 0,
      salesCountPrev: 0,
      listingsSold: 0,
      listingsSoldPrev: 0,
      gmvSek: 0,
      gmvSekPrev: 0,
      paidOrders: 0,
      paidOrdersPrev: 0,
      itemValueSek: 0,
      itemValueSekPrev: 0,
      itemQty: 0,
      itemQtyPrev: 0,
      co2Kg: 0,
      co2KgPrev: 0,
    };
    const userRow = {
      newUsers: 20,
      newUsersPrev: 15,
      newBusinessUsers: 4,
      newBusinessUsersPrev: 1,
    };
    const activeRow = { activeUsers: 55, activeUsersPrev: 40 };
    const messageRow = { messagesSent: 200, messagesSentPrev: 150 };
    return {
      productRow,
      purchaseRow,
      emptyPurchaseRow,
      userRow,
      activeRow,
      messageRow,
    };
  }
});
