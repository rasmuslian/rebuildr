import { MapPinTypeEnum } from 'src/entities/map-pin.entity';
import { ProductStatus, ProductVisibility } from 'src/entities/product.entity';
import { InternalAdsService } from 'src/services/internal-ads.service';

interface RawStatistics {
  co2Saved: string | number | null;
  potentialCo2Savings: string | number | null;
  estimatedMarketValue: string | number | null;
  totalAds: string | number | null;
  externallyPublishedAds: string | number | null;
}

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

describe('InternalAdsService.internalAdMapPinGroups', () => {
  it('groups matching internal ads by project without crossing the organization boundary', async () => {
    const getRawMany = jest.fn().mockResolvedValue([
      {
        latitude: 59.3,
        longitude: 18.1,
        productIds: ['project-product'],
        projectId: 'project-a',
        prices: [10000],
      },
      {
        latitude: 59.4,
        longitude: 18.2,
        productIds: ['standalone-product'],
        projectId: null,
        prices: [20000],
      },
    ]);
    const queryBuilder = {
      leftJoin: jest.fn(),
      select: jest.fn(),
      addSelect: jest.fn(),
      where: jest.fn(),
      andWhere: jest.fn(),
      groupBy: jest.fn(),
      addGroupBy: jest.fn(),
      setParameter: jest.fn(),
      getRawMany,
    };
    Object.values(queryBuilder).forEach((mock) => {
      if (mock !== getRawMany) mock.mockReturnValue(queryBuilder);
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
    });

    await expect(
      service.internalAdMapPinGroups('user-a', {
        southWest: { lat: 59, lng: 18 },
        northEast: { lat: 60, lng: 19 },
        zoom: 12,
      }),
    ).resolves.toEqual({
      mapPinGroups: [
        {
          location: { lat: 59.3, lng: 18.1 },
          productIds: ['project-product'],
          projectId: 'project-a',
          type: MapPinTypeEnum.PROJECT,
          prices: [100],
        },
        {
          location: { lat: 59.4, lng: 18.2 },
          productIds: ['standalone-product'],
          projectId: null,
          type: MapPinTypeEnum.PRODUCT,
          prices: [200],
        },
      ],
      total: 2,
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'p.visibility = :visibility',
      { visibility: ProductVisibility.INTERNAL },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'p."internalOrganizationId" = :organizationId',
      { organizationId: 'organization-a' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(p."projectId" IS NULL OR project.id IS NOT NULL)',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'project.id',
      'projectId',
    );
    expect(queryBuilder.groupBy).toHaveBeenCalledWith('project.id');
  });
});

describe('InternalAdsService.setInternalProjectPicture', () => {
  it('replaces the cover image and returns a public upload URL', async () => {
    const oldPicture = { id: 'old-picture' };
    const newPicture = { id: 'new-picture' };
    const project = {
      id: 'project-a',
      internalOrganizationId: 'organization-a',
      projectPicture: oldPicture,
    };
    const projectRepository = {
      findOne: jest.fn().mockResolvedValue(project),
      save: jest.fn().mockImplementation((value) => value),
    };
    const fileService = {
      deleteFiles: jest.fn().mockResolvedValue(undefined),
      createFile: jest.fn().mockResolvedValue(newPicture),
      uploadFile: jest.fn().mockResolvedValue('https://upload.example'),
    };
    const service = Object.create(
      InternalAdsService.prototype,
    ) as InternalAdsService;
    Object.assign(service, { projectRepository, fileService });
    jest.spyOn(service, 'getOrganizationContext').mockResolvedValue({
      organization: { id: 'organization-a' } as never,
    });

    await expect(
      service.setInternalProjectPicture('user-a', 'project-a', {
        mimeType: 'image/jpeg',
        name: 'cover.jpg',
      }),
    ).resolves.toBe('https://upload.example');

    expect(projectRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'project-a',
        internalOrganizationId: 'organization-a',
      },
      relations: { projectPicture: true },
    });
    expect(fileService.deleteFiles).toHaveBeenCalledWith([oldPicture]);
    expect(fileService.createFile).toHaveBeenCalledWith({
      mimeType: 'image/jpeg',
      name: 'cover.jpg',
    });
    expect(projectRepository.save).toHaveBeenCalledWith({
      ...project,
      projectPicture: newPicture,
    });
    expect(fileService.uploadFile).toHaveBeenCalledWith(newPicture, true);
  });
});

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
