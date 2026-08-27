import { Workbook } from 'exceljs';

import { ProductVisibility } from 'src/entities/product.entity';
import { InternalAdsService } from 'src/services/internal-ads.service';
import { resolveRange } from 'src/services/statistics/statistics-shared';
import {
  allocateProductReportingValues,
  getProductMarketValueOre,
} from 'src/utils/aterbanken-reporting';
import { And, LessThan, MoreThanOrEqual } from 'typeorm';

const reportingProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'product-a',
  title: 'Återbrukad dörr',
  visibility: ProductVisibility.INTERNAL,
  internalOrganizationId: 'organization-a',
  soldByQuantity: true,
  primaryQuantity: 6,
  initialPrimaryQuantity: 10,
  weight: 100,
  co2SavingBuyer: 50,
  co2SavingSeller: 10,
  price: 0,
  publicPriceConfirmed: false,
  priceSuggestionMin: 100,
  priceSuggestionMax: 200,
  ...overrides,
});

describe('Återbanken reporting allocation', () => {
  it('uses the suggested-price midpoint in öre and allocates partial quantities', () => {
    const product = reportingProduct();

    expect(getProductMarketValueOre(product as never)).toBe(15_000);
    expect(allocateProductReportingValues(product as never, 2)).toEqual({
      weight: 20,
      co2SavingBuyer: 10,
      co2SavingSeller: 2,
      marketValue: 3_000,
    });
  });

  it('uses the confirmed product price when no suggestion exists', () => {
    const product = reportingProduct({
      priceSuggestionMin: null,
      priceSuggestionMax: null,
      price: 12_500,
      publicPriceConfirmed: true,
    });

    expect(getProductMarketValueOre(product as never)).toBe(12_500);
  });
});

const createDashboardService = () => {
  const internalProduct = reportingProduct({
    id: 'internal-product',
    soldByQuantity: false,
  });
  const externalProduct = reportingProduct({ id: 'external-product' });
  const currentProduct = reportingProduct({
    id: 'current-product',
    title: 'Fönster',
    soldByQuantity: false,
    primaryQuantity: 1,
    initialPrimaryQuantity: 1,
    weight: 50,
    co2SavingBuyer: 100,
    co2SavingSeller: 5,
    publiclyAvailable: true,
    projectId: 'project-a',
  });
  const reservationRepository = {
    find: jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: 'reservation-a',
          soldAt: new Date('2026-03-10T10:00:00Z'),
          quantity: null,
          weightAtSale: 10,
          co2SavingBuyerAtSale: 20,
          co2SavingSellerAtSale: 2,
          marketValueAtSale: 10_000,
          product: internalProduct,
        },
      ])
      .mockResolvedValueOnce([
        { id: 'active-reservation', quantity: null, product: currentProduct },
      ]),
  };
  const purchaseRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'purchase-a',
        paymentAcceptedAt: new Date('2026-03-11T10:00:00Z'),
        purchasedQuantity: 2,
        priceAtPurchase: 1_000,
        weightAtPurchase: 20,
        co2SavingSellerAtPurchase: 10,
        product: externalProduct,
      },
    ]),
  };
  const service = Object.create(
    InternalAdsService.prototype,
  ) as InternalAdsService;
  Object.assign(service, {
    reservationRepository,
    productRepository: {
      find: jest.fn().mockResolvedValue([currentProduct]),
    },
    dataSource: {
      getRepository: jest.fn().mockReturnValue(purchaseRepository),
    },
    configService: { get: jest.fn().mockReturnValue(5) },
  });
  jest.spyOn(service, 'getOrganizationContext').mockResolvedValue({
    organization: { id: 'organization-a', name: 'Återbanken AB' } as never,
  });
  return service;
};

describe('InternalAdsService.internalAdsDashboard', () => {
  it('uses a half-open timestamp range for the selected calendar days', async () => {
    const service = createDashboardService();
    const range = resolveRange('2026-03-01', '2026-03-31');

    await service.internalAdsDashboard('user-a', {
      from: '2026-03-01',
      to: '2026-03-31',
    });

    const reservationRepository = (
      service as unknown as {
        reservationRepository: { find: jest.Mock };
      }
    ).reservationRepository;
    expect(reservationRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          soldAt: And(MoreThanOrEqual(range!.start), LessThan(range!.end)),
        }),
      }),
    );
  });

  it('combines realized receipts and current inventory without mixing their time semantics', async () => {
    const dashboard =
      await createDashboardService().internalAdsDashboard('user-a');

    expect(dashboard.climate).toEqual({
      realizedCo2: 32,
      internalReuseCo2: 22,
      externalSalesCo2: 10,
      potentialCo2Savings: 105,
      petrolCarKilometers: 256,
    });
    expect(dashboard.economic).toEqual({
      realizedValue: 11_800,
      internalReuseValue: 10_000,
      externalSalesNetValue: 1_800,
      currentInventoryValue: 15_000,
      avoidedDisposalCost: 5_000,
    });
    expect(dashboard.current).toEqual({
      totalAds: 1,
      availableWeight: 50,
      activeProjects: 1,
      externallyPublishedAds: 1,
      reservedArticles: 1,
    });
  });

  it('exports a formatted workbook with values from the selected interval', async () => {
    const service = createDashboardService();
    const xlsx = await service.internalAdsDashboardXlsx('user-a', {
      from: '2026-03-01',
      to: '2026-03-31',
    });
    const workbook = new Workbook();
    await workbook.xlsx.load(Buffer.from(xlsx, 'base64'));

    const overview = workbook.getWorksheet('Översikt');
    const events = workbook.getWorksheet('Händelser');
    expect(overview?.getCell('B3').value).toBe('2026-03-01 – 2026-03-31');
    expect(overview?.getCell('B9').value).toBe(32);
    expect(overview?.getCell('B15').value).toBe(118);
    expect(events?.getCell('A4').value).toBe('INTERNAL_REUSE');
    expect(events?.getCell('B4').value).toBe('reservation-a');
    expect(events?.autoFilter).toBe('A3:M3');
  });
});
