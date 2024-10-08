import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  AuthResponseStatusEnum,
  IOfferResponse,
  IPostUsersResponse,
  OfferStatusEnum,
  RockerCountryEnum,
  UserTypeEnum,
} from 'src/apis/types/rocker-types';
import { User } from 'src/entities/user.entity';
import { RockerAPI } from 'src/apis/rocker.api';
import { RockerService } from 'src/services/rocker.service';
import { v4 as uuidv4 } from 'uuid';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { Product } from 'src/entities/product.entity';
import { mockRepository, mockRepositoryType } from './mocks/repository.mock';

describe('Rocker', () => {
  let rockerService: RockerService;
  let rockerAPI: RockerAPI;
  let userRepository: mockRepositoryType;
  let productRepository: mockRepositoryType;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
      ],
      providers: [
        RockerService,
        RockerAPI,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    rockerService = module.get<RockerService>(RockerService);
    rockerAPI = module.get<RockerAPI>(RockerAPI);
    userRepository = module.get(getRepositoryToken(User));
    productRepository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('create a rocker user', async () => {
    const user = new User();
    user.id = uuidv4();
    user.email = 'test@test.com';
    const rockerUserResponse: IPostUsersResponse = {
      id: uuidv4(),
      country: RockerCountryEnum.SE,
      email: 'test@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userType: UserTypeEnum.FOREIGN_USER,
    };
    jest.spyOn(rockerAPI, 'createUser').mockResolvedValue(rockerUserResponse);
    userRepository.save.mockResolvedValue({
      ...user,
      rockerUserId: rockerUserResponse.id,
    });

    const foreignUser = await rockerService.createForeignUser(user);
    expect(foreignUser.id).toBe(user.id);
    expect(foreignUser.rockerUserId).toBe(rockerUserResponse.id);
  });

  it('authenticate rocker user', async () => {
    const user = new User();
    user.id = uuidv4();
    user.email = 'test@test.com';
    user.rockerUserId = uuidv4();

    const requestId = uuidv4();

    userRepository.findOne.mockResolvedValue(user);
    jest.spyOn(rockerAPI, 'authenticate').mockResolvedValue({
      authenticationToken: 'ey123',
      authenticationInformation: {
        autoStartToken: 'token',
        qrCode: 'qrCode1',
      },
    });
    jest
      .spyOn(rockerAPI, 'authResult')
      .mockResolvedValueOnce({
        status: AuthResponseStatusEnum.PENDING,
        authenticationInformation: {
          autoStartToken: 'token',
          qrCode: 'qrCode2',
        },
      })
      .mockResolvedValueOnce({
        status: AuthResponseStatusEnum.PENDING,
        authenticationInformation: {
          autoStartToken: 'token',
          qrCode: 'qrCode3',
        },
      })
      .mockResolvedValue({
        status: AuthResponseStatusEnum.SUCCESS,
        jwtToken: 'eyABC',
      });

    const authResponse = await rockerService.authenticate(requestId, user.id);

    expect(authResponse).toMatchObject({
      qrCode: 'qrCode1',
      autoStartToken: 'token',
    });

    let response = await rockerService.authenticate(requestId, user.id);

    expect(response).toMatchObject({
      status: AuthResponseStatusEnum.PENDING,
      qrCode: 'qrCode2',
    });

    response = await rockerService.authenticate(requestId, user.id);

    expect(response).toMatchObject({
      status: AuthResponseStatusEnum.PENDING,
      qrCode: 'qrCode3',
    });

    response = await rockerService.authenticate(requestId, user.id);

    expect(response).toMatchObject({
      status: AuthResponseStatusEnum.SUCCESS,
    });
  });

  it('create offer', async () => {
    const user = new User();
    user.id = uuidv4();
    user.email = 'test@test.com';
    user.rockerUserId = uuidv4();

    const product = new Product();
    product.id = uuidv4();
    product.title = 'product';
    product.address = 'address';
    product.addressLocation = { type: 'Point', coordinates: [57, 18] };
    product.user = user;
    product.price = 100;

    const createOfferResponse: IOfferResponse = {
      id: uuidv4(),
      status: OfferStatusEnum.AVAILABLE,
      title: product.title,
      price: {
        amount: 100,
        currency: 'SEK',
        unit: 'MINOR',
      },
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
      createdAt: new Date(),
      updatedAt: new Date(),
      serviceFeeRefundable: true,
      sellerId: user.rockerUserId,
      offerUrl: '',
      externalData: {
        productId: product.id,
      },
    };

    jest.spyOn(rockerAPI, 'createOffer').mockResolvedValue(createOfferResponse);
    productRepository.findOne.mockResolvedValue(product);
    await rockerService.createOffer(product.id);
  });
});
