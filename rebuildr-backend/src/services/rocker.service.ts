import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RockerAPI } from 'src/apis/rocker.api';
import {
  AuthResponseStatusEnum,
  IPayoutAccountVerification,
  VerificationStatusEnum,
} from 'src/apis/types/rocker-types';
import { Product } from 'src/entities/product.entity';
import { RockerPayoutAccountStatusEnum, User } from 'src/entities/user.entity';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class RockerService {
  constructor(
    private rockerApi: RockerAPI,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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
      console.log('Authentication resulted in error');
      throw InternalServerException();
    }

    return {
      status: response.status,
      qrCode: response.authenticationInformation.qrCode,
    };
  }

  async createOffer(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { user: true },
    });

    if (!product?.user?.rockerUserId) {
      throw InternalServerException();
    }
    if (product.isGiveaway) {
      //dont create offer on a giveaway item
      throw InternalServerException();
    }

    const price = product.price;
    //TODO: this is placeholder fee amount
    const escrowValue = price - 10;
    const fee = 10;

    const response = await this.rockerApi.createOffer(
      product.title,
      product.user.rockerUserId,
      escrowValue,
      fee,
      product.id,
    );

    return response;
  }

  async createPayment(offerId: string, buyerId: string) {
    return await this.rockerApi.createPayment(offerId, buyerId);
  }

  async confirmPayment(paymentId: string) {
    return await this.rockerApi.confirmPayment(paymentId);
  }

  async createPayoutAccount(phoneNumber: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user?.rockerUserId) {
      throw BadUserInputException();
    }

    if (
      user.rockerPayoutAccountSwish === RockerPayoutAccountStatusEnum.PENDING
    ) {
      throw InternalServerException(
        'A request to create payout account is already in progress',
      );
    }

    await this.rockerApi.createPayoutAccount(user.rockerUserId, phoneNumber);

    user.rockerPayoutAccountSwish = RockerPayoutAccountStatusEnum.PENDING;
    return await this.userRepository.save(user);
  }

  async verifyPayoutAccount(payload: IPayoutAccountVerification) {
    const user = await this.userRepository.findOneBy({
      rockerUserId: payload.userId,
    });

    if (!user) {
      throw InternalServerException('verifyPayoutAccount: User not found');
    }
    switch (payload.status) {
      case VerificationStatusEnum.CANCELLED:
      case VerificationStatusEnum.INVALID:
      case VerificationStatusEnum.TIMED_OUT:
        user.rockerPayoutAccountSwish = RockerPayoutAccountStatusEnum.FAILED;
        return;
      default:
        user.rockerPayoutAccountSwish = RockerPayoutAccountStatusEnum.VERIFIED;
    }

    await this.userRepository.save(user);
  }
}
