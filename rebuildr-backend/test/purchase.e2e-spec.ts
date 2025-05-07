import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { RockerAPI } from 'src/apis/rocker.api';
import { RockerService } from 'src/services/rocker.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { GqlExecutionContext, GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import {
  IOfferResponse,
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentResponse,
  IPaymentStarted,
  IPayoutResponse,
  OfferStatusEnum,
  PauseStateEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  PayoutConsentEnum,
  PayoutMethodEnum,
  Status1Enum,
} from 'src/apis/types/rocker-types';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { mockRepository, mockRepositoryType } from './mocks/repository.mock';
import { Product } from 'src/entities/product.entity';
import { RockerWebhookController } from 'src/controllers/rocker-webhook.controller';
import { Purchase } from 'src/entities/purchase.entity';
import { PurchaseResolver } from 'src/resolvers/purchase.resolver';
import { PurchaseService } from 'src/services/purchase.service';
import { PlaceholderResolver } from './placeholder.resolver';
import * as crypto from 'crypto';
import { EnvironmentVariables } from 'src/config';

describe('Purchase', () => {
  let app: INestApplication;
  let rockerAPI: RockerAPI;
  let userRepository: mockRepositoryType;
  let purchaseRepository: mockRepositoryType;
  let productRepository: mockRepositoryType;
  let configService: ConfigService<EnvironmentVariables>;
  beforeEach(async () => {
    const mockGuard = {
      canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context).getContext().req;
        ctx.user = {
          id: '123',
          email: 'test@test.com',
          role: UserRoleEnum.USER,
        };
        return true;
      }),
      getRequest: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService<EnvironmentVariables>) => {
            return {
              secret: configService.get('JWT_SECRET'),
              signOptions: { expiresIn: jwtConstants.expiresIn },
            };
          },
        }),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
          driver: ApolloDriver,
          useFactory: () => {
            return {
              autoSchemaFile: true,
              context: ({ req, res }) => ({
                req,
                res,
              }),
            };
          },
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 1000,
            limit: 2,
          },
        ]),
      ],
      controllers: [RockerWebhookController],
      providers: [
        GqlAuthGuard,
        JwtStrategy,
        CaslAbilityFactory,
        RockerService,
        RockerAPI,
        PurchaseResolver,
        PurchaseService,
        PlaceholderResolver,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Purchase),
          useFactory: mockRepository,
        },
      ],
    })
      .overrideGuard(GqlAuthGuard)
      .useValue(mockGuard)
      .compile();
    app = module.createNestApplication();
    await app.init();

    userRepository = module.get(getRepositoryToken(User));
    rockerAPI = module.get<RockerAPI>(RockerAPI);
    purchaseRepository = module.get(getRepositoryToken(Purchase));
    productRepository = module.get(getRepositoryToken(Product));
    configService = module.get(ConfigService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });

  it('purchase product', async () => {
    const purchaseProduct = `
      mutation PurchaseProduct($input: PurchaseProductInput!) {
        purchaseProduct(input: $input) {
          product {
            id
          }
          purchase {
            id
          }
        }
      }`;
    const seller = new User();
    seller.id = 'sellerId';
    seller.rockerUserId = 'sellerRockerUserId';

    const product = new Product();
    product.id = 'productId';
    product.title = 'productTitle';
    product.price = 100;
    product.seller = seller;
    product.purchases = [];

    const buyer = new User();
    buyer.id = 'buyerId';
    buyer.rockerUserId = 'buyerRockerUserId';

    productRepository.findOne.mockResolvedValue(product);
    userRepository.findOne.mockResolvedValue(buyer);

    const createOfferResponse: IOfferResponse = {
      id: 'offerId',
      status: OfferStatusEnum.AVAILABLE,
      title: product.title,
      price: {
        amount: 100,
        currency: 'SEK',
        unit: 'MINOR',
      },
      sellerId: seller.rockerUserId,
      escrowValue: {
        amount: 90,
        currency: 'SEK',
        unit: 'MINOR',
      },
      serviceFee: {
        actual: {
          amount: 10,
          currency: 'SEK',
          unit: 'MINOR',
        },
      },
      serviceFeeRefundable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      offerUrl: 'string',
      externalData: { productId: product.id },
    };

    const createPaymentResponse: IPaymentResponse = {
      id: 'paymentId',
      merchantId: 'merchantId',
      sellerId: seller.rockerUserId,
      offerId: createOfferResponse.id,
      buyerId: buyer.rockerUserId,
      amount: {
        amount: 100,
        currency: 'SEK',
        unit: 'MINOR',
      },
      paymentMethod: PaymentMethodEnum.SWISH,
      reference: 'paymentId',
      status: PaymentStatusEnum.INIT,
      payoutConsent: PayoutConsentEnum.UNDEFINED,
      createdAt: new Date(),
      updatedAt: new Date(),
      pauseState: PauseStateEnum.NOT_PAUSED,
      title: 'paymentTitle',
    };

    jest.spyOn(rockerAPI, 'createOffer').mockResolvedValue(createOfferResponse);
    jest
      .spyOn(rockerAPI, 'createSwishPayment')
      .mockResolvedValue(createPaymentResponse);

    const purchase = new Purchase();
    purchase.buyer = buyer;
    purchase.product = product;
    purchase.rockerOfferId = createOfferResponse.id;
    purchase.rockerPaymentId = createPaymentResponse.id;

    purchaseRepository.save.mockResolvedValue({
      id: 'purchaseId',
      ...purchase,
    });

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: purchaseProduct,
        variables: {
          input: {
            productId: 'productId',
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.purchaseProduct).toMatchObject({
          product: { id: product.id },
          purchase: { id: 'purchaseId' },
        });
      });

    expect(rockerAPI.createOffer).toHaveBeenCalledTimes(1);
    expect(rockerAPI.createStripePayment).toHaveBeenCalledTimes(1);
    expect(purchaseRepository.save).toHaveBeenCalledWith({ ...purchase });
  });

  it('payment started', async () => {
    const body: IPaymentStarted = {
      $type: 'PaymentStarted',
      offerId: 'offerId',
      paymentId: 'paymentId',
      status: PaymentStatusEnum.INIT,
      timestamp: new Date(),
    };

    const secret = configService.get('ROCKER_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    const timestamp = new Date().getTime();
    hmac.update(`${timestamp}.${body}`);
    const serverSignature = hmac.digest('hex');

    const purchase = new Purchase();

    purchaseRepository.findOne.mockResolvedValue(purchase);

    await request(app.getHttpServer())
      .post('/rocker-webhook')
      .set({
        'X-Rocker-Pay-Signature': serverSignature,
        'X-Rocker-Pay-Timestamp': timestamp.toString(),
      })
      .send(body)
      .expect(200);

    expect(purchaseRepository.save).toHaveBeenCalledWith({
      ...purchase,
      paymentSentToRockerAt: new Date(body.timestamp),
    });
  });

  it('payment completed', async () => {
    const body: IPaymentCompleted = {
      $type: 'PaymentCompleted',
      offerId: 'offerId',
      paymentId: 'paymentId',
      timestamp: new Date(),
      paymentStatus: PaymentStatusEnum.SETTLED,
      paymentMethod: PaymentMethodEnum.SWISH,
    };

    const secret = configService.get('ROCKER_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    const timestamp = new Date().getTime();
    hmac.update(`${timestamp}.${body}`);
    const serverSignature = hmac.digest('hex');

    const purchase = new Purchase();
    purchase.paymentSentToRockerAt = new Date();

    purchaseRepository.findOne.mockResolvedValue(purchase);

    await request(app.getHttpServer())
      .post('/rocker-webhook')
      .set({
        'X-Rocker-Pay-Signature': serverSignature,
        'X-Rocker-Pay-Timestamp': timestamp.toString(),
      })
      .send(body)
      .expect(200);

    expect(purchaseRepository.save).toHaveBeenCalledWith({
      ...purchase,
      paymentAcceptedByRockerAt: new Date(body.timestamp),
    });
  });

  it('payment failed', async () => {
    const body: IPaymentFailed = {
      $type: 'PaymentFailed',
      offerId: 'offerId',
      paymentId: 'paymentId',
      timestamp: new Date(),
      paymentStatus: PaymentStatusEnum.FAILED,
      paymentMethod: PaymentMethodEnum.SWISH,
      errorCode: 'ERROR_CODE',
      swishErrorCode: 'SWISH_ERROR_CODE',
    };

    const secret = configService.get('ROCKER_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    const timestamp = new Date().getTime();
    hmac.update(`${timestamp}.${body}`);
    const serverSignature = hmac.digest('hex');

    const purchase = new Purchase();
    purchase.paymentSentToRockerAt = new Date();
    purchase.paymentAcceptedByRockerAt = new Date();

    await request(app.getHttpServer())
      .post('/rocker-webhook')
      .set({
        'X-Rocker-Pay-Signature': serverSignature,
        'X-Rocker-Pay-Timestamp': timestamp.toString(),
      })
      .send(body)
      .expect(200);

    expect(purchaseRepository.update).toHaveBeenCalledWith(
      {
        rockerPaymentId: 'paymentId',
      },
      {
        failedAt: new Date(body.timestamp),
      },
    );
  });

  it('accept purchase', async () => {
    const now = new Date();
    jest.spyOn(global, 'Date').mockReturnValue(now);
    const acceptPurchase = `
      mutation AcceptPurchase($input: AcceptPurchaseInput!) {
        acceptPurchase(input: $input) {
          id
        }  
      }
    `;

    const buyer = new User();
    buyer.id = '123';

    const purchase = new Purchase();
    purchase.id = 'purchaseId';
    purchase.rockerPaymentId = 'paymentId';
    purchase.paymentSentToRockerAt = new Date();
    purchase.paymentAcceptedByRockerAt = new Date();
    purchase.deliveredAt = new Date();
    purchase.buyerId = buyer.id;
    purchase.buyer = buyer;

    userRepository.findOne.mockResolvedValue(buyer);
    purchaseRepository.findOne.mockResolvedValue(purchase);

    const confirmPaymentResponse: IPaymentResponse = {
      id: purchase.rockerPaymentId,
      merchantId: 'merchantId',
      sellerId: 'sellerId',
      offerId: 'offerId',
      buyerId: buyer.rockerUserId,
      amount: {
        amount: 100,
        currency: 'SEK',
        unit: 'MINOR',
      },
      paymentMethod: PaymentMethodEnum.SWISH,
      reference: purchase.rockerOfferId,
      status: PaymentStatusEnum.SETTLED,
      payoutConsent: PayoutConsentEnum.CONFIRMED,
      createdAt: new Date(),
      updatedAt: new Date(),
      pauseState: PauseStateEnum.NOT_PAUSED,
      title: 'offer title',
    };
    jest
      .spyOn(rockerAPI, 'confirmPayment')
      .mockResolvedValue(confirmPaymentResponse);

    const payoutResponse: IPayoutResponse = {
      id: 'payoutId',
      amount: {
        amount: 100,
        currency: 'SEK',
        unit: 'MINOR',
      },
      paymentId: purchase.rockerPaymentId,
      payoutMethod: PayoutMethodEnum.SWISH,
      status: Status1Enum.PENDING,
      payoutFee: {
        amount: 100,
        currency: 'SEK',
        unit: 'MINOR',
      },
      serviceFee: {
        amount: 100,
        currency: 'SEK',
        unit: 'MINOR',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(rockerAPI, 'createPayout').mockResolvedValue(payoutResponse);

    purchaseRepository.save.mockResolvedValue({
      ...purchase,
      rockerPayoutId: payoutResponse.id,
      approvedAt: now,
    });

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: acceptPurchase,
        variables: {
          input: {
            purchaseId: purchase.id,
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.acceptPurchase).toMatchObject({
          id: purchase.id,
        });
      });

    expect(purchaseRepository.save).toHaveBeenCalledWith({
      ...purchase,
      rockerPayoutId: payoutResponse.id,
      approvedAt: now,
    });
  });
});
