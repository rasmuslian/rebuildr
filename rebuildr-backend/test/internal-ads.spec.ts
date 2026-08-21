import { ProductStatus, ProductVisibility } from 'src/entities/product.entity';
import { InternalAdsService } from 'src/services/internal-ads.service';

type RawStatistics = {
  co2Saved: string | number | null;
  potentialCo2Savings: string | number | null;
  estimatedMarketValue: string | number | null;
  totalAds: string | number | null;
  externallyPublishedAds: string | number | null;
};

const createService = (rawStatistics?: Partial<RawStatistics>) => {
  const addSelect = jest.fn();
  const where = jest.fn();
  const andWhere = jest.fn();
  const setParameters = jest.fn();
  const getRawOne = jest.fn().mockResolvedValue(rawStatistics);
  const queryBuilder = {
    select: jest.fn(),
    addSelect,
    where,
    andWhere,
    setParameters,
    getRawOne,
  };

  Object.values(queryBuilder).forEach((mock) => {
    if (mock !== getRawOne) mock.mockReturnValue(queryBuilder);
  });

  const service = Object.create(
    InternalAdsService.prototype,
  ) as InternalAdsService;
  Object.assign(service, {
    productRepository: {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    },
  });
  jest.spyOn(service, 'getOrganizationContext').mockResolvedValue({
    organization: { id: 'organization-a' } as never,
    role: 'MEMBER' as never,
    isOrganizationAccount: false,
  });

  return { service, queryBuilder };
};

describe('InternalAdsService.internalAdsStatistics', () => {
  it('returns zeroes for an organization without ads', async () => {
    const { service } = createService({
      co2Saved: null,
      potentialCo2Savings: null,
      estimatedMarketValue: null,
      totalAds: '0',
      externallyPublishedAds: '0',
    });

    await expect(service.internalAdsStatistics('user-a')).resolves.toEqual({
      co2Saved: 0,
      potentialCo2Savings: 0,
      estimatedMarketValue: 0,
      totalAds: 0,
      externallyPublishedAds: 0,
    });
  });

  it('normalizes aggregate values and builds all inventory rules into the database query', async () => {
    const { service, queryBuilder } = createService({
      co2Saved: '18.75',
      potentialCo2Savings: '42.5',
      estimatedMarketValue: '125000',
      totalAds: '7',
      externallyPublishedAds: '2',
    });

    await expect(service.internalAdsStatistics('user-a')).resolves.toEqual({
      co2Saved: 18.75,
      potentialCo2Savings: 42.5,
      estimatedMarketValue: 125000,
      totalAds: 7,
      externallyPublishedAds: 2,
    });

    const selections = queryBuilder.addSelect.mock.calls
      .map(([selection]) => selection)
      .join('\n');
    expect(selections).toContain('p."publiclyAvailable" = TRUE');
    expect(selections).toContain('p.status = :publishedStatus');
    expect(selections).toContain('CAST(p.price AS NUMERIC) *');
    expect(selections).toContain('p."soldByQuantity" = TRUE');
    expect(selections).toContain('p."primaryQuantity"');
    expect(selections).toContain('COALESCE(p."co2SavingSeller", 0)');
    expect(selections).toContain('p.status = :soldStatus');
    expect(selections).toContain('reservation."soldAt" IS NOT NULL');
    expect(selections).toContain('reservation."canceledAt" IS NULL');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'p."internalOrganizationId" = :organizationId',
      { organizationId: 'organization-a' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'p.status IN (:...statuses)',
      { statuses: [ProductStatus.PUBLISHED, ProductStatus.SOLD] },
    );
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining(ProductStatus.DRAFT),
      expect.anything(),
    );
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining(ProductStatus.DELETED),
      expect.anything(),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'p."hiddenReason" IS NULL',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'p.visibility = :visibility',
      { visibility: ProductVisibility.INTERNAL },
    );
  });
});
