import { Test, TestingModule } from '@nestjs/testing';
import { StripeMock } from './mocks/stripe.mock';
import { Logger } from 'winston';
import { PurchaseService } from 'src/services/purchase.service';
import { StripeService } from 'src/services/stripe.service';
import { PostnordAPI } from 'src/apis/postnord.api';
import { PostnordMock } from './mocks/postnord.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Purchase,
  PurchaseStatusEnum,
  SupportedPaymentMethod,
  TransportationEnum,
} from 'src/entities/purchase.entity';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { User, UserRoleEnum, UserType } from 'src/entities/user.entity';
import { Review } from 'src/entities/review.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductService } from 'src/services/product.service';
import { Repository } from 'typeorm';
import { ModuleMocker, MockMetadata } from 'jest-mock';
import {
  ShippingPrice,
  ShippingProviderEnum,
} from 'src/entities/shipping-price.entity';
import {
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
} from 'src/exceptions';
import { SCBAPI } from 'src/apis/scb.api';
import { SCBAPIMock } from './mocks/scb-api.mock';

const moduleMocker = new ModuleMocker(global);

describe('Purchase e2e', () => {
  let purchaseService: PurchaseService;
  let stripeService: StripeService;
  let module: TestingModule;

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
  const mockRepositoryPurchase = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const loggerMock: Partial<Logger> = {
    info: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockRepositoryPurchase,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepositoryProduct,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockRepository,
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
          provide: SCBAPI,
          useClass: SCBAPIMock,
        },
      ],
    })
      .useMocker((token) => {
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

    purchaseService = module.get<PurchaseService>(PurchaseService);
    stripeService = module.get<StripeService>(StripeService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('cancelPurchase', () => {
    it('cancels purchase, resets product status, and marks failedAt', async () => {
      const productFixture: Partial<Product> = {
        id: 'product-1',
        status: ProductStatus.SOLD,
      };

      const purchaseFixture: Partial<Purchase> = {
        id: 'purchase-1',
        buyerId: 'buyer-1',
        status: PurchaseStatusEnum.CLAIMED,
        paymentIntentId: 'pi_123',
        failedAt: null,
        product: productFixture as Product,
      };

      mockRepositoryPurchase.findOne.mockResolvedValue(
        purchaseFixture as Purchase,
      );
      mockRepositoryProduct.save.mockResolvedValue(productFixture as Product);
      mockRepositoryPurchase.save.mockImplementation(
        (purchase: Purchase) => purchase,
      );

      const stripeSpy = jest
        .spyOn(stripeService, 'cancelPayment')
        .mockResolvedValue(undefined);

      const response = await purchaseService.cancelPurchase(
        'purchase-1',
        'buyer-1',
      );

      expect(stripeSpy).toHaveBeenCalledWith('pi_123');
      expect(mockRepositoryProduct.save).toHaveBeenCalledWith({
        ...productFixture,
        status: ProductStatus.PUBLISHED,
      });
      expect(mockRepositoryPurchase.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedAt: expect.any(Date),
        }),
      );
      expect(response.failedAt).toBeTruthy();
    });

    it('returns purchase when already failed', async () => {
      const purchaseFixture: Partial<Purchase> = {
        id: 'purchase-2',
        buyerId: 'buyer-1',
        status: PurchaseStatusEnum.CLAIMED,
        paymentIntentId: 'pi_123',
        failedAt: new Date(),
        product: { id: 'product-2', status: ProductStatus.SOLD } as Product,
      };

      mockRepositoryPurchase.findOne.mockResolvedValue(
        purchaseFixture as Purchase,
      );

      const stripeSpy = jest.spyOn(stripeService, 'cancelPayment');

      const response = await purchaseService.cancelPurchase(
        'purchase-2',
        'buyer-1',
      );

      expect(stripeSpy).not.toHaveBeenCalled();
      expect(response).toEqual(purchaseFixture);
    });

    it('throws ForbiddenException when buyer does not match', async () => {
      const purchaseFixture: Partial<Purchase> = {
        id: 'purchase-3',
        buyerId: 'buyer-1',
        status: PurchaseStatusEnum.CLAIMED,
        paymentIntentId: 'pi_123',
        product: { id: 'product-3', status: ProductStatus.SOLD } as Product,
      };

      mockRepositoryPurchase.findOne.mockResolvedValue(
        purchaseFixture as Purchase,
      );

      await expect(
        purchaseService.cancelPurchase('purchase-3', 'buyer-2'),
      ).rejects.toMatchObject(ForbiddenException());
    });

    it('throws BadUserInputException when status is invalid', async () => {
      const purchaseFixture: Partial<Purchase> = {
        id: 'purchase-4',
        buyerId: 'buyer-1',
        status: PurchaseStatusEnum.PAYMENT_ACCEPTED,
        paymentIntentId: 'pi_123',
        product: { id: 'product-4', status: ProductStatus.SOLD } as Product,
      };

      mockRepositoryPurchase.findOne.mockResolvedValue(
        purchaseFixture as Purchase,
      );

      await expect(
        purchaseService.cancelPurchase('purchase-4', 'buyer-1'),
      ).rejects.toMatchObject(BadUserInputException());
    });

    it('throws InternalServerException when paymentIntentId is missing', async () => {
      const purchaseFixture: Partial<Purchase> = {
        id: 'purchase-5',
        buyerId: 'buyer-1',
        status: PurchaseStatusEnum.CLAIMED,
        paymentIntentId: null,
        product: { id: 'product-5', status: ProductStatus.SOLD } as Product,
      };

      mockRepositoryPurchase.findOne.mockResolvedValue(
        purchaseFixture as Purchase,
      );

      await expect(
        purchaseService.cancelPurchase('purchase-5', 'buyer-1'),
      ).rejects.toMatchObject(
        InternalServerException('Missing paymentIntentId'),
      );
    });
  });

  it('test purchase PICKUP with soldByQuantity', async () => {
    const now = new Date();
    const unitPrice = 10_00;
    const primaryQuantity = 5;
    const purchasedQuantity = 3;

    const buyerFixture: Partial<User> = {
      id: 'buyer',
      products: [],
      type: UserType.PERSONAL,
      role: UserRoleEnum.USER,
      purchases: [],
      organizations: [],
      organizationUsers: [],
      customerId: '1',
    };
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

    const productFixture: Partial<Product> = {
      id: 'product',
      title: 'product',
      createdAt: now,
      updatedAt: now,
      sellerId: 'seller',
      seller: sellerFixure as User,
      price: unitPrice,
      isGiveaway: false,
      status: ProductStatus.PUBLISHED,
      soldByQuantity: true,
      primaryQuantity,
      images: [],
      documents: [],
      pickupEnabled: true,
      deliveryEnabled: false,
      purchases: [],
      shippingPrices: [],
    };

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(buyerFixture as User);
    mockRepositoryPurchase.save.mockImplementation((p: Purchase) => {
      return { ...p, id: 'purchaseId' };
    });

    const stripeSpy = jest.spyOn(stripeService, 'createPayment');

    const response = await purchaseService.createPurchase(
      {
        productId: 'product',
        paymentMethod: SupportedPaymentMethod.CARD,
        transportationMethod: TransportationEnum.PICKUP,
        purchasedQuantity,
        successUrl: '',
        failureUrl: '',
      },
      'userId',
      loggerMock as Logger,
    );

    expect(response.purchase).toMatchObject({
      transportationMethod: TransportationEnum.PICKUP,
      paymentMethod: SupportedPaymentMethod.CARD,
      buyer: buyerFixture,
      product: productFixture,
      purchasedQuantity,
    });

    const { escrow, fee } = PurchaseService.calculateSellSummary({
      productPrice: unitPrice * purchasedQuantity,
      shippingPrice: 0,
      deliveryPrice: 0,
    });
    expect(stripeSpy).toHaveBeenCalledWith(
      sellerFixure.connectedAccountId,
      escrow + fee,
      fee,
      buyerFixture,
      SupportedPaymentMethod.CARD,
      'product',
      { productId: 'product', sellerId: 'seller' },
    );

    // Product should have primaryQuantity decremented but not be SOLD
    expect(productRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        primaryQuantity: primaryQuantity - purchasedQuantity,
        status: ProductStatus.PUBLISHED,
      }),
    );
  });

  it('test purchase PICKUP with soldByQuantity - all units bought marks product SOLD', async () => {
    const now = new Date();
    const unitPrice = 10_00;
    const primaryQuantity = 5;
    const purchasedQuantity = 5;

    const buyerFixture: Partial<User> = {
      id: 'buyer',
      products: [],
      type: UserType.PERSONAL,
      role: UserRoleEnum.USER,
      purchases: [],
      organizations: [],
      organizationUsers: [],
      customerId: '1',
    };
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

    const productFixture: Partial<Product> = {
      id: 'product',
      title: 'product',
      createdAt: now,
      updatedAt: now,
      sellerId: 'seller',
      seller: sellerFixure as User,
      price: unitPrice,
      isGiveaway: false,
      status: ProductStatus.PUBLISHED,
      soldByQuantity: true,
      primaryQuantity,
      images: [],
      documents: [],
      pickupEnabled: true,
      deliveryEnabled: false,
      purchases: [],
      shippingPrices: [],
    };

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(buyerFixture as User);
    mockRepositoryPurchase.save.mockImplementation((p: Purchase) => {
      return { ...p, id: 'purchaseId' };
    });

    await purchaseService.createPurchase(
      {
        productId: 'product',
        paymentMethod: SupportedPaymentMethod.CARD,
        transportationMethod: TransportationEnum.PICKUP,
        purchasedQuantity,
        successUrl: '',
        failureUrl: '',
      },
      'userId',
      loggerMock as Logger,
    );

    expect(productRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        primaryQuantity: 0,
        status: ProductStatus.SOLD,
      }),
    );
  });

  it('test purchase PICKUP with soldByQuantity - purchasedQuantity exceeds primaryQuantity throws error', async () => {
    const now = new Date();
    const unitPrice = 10_00;
    const primaryQuantity = 5;
    const purchasedQuantity = 6;

    const buyerFixture: Partial<User> = {
      id: 'buyer',
      products: [],
      type: UserType.PERSONAL,
      role: UserRoleEnum.USER,
      purchases: [],
      organizations: [],
      organizationUsers: [],
      customerId: '1',
    };
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

    const productFixture: Partial<Product> = {
      id: 'product',
      title: 'product',
      createdAt: now,
      updatedAt: now,
      sellerId: 'seller',
      seller: sellerFixure as User,
      price: unitPrice,
      isGiveaway: false,
      status: ProductStatus.PUBLISHED,
      soldByQuantity: true,
      primaryQuantity,
      images: [],
      documents: [],
      pickupEnabled: true,
      deliveryEnabled: false,
      purchases: [],
      shippingPrices: [],
    };

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(buyerFixture as User);

    await expect(
      purchaseService.createPurchase(
        {
          productId: 'product',
          paymentMethod: SupportedPaymentMethod.CARD,
          transportationMethod: TransportationEnum.PICKUP,
          purchasedQuantity,
          successUrl: '',
          failureUrl: '',
        },
        'userId',
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();
  });

  it('test purchase PICKUP with purchasedQuantity but soldByQuantity is false throws error', async () => {
    const now = new Date();

    const buyerFixture: Partial<User> = {
      id: 'buyer',
      products: [],
      type: UserType.PERSONAL,
      role: UserRoleEnum.USER,
      purchases: [],
      organizations: [],
      organizationUsers: [],
      customerId: '1',
    };
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

    const productFixture: Partial<Product> = {
      id: 'product',
      title: 'product',
      createdAt: now,
      updatedAt: now,
      sellerId: 'seller',
      seller: sellerFixure as User,
      price: 40_00,
      isGiveaway: false,
      status: ProductStatus.PUBLISHED,
      soldByQuantity: false,
      primaryQuantity: 1,
      images: [],
      documents: [],
      pickupEnabled: true,
      deliveryEnabled: false,
      purchases: [],
      shippingPrices: [],
    };

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(buyerFixture as User);

    await expect(
      purchaseService.createPurchase(
        {
          productId: 'product',
          paymentMethod: SupportedPaymentMethod.CARD,
          transportationMethod: TransportationEnum.PICKUP,
          purchasedQuantity: 1,
          successUrl: '',
          failureUrl: '',
        },
        'userId',
        loggerMock as Logger,
      ),
    ).rejects.toBeDefined();
  });

  it('test purchase PICKUP', async () => {
    const now = new Date();
    const productPrice = 40_00;

    const buyerFixture: Partial<User> = {
      id: 'buyer',
      products: [],
      type: UserType.PERSONAL,
      role: UserRoleEnum.USER,
      purchases: [],
      organizations: [],
      organizationUsers: [],
      customerId: '1',
    };
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

    const productFixture: Partial<Product> = {
      id: 'product',
      title: 'product',
      createdAt: now,
      updatedAt: now,
      sellerId: 'user',
      seller: sellerFixure as User,
      price: productPrice,
      isGiveaway: false,
      status: ProductStatus.PUBLISHED,
      images: [],
      documents: [],
      pickupEnabled: true,
      deliveryEnabled: false,
      purchases: [],
      shippingPrices: [],
    };

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(buyerFixture as User);
    mockRepositoryPurchase.save.mockImplementation((p: Purchase) => {
      return { ...p, id: 'purchaseId' };
    });

    const stripeSpy = jest.spyOn(stripeService, 'createPayment');

    const response = await purchaseService.createPurchase(
      {
        productId: 'product',
        paymentMethod: SupportedPaymentMethod.CARD,
        transportationMethod: TransportationEnum.PICKUP,
        successUrl: '',
        failureUrl: '',
      },
      'userId',
      loggerMock as Logger,
    );

    expect(response.purchase).toMatchObject({
      transportationMethod: TransportationEnum.PICKUP,
      paymentMethod: SupportedPaymentMethod.CARD,
      buyer: buyerFixture,
      product: productFixture,
    });

    const { escrow, fee } = PurchaseService.calculateSellSummary({
      productPrice: productPrice,
      shippingPrice: 0,
      deliveryPrice: 0,
    });
    expect(stripeSpy).toHaveBeenCalledWith(
      sellerFixure.connectedAccountId,
      escrow + fee,
      fee,
      buyerFixture,
      SupportedPaymentMethod.CARD,
      'product',
      { productId: 'product', sellerId: 'seller' },
    );
    expect(productRepo.save).toHaveBeenCalledWith({
      ...productFixture,
      status: ProductStatus.SOLD,
    });
  });

  it('test purchase DELIVERY', async () => {
    const now = new Date();
    const productPrice = 40_00;

    const buyerFixture: Partial<User> = {
      id: 'buyer',
      products: [],
      type: UserType.PERSONAL,
      role: UserRoleEnum.USER,
      purchases: [],
      organizations: [],
      organizationUsers: [],
      customerId: '1',
    };
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

    const productFixture: Partial<Product> = {
      id: 'product',
      title: 'product',
      createdAt: now,
      updatedAt: now,
      sellerId: 'user',
      seller: sellerFixure as User,
      price: productPrice,
      isGiveaway: false,
      status: ProductStatus.PUBLISHED,
      images: [],
      documents: [],
      pickupEnabled: true,
      deliveryEnabled: true,
      deliveryRadius: 3000,
      deliveryPrice: 20_00,
      purchases: [],
      shippingPrices: [],
    };

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    const productService = module.get<ProductService>(ProductService);

    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(buyerFixture as User);
    mockRepositoryPurchase.save.mockImplementation((p: Purchase) => {
      return { ...p, id: 'purchaseId' };
    });

    const stripeSpy = jest.spyOn(stripeService, 'createPayment');
    jest.spyOn(productService, 'distanceToProduct').mockResolvedValue(1000);

    const response = await purchaseService.createPurchase(
      {
        productId: 'product',
        paymentMethod: SupportedPaymentMethod.CARD,
        transportationMethod: TransportationEnum.DELIVERY,
        deliverToAddress: 'address',
        deliverToLocation: { lat: 10, lng: 10 },
        successUrl: '',
        failureUrl: '',
      },
      'userId',
      loggerMock as Logger,
    );

    expect(response.purchase).toMatchObject({
      transportationMethod: TransportationEnum.DELIVERY,
      paymentMethod: SupportedPaymentMethod.CARD,
      buyer: buyerFixture,
      product: productFixture,
      deliverToAddress: 'address',
      deliverToLocation: { type: 'Point', coordinates: [10, 10] },
    });

    const { escrow, fee } = PurchaseService.calculateSellSummary({
      productPrice: productPrice,
      shippingPrice: 0,
      deliveryPrice: productFixture.deliveryPrice,
    });
    expect(stripeSpy).toHaveBeenCalledWith(
      sellerFixure.connectedAccountId,
      escrow + fee,
      fee,
      buyerFixture,
      SupportedPaymentMethod.CARD,
      'product',
      { productId: 'product', sellerId: 'seller' },
    );
    expect(productRepo.save).toHaveBeenCalledWith({
      ...productFixture,
      status: ProductStatus.SOLD,
    });
  });

  it('test purchase SHIPPING', async () => {
    const now = new Date();
    const productPrice = 40_00;

    const shippingPrices: Partial<ShippingPrice>[] = [
      {
        id: 'shippingPrice 1',
        price: 2900,
        provider: ShippingProviderEnum.POSTNORD,
        maxWeight: 20,
      },
    ];

    const buyerFixture: Partial<User> = {
      id: 'buyer',
      products: [],
      type: UserType.PERSONAL,
      role: UserRoleEnum.USER,
      purchases: [],
      organizations: [],
      organizationUsers: [],
      customerId: '1',
    };
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

    const productFixture: Partial<Product> = {
      id: 'product',
      title: 'product',
      createdAt: now,
      updatedAt: now,
      sellerId: 'user',
      seller: sellerFixure as User,
      price: productPrice,
      isGiveaway: false,
      status: ProductStatus.PUBLISHED,
      images: [],
      documents: [],
      pickupEnabled: true,
      deliveryEnabled: true,
      purchases: [],
      shippingPrices: shippingPrices as ShippingPrice[],
    };

    const userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    const productRepo = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    jest
      .spyOn(productRepo, 'findOne')
      .mockResolvedValue(productFixture as Product);
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(buyerFixture as User);
    mockRepositoryPurchase.save.mockImplementation((p: Purchase) => {
      return { ...p, id: 'purchaseId' };
    });

    const stripeSpy = jest.spyOn(stripeService, 'createPayment');

    const response = await purchaseService.createPurchase(
      {
        productId: 'product',
        paymentMethod: SupportedPaymentMethod.CARD,
        transportationMethod: TransportationEnum.SHIPPING,
        shippingProvider: ShippingProviderEnum.POSTNORD,
        servicePointId: 'servicePoint',
        successUrl: '',
        failureUrl: '',
      },
      'userId',
      loggerMock as Logger,
    );

    expect(response.purchase).toMatchObject({
      transportationMethod: TransportationEnum.SHIPPING,
      paymentMethod: SupportedPaymentMethod.CARD,
      buyer: buyerFixture,
      product: productFixture,
      shippingPrice: shippingPrices[0],
    });

    const { escrow, fee } = PurchaseService.calculateSellSummary({
      productPrice: productPrice,
      shippingPrice: shippingPrices[0].price,
      deliveryPrice: 0,
    });
    expect(stripeSpy).toHaveBeenCalledWith(
      sellerFixure.connectedAccountId,
      escrow + fee,
      fee,
      buyerFixture,
      SupportedPaymentMethod.CARD,
      'product',
      { productId: 'product', sellerId: 'seller' },
    );
    expect(productRepo.save).toHaveBeenCalledWith({
      ...productFixture,
      status: ProductStatus.SOLD,
    });
  });
});
