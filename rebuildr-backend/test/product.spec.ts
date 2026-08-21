import { Test, TestingModule } from '@nestjs/testing';
import { StripeMock } from './mocks/stripe.mock';
import { Logger } from 'winston';
import { StripeService } from 'src/services/stripe.service';
import { PostnordAPI } from 'src/apis/postnord.api';
import { PostnordMock } from './mocks/postnord.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ColorTypeEnum,
  MeasurementUnitEnum,
  Product,
  ProductConditionEnum,
  ProductStatus,
  ProductVisibility,
} from 'src/entities/product.entity';
import { User, UserRoleEnum, UserType } from 'src/entities/user.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductService } from 'src/services/product.service';
import { Repository } from 'typeorm';
import { ModuleMocker, MockMetadata } from 'jest-mock';
import { UpdateProductInput } from 'src/resolvers/product.resolver';
import { QuantityUnitEnum } from 'src/constants/enums';
import { File } from 'src/entities/file.entity';
import { Category, CategoryTypeEnum } from 'src/entities/category.entity';
import { Purchase, PurchaseStatusEnum } from 'src/entities/purchase.entity';
import {
  ShippingPrice,
  ShippingProviderEnum,
} from 'src/entities/shipping-price.entity';
import { GeocodingService } from 'src/services/geocoding.service';
import { FileService } from 'src/services/file.service';
import { S3Service } from 'src/services/s3.service';
import { S3Mock } from './mocks/s3.mock';
import { Brand } from 'src/entities/brand.entity';
import { SearchEnrichmentService } from 'src/services/search-enrichment.service';

const moduleMocker = new ModuleMocker(global);
const now = new Date();

