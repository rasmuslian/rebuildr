import { Injectable, Logger } from '@nestjs/common';
import {
  ICreateOfferRequest,
  ICreatePaymentRequest,
  ICreatePayoutRequest,
  ICreateSwishPayoutAccountRequest,
  IGetAuthResponse,
  IOfferResponse,
  IPaymentResponse,
  IPayoutAccountResponse,
  IPayoutResponse,
  IPostAuthResponse,
  IPostUsersResponse,
  PayoutMethodEnum,
  RockerCountryEnum,
} from './types/rocker-types';
import { ConfigService } from '@nestjs/config';
import { CustomFetch } from 'src/utility/custom-fetch';

@Injectable()
export class RockerAPI {
  private readonly logger = new Logger(RockerAPI.name);
  private url: string;
  private merchantId: string;
  private apiKey: string;
  private customFetch: CustomFetch;
  constructor(private configService: ConfigService) {
    //TODO: use production endpoint when we get into production
    // const isProd = this.configService.get('NODE_ENV') === 'production';
    // this.url = isProd
    //   ? 'https://pay.rocker.com'
    //   : 'https://pay-test.rocker.com';

    this.url = 'https://pay-test.rocker.com';
    this.merchantId = this.configService.get('ROCKER_MERCHANT_ID');
    this.apiKey = this.configService.get('ROCKER_API_KEY');
    this.customFetch = new CustomFetch(this.logger, {
      'X-merchantId': this.merchantId,
      'X-Api-Key': this.apiKey,
    });
  }
  /**
   * Authenticate user
   * @param foreignUserId id of user in OUR database. Saved on User.id
   */
  async authenticate(foreignUserId: string) {
    const body = {
      foreignUserId,
      method: {
        methodType: 'BANK_ID_WITH_LAUNCH_INFO',
      },
    };
    const response: IPostAuthResponse = await this.customFetch.send(
      this.url + '/merchant-api/v2/auth',
      {
        method: 'POST',
        body: body,
      },
    );

    return response;
  }

  /**
   * Checks result of bankID authentication
   * @param authorizationToken Received from call to authenticate()
   */
  async authResult(authorizationToken: string) {
    const response: IGetAuthResponse = await this.customFetch.send(
      this.url + '/merchant-api/v2/auth',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + authorizationToken,
        },
      },
    );

    return response;
  }

  /**
   * Creates a foreign user in the Rocker database. This user will not yet be authenticated.
   * @param foreignUserId id of user in OUR database. Saved on User.id
   * @param email User.email
   */
  async createUser(foreignUserId: string, email: string) {
    const body = {
      foreignUserId,
      email,
      country: RockerCountryEnum.SE,
      externalData: {},
    };
    const response: IPostUsersResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/users',
      {
        method: 'POST',
        body: body,
      },
    );
    return response;
  }

  async createOffer(
    title: string,
    sellerId: string,
    escrowValue: number,
    fee: number,
    productId: string,
  ) {
    const body: ICreateOfferRequest = {
      title,
      sellerId,
      payoutSpec: 'CONFIRMED_PAYOUT',
      escrowValue: {
        currency: 'SE',
        amount: escrowValue,
        unit: 'MINOR',
      },
      serviceFee: {
        currency: 'SE',
        amount: fee,
        unit: 'MINOR',
      },
      externalData: { productId },
    };

    const response: IOfferResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/offers',
      {
        method: 'POST',
        body: body,
      },
    );
    return response;
  }

  async createPayment(offerId: string, buyerId: string) {
    const body: ICreatePaymentRequest = {
      offerId,
      buyerId,
      paymentMethod: 'SWISH',
      paymentMethodData: { paymentType: 'MOBILE' },
    };

    const response: IPaymentResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/payments',
      {
        body: body,
        method: 'POST',
      },
    );

    return response;
  }

  async createPayoutAccount(rockerUserId: string, phoneNumber: string) {
    const body: ICreateSwishPayoutAccountRequest = {
      userId: rockerUserId,
      phoneNumber,
    };

    const response: IPayoutAccountResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/payout-accounts/swish',
      {
        body: body,
        method: 'POST',
      },
    );

    return response;
  }

  async confirmPayment(paymentId: string) {
    const response: IPaymentResponse = await this.customFetch.send(
      this.url + `/merchant-api/v1/payments/${paymentId}/confirm`,
      {
        method: 'PUT',
      },
    );

    return response;
  }

  async createPayout(paymentId: string) {
    const body: ICreatePayoutRequest = {
      paymentId,
      payoutMethod: PayoutMethodEnum.SWISH,
    };

    const response: IPayoutResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/payouts',
      {
        method: 'POST',
        body: body,
      },
    );

    return response;
  }
}
