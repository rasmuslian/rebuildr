import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RockerAPI } from 'src/apis/rocker.api';
import { AuthResponseStatusEnum } from 'src/apis/types/rocker-types';
import { User } from 'src/entities/user.entity';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class RockerService {
  constructor(
    private rockerApi: RockerAPI,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createForeignUser(user: User) {
    const response = await this.rockerApi.createUser(user.id, user.email);

    user.rockerUserId = response.id;
    return await this.userRepository.save(user);
  }

  /**
   * Starts authentication towards Rocker. Checks cache for data stored on requestId
   * If it does not exist, starts a new authentication session, otherwise checks the result
   * of existin authentication session.
   * @param requestId Unique id to keep track of authentication
   * @returns
   */
  async authenticate(requestId: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user.rockerUserId) {
      console.log('There is no user in Rocker connected to this User');
      throw BadUserInputException();
    }

    const authenticationToken = await this.cacheManager.get<string>(requestId);

    //authenticationToken not found. Means this is a call to initiate bankID
    if (!authenticationToken) {
      const response = await this.rockerApi.authenticate(user.id);
      await this.cacheManager.set(requestId, response.authenticationToken);
      return {
        status: AuthResponseStatusEnum.PENDING,
        qrCode: response.authenticationInformation.qrCode,
        autoStartToken: response.authenticationInformation.autoStartToken,
      };
    }

    const response = await this.rockerApi.authResult(authenticationToken);

    if (response.status === AuthResponseStatusEnum.SUCCESS) {
      return {
        status: response.status,
      };
    }
    if (response.status === AuthResponseStatusEnum.ERROR) {
      throw InternalServerException();
    }

    return {
      status: response.status,
      qrCode: response.authenticationInformation.qrCode,
    };
  }
}
