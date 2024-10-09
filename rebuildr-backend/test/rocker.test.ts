import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  AuthResponseStatusEnum,
  IPostUsersResponse,
  RockerCountryEnum,
  UserTypeEnum,
} from 'src/apis/types/rocker-types';
import { User } from 'src/entities/user.entity';
import { RockerAPI } from 'src/apis/rocker.api';
import { RockerService } from 'src/services/rocker.service';
import { v4 as uuidv4 } from 'uuid';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';

describe('Rocker', () => {
  let rockerService: RockerService;
  let rockerAPI: RockerAPI;
  let userRepository;
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
      ],
    }).compile();

    rockerService = module.get<RockerService>(RockerService);
    rockerAPI = module.get<RockerAPI>(RockerAPI);
    userRepository = module.get(getRepositoryToken(User));
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
});

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});
