import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  RockerPayoutAccountStatusEnum,
  User,
  UserRoleEnum,
} from 'src/entities/user.entity';
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
  IPayoutAccountResponse,
  IPayoutAccountVerification,
  PayoutMethodEnum,
  VerificationStatusEnum,
} from 'src/apis/types/rocker-types';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { mockRepository, mockRepositoryType } from './mocks/repository.mock';
import { Product } from 'src/entities/product.entity';
import { RockerWebhookController } from 'src/controllers/rocker-webhook.controller';
import { Purchase } from 'src/entities/purchase.entity';
import { PlaceholderResolver } from './placeholder.resolver';
import { RockerResolver } from 'src/resolvers/rocker.resolver';
import { PurchaseService } from 'src/services/purchase.service';
import * as crypto from 'crypto';
import { EnvironmentVariables } from 'src/config';

const mockGuard = {
  canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context).getContext().req;
    ctx.user = {
      id: 'userId',
      email: 'test@test.com',
      role: UserRoleEnum.USER,
    };
    return true;
  }),
  getRequest: jest.fn(),
};

describe('Payout', () => {
  let app: INestApplication;
  let rockerAPI: RockerAPI;
  let userRepository: mockRepositoryType;
  let configService: ConfigService<EnvironmentVariables>;
  beforeEach(async () => {
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
        RockerResolver,
        PlaceholderResolver,
        PurchaseService,
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
    configService = module.get(ConfigService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });

  it('create payout account', async () => {
    const createPayoutAccount = `
      mutation CreatePayoutAccount($input: CreatePayoutAccountInput!) {
        createPayoutAccount(input: $input) {
          id
        }
      }
    `;

    const user = new User();
    user.id = 'userId';
    user.rockerUserId = 'rockerUserId';
    user.rockerPayoutAccountSwish = RockerPayoutAccountStatusEnum.NOT_SET;

    const createPayoutAccountResponse: IPayoutAccountResponse = {
      merchantId: 'merchantId',
      id: '123',
      userId: user.rockerUserId,
      provider: PayoutMethodEnum.SWISH,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.findOneBy.mockResolvedValue(user);
    userRepository.save.mockResolvedValue({
      ...user,
      rockerPayoutAccountSwish: RockerPayoutAccountStatusEnum.PENDING,
    });
    jest
      .spyOn(rockerAPI, 'createPayoutAccount')
      .mockResolvedValue(createPayoutAccountResponse);

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: createPayoutAccount,
        variables: {
          input: {
            phoneNumber: '+46123123123',
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.createPayoutAccount).toMatchObject({
          id: 'userId',
        });
      });

    expect(userRepository.save).toHaveBeenCalledWith({
      ...user,
      rockerPayoutAccountSwish: RockerPayoutAccountStatusEnum.PENDING,
    });
  });

  //Fortsätt med webhook tester här---
  it('create payout accound webhook', async () => {
    const user = new User();
    user.id = 'userId';
    user.rockerUserId = 'rockerUserId';
    user.rockerPayoutAccountSwish = RockerPayoutAccountStatusEnum.PENDING;

    const body: IPayoutAccountVerification = {
      $type: 'PayoutAccountVerification',
      payoutAccountId: 'payoutAccountId',
      merchantId: 'merchantId',
      userId: user.rockerUserId,
      status: VerificationStatusEnum.PAYABLE,
      timestamp: new Date(),
    };

    userRepository.findOneBy.mockResolvedValue(user);

    const secret = configService.get('ROCKER_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    const timestamp = new Date().getTime();
    hmac.update(`${timestamp}.${body}`);
    const serverSignature = hmac.digest('hex');

    await request(app.getHttpServer())
      .post('/rocker-webhook')
      .set({
        'X-Rocker-Pay-Signature': serverSignature,
        'X-Rocker-Pay-Timestamp': timestamp.toString(),
      })
      .send(body)
      .expect(200);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      rockerUserId: body.userId,
    });
    expect(userRepository.save).toHaveBeenCalledWith({
      ...user,
      rockerPayoutAccountSwish: RockerPayoutAccountStatusEnum.VERIFIED,
    });
  });
});
