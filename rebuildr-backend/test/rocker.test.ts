import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  AuthResponseStatusEnum,
  IPostUsersResponse,
  RockerCountryEnum,
  UserTypeEnum,
} from 'src/apis/types/rockerTypes';
import { User } from 'src/entities/user.entity';
import { RockerAPI } from 'src/apis/rocker.api';
import { RockerService } from 'src/services/rocker.service';
import { v4 as uuidv4 } from 'uuid';
import { CaslAbilityFactory } from 'src/casl/caslAbility.factory';
import { CacheModule } from '@nestjs/cache-manager';
import { RockerUser, RockerUserType } from 'src/entities/rockerUser.entity';
import { ConfigModule } from '@nestjs/config';

describe('Rocker', () => {
  let rockerService: RockerService;
  let rockerAPI: RockerAPI;
  let rockerUserRepository;
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
        CaslAbilityFactory,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(RockerUser),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    rockerService = module.get<RockerService>(RockerService);
    rockerAPI = module.get<RockerAPI>(RockerAPI);
    rockerUserRepository = module.get(getRepositoryToken(RockerUser));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('create a rocker user', async () => {
    const user = new User();
    user.id = uuidv4();
    user.email = 'test@test.com';
    const rockerUser: IPostUsersResponse = {
      id: uuidv4(),
      country: RockerCountryEnum.SE,
      email: 'test@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userType: UserTypeEnum.FOREIGN_USER,
    };
    jest.spyOn(rockerAPI, 'createUser').mockResolvedValue(rockerUser);
    rockerUserRepository.save.mockImplementation((rockerUser: RockerUser) => {
      rockerUser.userId = rockerUser.user.id;
      return rockerUser;
    });

    const foreignUser = await rockerService.createForeignUser(user);
    expect(foreignUser.id).toBe(rockerUser.id);
    expect(foreignUser.userId).toBe(user.id);
    expect(foreignUser.type).toBe(RockerUserType.FOREIGN_USER);
  });

  it('authenticate rocker user', async () => {
    const user = new User();
    user.id = uuidv4();
    user.email = 'test@test.com';

    const rockerUser = new RockerUser();
    rockerUser.createdAt = new Date();
    rockerUser.id = uuidv4();
    rockerUser.type = RockerUserType.FOREIGN_USER;
    rockerUser.user = user;
    rockerUser.userId = user.id;
    user.rockerUser = rockerUser;
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

    expect(rockerUserRepository.save).toHaveBeenCalledWith({
      ...rockerUser,
      type: RockerUserType.AUTHENTICATED_USER,
    });
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
