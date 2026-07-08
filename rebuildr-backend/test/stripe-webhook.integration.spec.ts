import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import Stripe from 'stripe';
import { StripWebhookController } from 'src/controllers/stripe-webhook.controller';
import { PurchaseService } from 'src/services/purchase.service';
import { StripeService } from 'src/services/stripe.service';
import { ProductService } from 'src/services/product.service';
import { ShippingService } from 'src/services/shipping.service';
import { SystemMessagesService } from 'src/services/system-messages.service';
import { ReportPurchaseService } from 'src/services/report-purchase.service';
import { GeocodingService } from 'src/services/geocoding.service';
import { Purchase } from 'src/entities/purchase.entity';
import { Product } from 'src/entities/product.entity';
import { ProductStatus } from 'src/entities/product.entity';
import { User, UserType } from 'src/entities/user.entity';
import { Review } from 'src/entities/review.entity';
import { TransportationEnum } from 'src/entities/purchase.entity';
import { OrganizationService } from 'src/services/organization.service';
import { ShippingPriceService } from 'src/services/shipping-price.service';
import { ShippingPrice } from 'src/entities/shipping-price.entity';

describe('Stripe webhook', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let purchaseService: PurchaseService;
  let shippingService: { bookShipping: jest.Mock };
  let constructEventSpy: jest.SpyInstance;
  let purchaseRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
  };
  let productRepository: { save: jest.Mock; update: jest.Mock };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [StripWebhookController],
      providers: [
        PurchaseService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn(), save: jest.fn(), update: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: ProductService,
          useValue: { updateStatus: jest.fn() },
        },
        {
          provide: ShippingService,
          useValue: { bookShipping: jest.fn() },
        },
        {
          provide: SystemMessagesService,
          useValue: {
            createSystemMessage: jest.fn().mockResolvedValue(undefined),
            purchaseWithShippingBuyer: jest.fn().mockResolvedValue(undefined),
            purchaseWithShippingSeller: jest.fn().mockResolvedValue(undefined),
            purchaseWithHandoffBuyer: jest.fn().mockResolvedValue(undefined),
            purchaseWithHandoffSeller: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ReportPurchaseService,
          useValue: { resolve: jest.fn() },
        },
        {
          provide: GeocodingService,
          useValue: { addressToLocation: jest.fn() },
        },
        {
          provide: ShippingPriceService,
          useValue: { shippingPriceMatchingWeight: jest.fn() },
        },
        {
          provide: getRepositoryToken(ShippingPrice),
          useValue: { find: jest.fn() },
        },
        StripeService,
        {
          provide: OrganizationService,
          useValue: { lookupOrganizationNumber: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'STRIPE_SECRET_KEY') return 'sk_test_123';
              if (key === 'STRIPE_WEBHOOK_SECRET_SNAPSHOT_PLATFORM_ACCOUNT') {
                return 'whsec_platform';
              }
              if (key === 'STRIPE_WEBHOOK_SECRET_SNAPSHOT_CONNECTED_ACCOUNT') {
                return 'whsec_connected';
              }
              return undefined;
            }),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            child: () => ({
              info: jest.fn(),
              error: jest.fn(),
            }),
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    purchaseService = moduleRef.get(PurchaseService);
    shippingService = moduleRef.get(ShippingService);
    purchaseRepository = moduleRef.get(getRepositoryToken(Purchase));
    productRepository = moduleRef.get(getRepositoryToken(Product));

    app = moduleRef.createNestApplication();
    await app.init();

    const controller = moduleRef.get(StripWebhookController);
    const stripe = (controller as unknown as { stripe: Stripe }).stripe;
    constructEventSpy = jest.spyOn(stripe.webhooks, 'constructEvent');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('payment_intent.created', async () => {
    const payload = { id: 'pi_123' };
    constructEventSpy.mockReturnValue({
      id: 'evt_platform',
      type: 'payment_intent.created',
      data: { object: payload },
    });

    const purchaseFixture = {
      id: 'purchase-1',
      paymentIntentId: 'pi_123',
      paymentStartedAt: null,
    };

    purchaseRepository.findOne.mockResolvedValue(purchaseFixture);
    purchaseRepository.save.mockImplementation((purchase) => purchase);

    await request(app.getHttpServer())
      .post('/stripe-webhook/platform-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);
    expect(purchaseRepository.findOne).toHaveBeenCalledWith({
      where: { paymentIntentId: 'pi_123' },
    });
    expect(purchaseRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'purchase-1',
        paymentStartedAt: expect.any(Date),
      }),
    );
  });

  it('payment_intent.succeeded', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_platform_success',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_456', latest_charge: 'ch_456' } },
    });

    const purchaseFixture = {
      id: 'purchase-2',
      paymentIntentId: 'pi_456',
      paymentAcceptedAt: null,
      transportationMethod: TransportationEnum.SHIPPING,
      buyer: { id: 'buyer-1' },
      product: { seller: { id: 'seller-1' } },
      shippingPrice: null,
    };

    purchaseRepository.findOne.mockResolvedValue(purchaseFixture);
    purchaseRepository.update.mockResolvedValue({ affected: 1 });

    await request(app.getHttpServer())
      .post('/stripe-webhook/platform-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(purchaseRepository.findOne).toHaveBeenCalledWith({
      where: { paymentIntentId: 'pi_456' },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });
    expect(purchaseRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ paymentIntentId: 'pi_456' }),
      expect.objectContaining({ paymentAcceptedAt: expect.any(Date) }),
    );
    expect(shippingService.bookShipping).toHaveBeenCalledWith(
      'purchase-2',
      expect.any(Object),
    );
  });

  it('payment_intent.canceled', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_platform_canceled',
      type: 'payment_intent.canceled',
      data: { object: { id: 'pi_789' } },
    });

    const purchaseFixture = {
      id: 'purchase-3',
      paymentIntentId: 'pi_789',
      failedAt: null,
      product: { id: 'product-3', status: ProductStatus.SOLD },
    };

    purchaseRepository.findOne.mockResolvedValue(purchaseFixture);
    purchaseRepository.save.mockImplementation((purchase) => purchase);

    await request(app.getHttpServer())
      .post('/stripe-webhook/platform-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(purchaseRepository.findOne).toHaveBeenCalledWith({
      where: { paymentIntentId: 'pi_789' },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });
    expect(productRepository.save).toHaveBeenCalledWith({
      id: 'product-3',
      status: ProductStatus.PUBLISHED,
    });
    expect(purchaseRepository.remove).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'purchase-3',
        failedAt: expect.any(Date),
      }),
    );
  });

  it('payment_intent.payment_failed', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_platform_failed',
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_111' } },
    });

    const purchaseFixture = {
      id: 'purchase-4',
      productId: 'product-4',
      paymentIntentId: 'pi_111',
      buyer: { id: 'buyer-4' },
      product: { seller: { id: 'seller-4' } },
      shippingPrice: null,
    };

    purchaseRepository.findOne.mockResolvedValue(purchaseFixture);

    await request(app.getHttpServer())
      .post('/stripe-webhook/platform-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(purchaseRepository.findOne).toHaveBeenCalledWith({
      where: { paymentIntentId: 'pi_111' },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });
    expect(productRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: ProductStatus.PUBLISHED }),
    );
    expect(purchaseRepository.remove).toHaveBeenCalledWith(purchaseFixture);
  });

  it('refund.created', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_platform_refund',
      type: 'refund.created',
      data: {
        object: {
          id: 're_123',
          status: 'succeeded',
          payment_intent: 'pi_222',
          charge: 'ch_222',
        },
      },
    });

    const purchaseFixture = {
      id: 'purchase-5',
      productId: 'product-5',
      paymentIntentId: 'pi_222',
      reportPurchase: null,
      product: { id: 'product-5', status: ProductStatus.SOLD },
    };

    purchaseRepository.findOne.mockResolvedValue(purchaseFixture);
    purchaseRepository.update.mockResolvedValue({ affected: 1 });

    await request(app.getHttpServer())
      .post('/stripe-webhook/platform-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(purchaseRepository.findOne).toHaveBeenCalledWith({
      where: { paymentIntentId: 'pi_222' },
      relations: { reportPurchase: true, product: true },
    });
    expect(productRepository.save).toHaveBeenCalledWith({
      id: 'product-5',
      status: ProductStatus.PUBLISHED,
    });
    expect(purchaseRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'purchase-5' }),
      expect.objectContaining({
        failedAt: expect.any(Date),
        refundId: 're_123',
      }),
    );
  });

  it('payout.created', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_connected_payout',
      type: 'payout.created',
      data: { object: { id: 'po_456' } },
    });

    const payoutStartedSpy = jest.spyOn(purchaseService, 'payoutStarted');

    await request(app.getHttpServer())
      .post('/stripe-webhook/connected-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(payoutStartedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'po_456' }),
      expect.any(Object),
    );
    expect(purchaseRepository.update).toHaveBeenCalledWith(
      { payoutId: 'po_456' },
      { payoutStartedAt: expect.any(Date) },
    );
  });

  it('account.updated', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_connected_account',
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_123',
          business_profile: { url: 'https://example.com' },
          individual: {
            first_name: 'First_name',
            last_name: 'Last_name',
            address: {
              line1: 'Main St 1',
              city: 'Stockholm',
              postal_code: '12345',
            },
            phone: '+46700000000',
          },
        },
      },
    });

    const stripeService = moduleRef.get(StripeService);
    const onAccountUpdatedSpy = jest.spyOn(stripeService, 'onAccountUpdated');

    const userRepository = moduleRef.get(getRepositoryToken(User));
    const userFixture = {
      id: 'user-1',
      type: UserType.PERSONAL,
      connectedAccountId: 'acct_123',
      name: null,
      address: null,
    };
    userRepository.findOne.mockResolvedValue(userFixture);
    userRepository.save.mockImplementation((user) => user);

    const geocodingService = moduleRef.get(GeocodingService);
    (geocodingService.addressToLocation as jest.Mock).mockResolvedValue({
      lat: 59.0,
      lng: 18.0,
    });

    await request(app.getHttpServer())
      .post('/stripe-webhook/connected-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(onAccountUpdatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'acct_123' }),
    );
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { connectedAccountId: 'acct_123' },
    });
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: 'acct_123',
        websiteUrl: 'https://example.com',
        name: 'First_name Last_name',
        address: 'Main St 1',
        postCode: '12345',
        city: 'Stockholm',
        phoneNumber: '+46700000000',
      }),
    );
  });

  it('payout.failed', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_connected_payout_failed',
      type: 'payout.failed',
      data: { object: { id: 'po_failed' } },
    });

    const payoutFailedSpy = jest.spyOn(purchaseService, 'payoutFailed');

    await request(app.getHttpServer())
      .post('/stripe-webhook/connected-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(payoutFailedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'po_failed' }),
      expect.any(Object),
    );
    expect(purchaseRepository.update).toHaveBeenCalledWith(
      { payoutId: 'po_failed' },
      { payoutFailedAt: expect.any(Date) },
    );
  });

  it('payout.paid', async () => {
    constructEventSpy.mockReturnValue({
      id: 'evt_connected_payout_paid',
      type: 'payout.paid',
      data: { object: { id: 'po_paid' } },
    });

    const payoutCompleteSpy = jest.spyOn(purchaseService, 'payoutComplete');

    const purchaseFixture = {
      id: 'purchase-6',
      payoutId: 'po_paid',
      payoutReceivedAt: null,
      buyerId: 'buyer-6',
    };

    purchaseRepository.findOne.mockResolvedValue(purchaseFixture);
    purchaseRepository.save.mockImplementation((purchase) => purchase);

    await request(app.getHttpServer())
      .post('/stripe-webhook/connected-account')
      .set('stripe-signature', 'test-signature')
      .send({})
      .expect(200);

    expect(payoutCompleteSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'po_paid' }),
      expect.any(Object),
    );
    expect(purchaseRepository.findOne).toHaveBeenCalledWith({
      where: { payoutId: 'po_paid' },
    });
    expect(purchaseRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'purchase-6',
        payoutReceivedAt: expect.any(Date),
      }),
    );
  });
});
