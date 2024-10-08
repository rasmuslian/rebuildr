import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { RockerAPI } from 'src/apis/rocker.api';
import { RockerService } from 'src/services/rocker.service';
import { v4 as uuidv4 } from 'uuid';
import { CaslAbilityFactory } from 'src/casl/caslAbility.factory';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthResolver } from 'src/resolvers/auth.resolver';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { GqlExecutionContext, GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/services/mail.service';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { RockerUser, RockerUserType } from 'src/entities/rockerUser.entity';
import { AuthService } from 'src/services/auth.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { RefreshToken } from 'src/entities/refreshToken.entity';
import {
  AuthResponseStatusEnum,
  IPostUsersResponse,
  RockerCountryEnum,
  UserTypeEnum,
} from 'src/apis/types/rockerTypes';
import { GqlAuthGuard } from 'src/auth/gqlAuth.guard';
import { RockerResolver } from 'src/resolvers/rocker.resolver';

jest.mock('bcrypt', () => {
  const originalModule = jest.requireActual('bcrypt');

  return {
    ...originalModule,
    compare: jest.fn(),
    hash: jest.fn(),
  };
});
jest.mock('crypto', () => {
  const originalModule = jest.requireActual('crypto');

  return {
    ...originalModule,
    randomBytes: jest.fn(() => Buffer.from('123')),
  };
});

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

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('Signup', () => {
  let app: INestApplication;
  let mailService: MailService;
  let jwtService: JwtService;
  let rockerAPI: RockerAPI;
  let userRepository: ReturnType<typeof mockRepository>;
  let refreshTokenRepository: ReturnType<typeof mockRepository>;
  let rockerUserRepository: ReturnType<typeof mockRepository>;
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
          useFactory: (configService: ConfigService) => {
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
      providers: [
        GqlAuthGuard,
        RockerResolver,
        AuthResolver,
        JwtStrategy,
        AuthService,
        CaslAbilityFactory,
        MailService,
        RockerService,
        RockerAPI,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(RockerUser),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
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
    mailService = module.get<MailService>(MailService);
    rockerAPI = module.get<RockerAPI>(RockerAPI);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    rockerUserRepository = module.get(getRepositoryToken(RockerUser));
  });

  afterEach(async () => {
    await app.close();
  });

  it('signup', async () => {
    const registerMutation = `
    mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      message
    }
  }
    `;

    (bcrypt.hash as jest.Mock)
      .mockImplementationOnce(() => 'passwordHash')
      .mockImplementationOnce(() => 'emailTokenHash');
    jest.spyOn(mailService, 'sendVerifyEmail').mockResolvedValue(undefined);
    const user = {
      id: uuidv4(),
      username: 'test',
      email: 'test@test.com',
      password: 'passwordHash',
      verified: false,
      createdAt: new Date(),
      role: UserRoleEnum.USER,
    };
    userRepository.save.mockResolvedValue(user);

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: registerMutation,
        variables: {
          input: {
            email: 'test@test.com',
            password: 'test123',
            username: 'test',
          },
        },
      })
      .expect(200);

    expect(userRepository.save).toHaveBeenCalledWith({
      username: 'test',
      email: 'test@test.com',
      password: 'passwordHash',
    });
    expect(userRepository.update).toHaveBeenCalledWith(
      { id: user.id },
      {
        verifyEmailToken: 'emailTokenHash',
      },
    );
    expect(mailService.sendVerifyEmail).toHaveBeenCalledTimes(1);
    expect(mailService.sendVerifyEmail).toHaveBeenCalledWith({
      email: 'test@test.com',
      token: Buffer.from('123').toString('hex'),
    });
  });

  it('Verify mail', async () => {
    const verifyMutation = `
    mutation VerifyMail($input: VerifyMailInput!) {
      verifyMail(input: $input) {
        accessToken
        refreshToken
      }
    }`;

    const user = {
      id: uuidv4(),
      username: 'test',
      email: 'test@test.com',
      password: 'passwordHash',
      verified: false,
      createdAt: new Date(),
      role: UserRoleEnum.USER,
      verifyEmailToken: 'verifyEmalTokenHash',
    };
    const rockerUser: IPostUsersResponse = {
      id: uuidv4(),
      country: RockerCountryEnum.SE,
      email: 'test@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userType: UserTypeEnum.FOREIGN_USER,
    };

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    userRepository.findOneBy.mockResolvedValue(user);
    jest.spyOn(rockerAPI, 'createUser').mockResolvedValue(rockerUser);
    (bcrypt.hash as jest.Mock).mockImplementation(() => 'refreshTokenHash');
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('ey123');

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: verifyMutation,
        variables: {
          input: {
            email: 'test@test.com',
            verifyEmailToken: 'verifyEmailToken',
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.verifyMail).toMatchObject({
          accessToken: 'ey123',
          refreshToken: Buffer.from('123').toString('hex'),
        });
      });

    expect(rockerUserRepository.save).toHaveBeenCalledWith({
      id: rockerUser.id,
      type: rockerUser.userType,
      user: user,
    });
    expect(userRepository.update).toHaveBeenCalledWith(
      { id: user.id },
      { verified: true, verifyEmailToken: null },
    );
    expect(refreshTokenRepository.save.mock.calls[0][0]).toMatchObject({
      token: 'refreshTokenHash',
      user: user,
    });
  });

  it('authenticate user', async () => {
    const authenticateMutation = `
      mutation Authenticate($input: AuthenticateRockerInput!) {
        authenticateRocker(input: $input) {
          status
          qrCode
          autoStartToken
        }
      }
    `;
    const requestId = uuidv4();

    const user = new User();
    const userId = uuidv4();
    user.id = userId;
    user.email = 'test@test.com';

    const rockerUser = new RockerUser();
    rockerUser.createdAt = new Date();
    rockerUser.id = uuidv4();
    rockerUser.type = RockerUserType.FOREIGN_USER;
    rockerUser.user = user;
    rockerUser.userId = user.id;
    user.rockerUser = rockerUser;

    userRepository.findOne.mockResolvedValue(user);

    jest.spyOn(rockerAPI, 'authenticate').mockResolvedValue({
      authenticationToken: 'ey123',
      authenticationInformation: {
        autoStartToken: 'autoStartToken',
        qrCode: 'qrCode1',
      },
    });
    jest
      .spyOn(rockerAPI, 'authResult')
      .mockResolvedValueOnce({
        status: AuthResponseStatusEnum.PENDING,
        authenticationInformation: {
          autoStartToken: 'autoStartToken',
          qrCode: 'qrCode2',
        },
      })
      .mockResolvedValue({
        status: AuthResponseStatusEnum.SUCCESS,
        jwtToken: 'eyABC',
      });

    //Initiate authentication
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: authenticateMutation,
        variables: {
          input: {
            requestId,
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.authenticateRocker).toMatchObject({
          status: AuthResponseStatusEnum.PENDING,
          qrCode: 'qrCode1',
          autoStartToken: 'autoStartToken',
        });
      });

    //Poll for result
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: authenticateMutation,
        variables: {
          input: {
            requestId,
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.authenticateRocker).toMatchObject({
          status: AuthResponseStatusEnum.PENDING,
          qrCode: 'qrCode2',
        });
      });

    //Poll for result again
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: authenticateMutation,
        variables: {
          input: {
            requestId,
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.authenticateRocker).toMatchObject({
          status: AuthResponseStatusEnum.SUCCESS,
        });
      });

    rockerUser.type = RockerUserType.AUTHENTICATED_USER;
    expect(rockerUserRepository.save).toHaveBeenCalledWith(rockerUser);
  });
});