describe('Product', () => {
  let productService: ProductService;
  let module: TestingModule;
  const loggerMock: Partial<Logger> = {
    info: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const { categoryFixture, shippingPriceFixture } = getFixtures();
    const mockRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findOneOrFail: jest.fn(),
    };
    const mockRepositoryProduct = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };
    const mockRepositoryFile = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn((file) => ({ ...file, id: 'file' })),
    };
    const mockRepositoryCategory = {
      findOne: jest.fn(() => categoryFixture),
    };
    const mockRepositoryShippingPrice = {
      find: jest.fn(() => [shippingPriceFixture]),
    };
    const mockRepositoryBrand = {
      findOne: jest.fn(),
    };
    const mockSearchEnrichmentService = {
      generateProductSearchEnrichment: jest.fn().mockResolvedValue({
        searchAliases: [],
        searchRelatedTerms: [],
        searchUseCases: [],
      }),
      sanitizeTerms: jest.fn((terms: string[]) => terms ?? []),
      buildProductSearchDocument: jest.fn(() => 'search document'),
    };

    module = await Test.createTestingModule({
      providers: [
        ProductService,
        FileService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepositoryProduct,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepositoryCategory,
        },
        {
          provide: getRepositoryToken(Brand),
          useValue: mockRepositoryBrand,
        },
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ShippingPrice),
          useValue: mockRepositoryShippingPrice,
        },
        {
          provide: getRepositoryToken(File),
          useValue: mockRepositoryFile,
        },
        {
          provide: StripeService,
          useClass: StripeMock,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: loggerMock,
        },
        {
          provide: PostnordAPI,
          useClass: PostnordMock,
        },
        {
          provide: S3Service,
          useClass: S3Mock,
        },
        {
          provide: SearchEnrichmentService,
          useValue: mockSearchEnrichmentService,
        },
      ],
    })
      .useMocker((token) => {
        if (token === GeocodingService) {
          return {
            locationToAddress: jest
              .fn()
              .mockResolvedValue({ address: 'adress' }),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockMetadata<
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any
          >;
          const Mock = moduleMocker.generateFromMetadata(
            mockMetadata,
          ) as ObjectConstructor;
          return new Mock();
        }
      })
      .compile();

    productService = module.get<ProductService>(ProductService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('publish product', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();
    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,

      location: { lat: 10, lng: 10 },
      noProject: true,

      pickupEnabled: true,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(draftFixture as Product);

    await productService.updateProduct(
      input,
      sellerFixure.id,
      sellerFixure.role,
      loggerMock as Logger,
    );
  });
  it('update product low price', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 10,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,

      location: { lat: 10, lng: 10 },
      noProject: true,

      pickupEnabled: true,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValueOnce(draftFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();
  });
  it('update product existing purchase', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const purchaseFixtureOngoing: Partial<Purchase> = {
      id: 'purchase',
      createdAt: now,
      updatedAt: now,
      status: PurchaseStatusEnum.PAYMENT_ACCEPTED,
    };

    let productFixture = {
      ...draftFixture,
      purchases: [purchaseFixtureOngoing as Purchase],
    };
    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,

      location: { lat: 10, lng: 10 },
      noProject: true,

      pickupEnabled: true,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();

    const purchaseFixtureFinished: Partial<Purchase> = {
      id: 'purchase',
      createdAt: now,
      updatedAt: now,
      status: PurchaseStatusEnum.FINISHED_FAILED,
    };
    productFixture = {
      ...productFixture,
      purchases: [purchaseFixtureFinished as Purchase],
    };
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).resolves.toBeDefined();
  });
  it('publish product no category', async () => {
    const { draftFixture, sellerFixure } = getFixtures();

    const productFixture = {
      ...draftFixture,
      category: undefined,
      categoryId: undefined,
    };
    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],

      location: { lat: 10, lng: 10 },
      noProject: true,

      pickupEnabled: true,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();
  });
  it('publish product root category', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const categoryFixturRoot = {
      ...categoryFixture,
      parent: null,
      parentId: null,
    };
    const productFixture = {
      ...draftFixture,
      category: undefined,
      categoryId: undefined,
    };
    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixturRoot.id,

      location: { lat: 10, lng: 10 },
      noProject: true,

      pickupEnabled: true,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    const categoryRepo = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    jest.spyOn(categoryRepo, 'findOne').mockResolvedValue(categoryFixturRoot);
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();
  });
  it('publish product PICKUP', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,

      noProject: true,

      location: { lat: 10, lng: 10 },
      pickupEnabled: true,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(draftFixture as Product);

    await productService.updateProduct(
      input,
      sellerFixure.id,
      sellerFixure.role,
      loggerMock as Logger,
    );
  });
  it('publish product SHIPPING', async () => {
    const {
      categoryFixture,
      draftFixture,
      sellerFixure,
      shippingPriceFixture,
    } = getFixtures();

    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,

      noProject: true,

      shippingPriceIds: [shippingPriceFixture.id],

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(draftFixture as Product);

    await productService.updateProduct(
      input,
      sellerFixure.id,
      sellerFixure.role,
      loggerMock as Logger,
    );
  });
  it('publish product DELIVERY', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,

      noProject: true,

      location: { lat: 10, lng: 10 },
      deliveryEnabled: true,
      deliveryRadius: 3000,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(draftFixture as Product);

    await productService.updateProduct(
      input,
      sellerFixure.id,
      sellerFixure.role,
      loggerMock as Logger,
    );
  });
  it('publish product with soldByQuantity', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 200,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 5,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,
      noProject: true,
      location: { lat: 10, lng: 10 },
      pickupEnabled: true,
      soldByQuantity: true,
      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(draftFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).resolves.toBeDefined();
  });

  it('publish product with soldByQuantity but no primaryQuantity', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 200,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,
      noProject: true,
      location: { lat: 10, lng: 10 },
      pickupEnabled: true,
      soldByQuantity: true,
      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(draftFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();
  });

  it('only looks up public drafts in the ordinary ad editor', async () => {
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    await productService.getDraft('seller');

    expect(productRepo.findOne).toHaveBeenCalledWith({
      where: {
        sellerId: 'seller',
        status: ProductStatus.DRAFT,
        visibility: ProductVisibility.PUBLIC,
      },
      order: { createdAt: 'DESC' },
    });
  });

  it('does not expose a private internal ad through the marketplace product query', async () => {
    const { draftFixture } = getFixtures();
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest.spyOn(productRepo, 'findOne').mockResolvedValue({
      ...draftFixture,
      status: ProductStatus.PUBLISHED,
      visibility: ProductVisibility.INTERNAL,
      publiclyAvailable: false,
      conversations: [],
    } as Product);

    await expect(
      productService.findOne('product', 'organization-member'),
    ).rejects.toBeDefined();
  });

  it('exposes an explicitly public internal ad through the marketplace product query', async () => {
    const { draftFixture } = getFixtures();
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    const publicInternalProduct = {
      ...draftFixture,
      status: ProductStatus.PUBLISHED,
      visibility: ProductVisibility.INTERNAL,
      publiclyAvailable: true,
      conversations: [],
    } as Product;
    jest.spyOn(productRepo, 'findOne').mockResolvedValue(publicInternalProduct);

    await expect(productService.findOne('product', undefined)).resolves.toBe(
      publicInternalProduct,
    );
  });

  it('publish product no transportation', async () => {
    const { categoryFixture, draftFixture, sellerFixure } = getFixtures();

    const input: UpdateProductInput = {
      id: 'product',
      description: 'description',
      price: 40,
      primaryUnit: QuantityUnitEnum.AMOUNT,
      primaryQuantity: 1,
      brandId: 'brand',
      condition: ProductConditionEnum.OKAY,
      addImages: [{ mimeType: 'image/jpeg' }],
      categoryId: categoryFixture.id,

      noProject: true,

      status: ProductStatus.PUBLISHED,
    };

    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(draftFixture as Product);

    await expect(
      productService.updateProduct(
        input,
        sellerFixure.id,
        sellerFixure.role,
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();
  });

  describe('findAll bounding box', () => {
    type QueryBuilderStub = Record<string, jest.Mock>;

    // Chainable QueryBuilder stub — every builder method returns the stub so
    // findAll/basicFindProductsInputQueryBuilder can run without a real DB.
    const buildQueryBuilderStub = (): QueryBuilderStub => {
      const qb: QueryBuilderStub = {};
      const chainable = [
        'addCommonTableExpression',
        'andWhere',
        'innerJoin',
        'leftJoin',
        'addSelect',
        'setParameter',
        'addOrderBy',
        'limit',
        'offset',
      ];
      for (const method of chainable) {
        qb[method] = jest.fn(() => qb);
      }
      qb.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);
      return qb;
    };

    const envelopeCallOf = (qb: QueryBuilderStub) =>
      qb.andWhere.mock.calls.find(
        (call) =>
          typeof call[0] === 'string' && call[0].includes('ST_MakeEnvelope'),
      );

    const useStub = () => {
      const qb = buildQueryBuilderStub();
      const productRepo = module.get<Repository<Product>>(
        getRepositoryToken(Product),
      ) as unknown as { createQueryBuilder: jest.Mock };
      productRepo.createQueryBuilder = jest.fn(() => qb);
      return qb;
    };

    it('restricts results to the viewport envelope with [lat, lng] param order', async () => {
      const qb = useStub();

      await productService.findAll({
        boundingBox: {
          southWest: { lat: 59.0, lng: 18.0 },
          northEast: { lat: 59.5, lng: 18.9 },
        },
      });

      const call = envelopeCallOf(qb);
      expect(call).toBeDefined();
      // ST_MakeEnvelope(xmin, ymin, xmax, ymax): Points are stored [lat, lng],
      // so lat is the x argument and lng the y argument.
      expect(call?.[1]).toEqual({
        swLat: 59.0,
        swLng: 18.0,
        neLat: 59.5,
        neLng: 18.9,
      });
      // Matches on the public map pin location (same source as the map pins),
      // not the exact address, and falls back to the project's pin.
      const sql = call?.[0] as string;
      expect(sql).toContain('map_pin');
      expect(sql).toContain('"mapPinId"');
      expect(sql).not.toContain('addressLocation');
    });

    it('does not add an envelope filter when no boundingBox is supplied', async () => {
      const qb = useStub();

      await productService.findAll({});

      expect(envelopeCallOf(qb)).toBeUndefined();
    });

    it('relatedProducts ignores an incoming boundingBox', async () => {
      const qb = useStub();

      await productService.relatedProducts(
        {
          boundingBox: {
            southWest: { lat: 1, lng: 2 },
            northEast: { lat: 3, lng: 4 },
          },
        },
        [],
      );

      expect(envelopeCallOf(qb)).toBeUndefined();
    });
  });
});

