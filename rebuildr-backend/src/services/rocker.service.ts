import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { RockerAPI } from 'src/apis/rocker.api';
import {
  AuthResponseStatusEnum,
  PauseStateEnum,
} from 'src/apis/types/rocker-types';
import { swedishPhoneNumberRegex } from 'src/constants/regexp';
import { PayoutAccountEnum, User } from 'src/entities/user.entity';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import {
  CreatePayoutAccountInput,
  CreatePayoutAccountResponse,
} from 'src/resolvers/rocker.resolver';
import { Logger } from 'winston';

import { Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export enum SupportedPaymentMethod {
  SWISH = 'SWISH',
  STRIPE = 'STRIPE',
}
registerEnumType(SupportedPaymentMethod, {
  name: 'PaymentMethod',
});

const CACHE_TTL_MS = 30000;

@Injectable()
export class RockerService {
  constructor(
    private rockerApi: RockerAPI,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createForeignUser(user: User) {
    if (user.rockerUserId) {
      return user;
    }
    const response = await this.rockerApi.createForeignUser(
      user.id,
      user.email,
    );

    user.rockerUserId = response.id;
    return await this.userRepository.save(user);
  }

  async createOrganizationUser(organizationUser: User, creator: User) {
    if (!creator.email) {
      throw new Error('Incorrect creator');
    }
    if (!organizationUser.organizationNumber || !organizationUser.username) {
      throw new Error('Incorrect organization');
    }

    //Rocker require prefix '16' for organization numbers
    const organizationNumber = '16' + organizationUser.organizationNumber;

    return await this.rockerApi.createCompanyUser(
      organizationNumber,
      organizationUser.username,
      creator.email,
      creator.phoneNumber,
    );
  }

  async getRockerUser(user: User) {
    if (!user.rockerUserId) {
      throw InternalServerException();
    }
    return await this.rockerApi.getUser(user.rockerUserId);
  }

  /**
   * Starts authentication towards Rocker. Checks cache for data stored on requestId
   * If it does not exist, starts a new authentication session, otherwise checks the result
   * of existing authentication session.
   * @param requestId Unique id to keep track of authentication
   */
  async authenticate(requestId: string, userId: string) {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    if (!user.rockerUserId) {
      this.logger.error({
        message: 'There is no user in Rocker connected to user with id',
      });
      throw BadUserInputException();
    }

    const authenticationToken = await this.cacheManager.get<string>(requestId);

    //authenticationToken not found. Means this is a call to initiate bankID
    if (!authenticationToken) {
      const response = await this.rockerApi.authenticate(user.id);
      this.logger.info({
        message: 'Initiating BankID authentication',
        clientRequestId: requestId,
        userId: user.id,
      });

      await this.cacheManager.set(
        requestId,
        response.authenticationToken,
        CACHE_TTL_MS,
      );

      this.logger.info({
        message: 'Rocker authentication pending',
        clientRequestId: requestId,
        status: AuthResponseStatusEnum.PENDING,
        userId: user.id,
      });

      return {
        status: AuthResponseStatusEnum.PENDING,
        qrCode: response.authenticationInformation.qrCode,
        autoStartToken: response.authenticationInformation.autoStartToken,
      };
    }

    const response = await this.rockerApi.authResult(authenticationToken);
    this.logger.info({
      message: 'Authenticating rocker response',
      clientRequestId: requestId,
      status: response.status,
      userId: user.id,
    });

    if (response.status === AuthResponseStatusEnum.SUCCESS) {
      this.logger.info({
        message: 'Rocker authentication successful',
        clientRequestId: requestId,
        status: response.status,
        userId: user.id,
      });

      return {
        status: response.status,
      };
    }
    if (response.status === AuthResponseStatusEnum.ERROR) {
      this.logger.error({
        message: 'Rocker authentication resulted in error',
        clientRequestId: requestId,
        status: response.status,
        userId: user.id,
      });
      throw InternalServerException();
    }

    return {
      status: response.status,
      qrCode: response.authenticationInformation.qrCode,
    };
  }

  async createOffer(
    title: string,
    productId: string,
    sellerRockerId: string,
    escrowValue: number,
    fee: number,
    imageUrls: string[],
  ) {
    const response = await this.rockerApi.createOffer(
      title,
      sellerRockerId,
      escrowValue,
      fee,
      productId,
      imageUrls,
    );

    return response;
  }

  async createPayment(
    offerId: string,
    buyerId: string,
    paymentMethod: SupportedPaymentMethod,
  ) {
    if (paymentMethod === SupportedPaymentMethod.SWISH) {
      return await this.rockerApi.createSwishPayment(offerId, buyerId);
    }
    if (paymentMethod === SupportedPaymentMethod.STRIPE) {
      return await this.rockerApi.createStripePayment(offerId, buyerId);
    }

    throw BadUserInputException('Unsupported payment method');
  }

  async getPayment(paymentId: string, paymentMethod: SupportedPaymentMethod) {
    if (paymentMethod === SupportedPaymentMethod.SWISH) {
      return await this.rockerApi.getSwishPayment(paymentId);
    }
    if (paymentMethod === SupportedPaymentMethod.STRIPE) {
      throw BadUserInputException('Stripe payments are not supported yet');
    }
    throw BadUserInputException('Unsupported payment method');
  }

  async confirmPayment(paymentId: string) {
    return await this.rockerApi.confirmPayment(paymentId);
  }

  async createPayoutAccount(
    input: CreatePayoutAccountInput,
    currentUserId: string,
  ): Promise<CreatePayoutAccountResponse> {
    const user = await this.userRepository.findOneBy({ id: currentUserId });

    if (!user?.rockerUserId) {
      throw BadUserInputException();
    }

    if (input.type === PayoutAccountEnum.SWISH) {
      return {
        user: await this.createPayoutAccountSwish(input.phoneNumber, user),
      };
    }
    if (input.type === PayoutAccountEnum.TRUSTLY) {
      if (!input.successUrl || !input.failureUrl) {
        throw BadUserInputException('Invalid account details');
      }
      const response = await this.createPayoutAccountTrustly(
        input.successUrl,
        input.failureUrl,
        user,
      );
      return {
        user: response.user,
        trustlyUrl: response.url,
      };
    }
    if (input.type === PayoutAccountEnum.RIX) {
      if (!input.clearingNumber || !input.accountNumber || !input.accountName) {
        throw BadUserInputException('Invalid account details');
      }
      return {
        user: await this.createPayoutAccountRix(
          input.clearingNumber,
          input.accountNumber,
          input.accountName,
          user,
        ),
      };
    }
    if (input.type === PayoutAccountEnum.BANKGIRO) {
      if (!input.accountName || !input.identifier) {
        throw BadUserInputException('Invalid account details');
      }
      return {
        user: await this.createPayoutAccountBankGiro(
          input.identifier,
          input.accountName,
          user,
        ),
      };
    }
    if (input.type === PayoutAccountEnum.PLUSGIRO) {
      if (!input.accountName || !input.identifier) {
        throw BadUserInputException('Invalid account details');
      }
      return {
        user: await this.createPayoutAccountPlusGiro(
          input.identifier,
          input.accountName,
          user,
        ),
      };
    }

    throw BadUserInputException('Invalid Payout Account');
  }
  private async createPayoutAccountSwish(phoneNumber: string, user: User) {
    if (!swedishPhoneNumberRegex.test(phoneNumber)) {
      throw BadUserInputException('Invalid phone number');
    }

    const response = await this.rockerApi.createPayoutAccountSwish(
      user.rockerUserId,
      phoneNumber,
    );

    user.payoutAccountSwishId = response.id;
    user.selectedPayoutMethod = PayoutAccountEnum.SWISH;
    return await this.userRepository.save(user);
  }
  private async createPayoutAccountTrustly(
    successUrl: string,
    failureUrl: string,
    user: User,
  ) {
    const response = await this.rockerApi.createPayoutAccountTrustly(
      successUrl,
      failureUrl,
      user.rockerUserId,
    );
    user.selectedPayoutMethod = PayoutAccountEnum.TRUSTLY;
    const updatedUser = await this.userRepository.save(user);
    return {
      user: updatedUser,
      url: response.selectAccountUrl,
    };
  }
  private async createPayoutAccountRix(
    clearingNumber: string,
    accountNumber: string,
    accountName: string,
    user: User,
  ) {
    const response = await this.rockerApi.createPayoutAccountRix(
      clearingNumber,
      accountNumber,
      accountName,
      user.rockerUserId,
    );
    user.payoutAccountRixId = response.id;
    user.selectedPayoutMethod = PayoutAccountEnum.RIX;
    return await this.userRepository.save(user);
  }
  private async createPayoutAccountBankGiro(
    identifier: string,
    accountName: string,
    user: User,
  ) {
    const response = await this.rockerApi.createPayoutAccountBankGiro(
      identifier,
      accountName,
      user.rockerUserId,
    );
    user.payoutAccountBankGiroId = response.id;
    user.selectedPayoutMethod = PayoutAccountEnum.BANKGIRO;
    return await this.userRepository.save(user);
  }
  private async createPayoutAccountPlusGiro(
    identifier: string,
    accountName: string,
    user: User,
  ) {
    const response = await this.rockerApi.createPayoutAccountPlusGiro(
      identifier,
      accountName,
      user.rockerUserId,
    );
    user.payoutAccountPlusGiroId = response.id;
    user.selectedPayoutMethod = PayoutAccountEnum.PLUSGIRO;
    return await this.userRepository.save(user);
  }

  async createPayout(paymentId: string, buyer: User) {
    const rockerUser = await this.getRockerUser(buyer);

    const response = await this.rockerApi.createPayout(
      paymentId,
      rockerUser.defaultPayoutMethod,
    );
    if (response.errorCode) {
      throw InternalServerException();
    }
    return response;
  }

  async pausePayment(paymentId: string, comment?: string) {
    return await this.rockerApi.setPaymentPauseState(
      paymentId,
      PauseStateEnum.PAUSED,
      comment,
    );
  }
  async resumePayment(paymentId: string, comment?: string) {
    return await this.rockerApi.setPaymentPauseState(
      paymentId,
      PauseStateEnum.NOT_PAUSED,
      comment,
    );
  }
}