const getFixtures = () => {
  const sellerFixure: Partial<User> = {
    id: 'seller',
    products: [],
    type: UserType.PERSONAL,
    role: UserRoleEnum.USER,
    purchases: [],
    organizations: [],
    organizationUsers: [],
    connectedAccountId: '1',
  };

  const draftFixture: Partial<Product> = {
    id: 'product',
    title: 'product',
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    sellerId: sellerFixure.id,
    seller: sellerFixure as User,
    price: 0,
    isGiveaway: false,
    heightUnit: MeasurementUnitEnum.M,
    widthUnit: MeasurementUnitEnum.M,
    lengthUnit: MeasurementUnitEnum.M,
    thicknessUnit: MeasurementUnitEnum.M,
    diameterUnit: MeasurementUnitEnum.M,
    weightUnit: MeasurementUnitEnum.M,
    colorType: ColorTypeEnum.NCS,
    condition: ProductConditionEnum.NEW,
    status: ProductStatus.DRAFT,
    images: [],
    documents: [],
    likedBy: [],
    pickupEnabled: false,
    deliveryEnabled: false,
    purchases: [],
    conversations: [],
    shippingPrices: [],
    reportProducts: [],
  };

  const categoryFixture: Category = {
    id: 'category',
    name: 'category',
    description: 'category',
    categoryType: CategoryTypeEnum.STANDARD,
    orderIndex: 0,
    parent: new Category(),
    parentId: 'parentId',
    children: [],
    inSelection: false,
    inSeason: false,
    searchAliases: [],
    brands: [],
    measurements: [],
  };

  const shippingPriceFixture: Partial<ShippingPrice> = {
    id: 'shippingPrice',
    maxWeight: 5,
    price: 29,
    provider: ShippingProviderEnum.POSTNORD,
    products: [],
  };

  return {
    sellerFixure,
    draftFixture,
    categoryFixture,
    shippingPriceFixture,
  };
};
