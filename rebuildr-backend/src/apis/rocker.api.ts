import { Inject, Injectable } from '@nestjs/common';
import {
  ICreateBankGiroPayoutAccountRequest,
  ICreateCompanyUserRequest,
  ICreateOfferRequest,
  ICreatePaymentRequest,
  ICreatePayoutRequest,
  ICreatePlusGiroPayoutAccountRequest,
  ICreateRixPayoutAccountRequest,
  ICreateSwishPayoutAccountRequest,
  ICreateTrustlyAccountRequest,
  ICreateTrustlyAccountResponse,
  IDefaultPayoutMethodRequest,
  IGetAuthResponse,
  IOfferResponse,
  IPaymentResponse,
  IPayoutAccountResponse,
  IPayoutResponse,
  IPostAuthResponse,
  IPostUsersResponse,
  IServiceFeeItem,
  IUserResponse,
  PauseStateEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
  PayoutConsentEnum,
  PayoutMethodEnum,
  RockerCountryEnum,
} from './types/rocker-types';
import { ConfigService } from '@nestjs/config';
import { CustomFetch } from 'src/utility/custom-fetch';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class RockerAPI {
  private url: string;
  private merchantId: string;
  private apiKey: string;
  private customFetch: CustomFetch;

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.url = this.configService.get('ROCKER_URL');
    this.merchantId = this.configService.get('ROCKER_MERCHANT_ID');
    this.apiKey = this.configService.get('ROCKER_API_KEY');
    if (!this.url || !this.merchantId || !this.apiKey) {
      throw new Error('Rocker variables not defined not set');
    }
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
  async createForeignUser(foreignUserId: string, email: string) {
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

  async createCompanyUser(
    registrationNumber: string,
    companyName: string,
    email: string,
    phone?: string,
  ) {
    const body: ICreateCompanyUserRequest = {
      registrationNumber,
      companyName,
      email,
      phone,
      country: RockerCountryEnum.SE,
      externalData: {},
    };
    const response: IPostUsersResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/users',
      {
        method: 'POST',
        body,
      },
    );

    return response;
  }

  async getUser(rockerUserId: string) {
    const response: IUserResponse = await this.customFetch.send(
      this.url + `/merchant-api/v1/users/${rockerUserId}`,
      {
        method: 'GET',
      },
    );
    return response;
  }

  async createOffer(
    title: string,
    sellerId: string,
    escrowValue: number,
    fee: number,
    feeItems: IServiceFeeItem[],
    productId: string,
    imageUrls: string[],
  ) {
    const body: ICreateOfferRequest = {
      title,
      sellerId,
      payoutSpec: 'CONFIRMED_PAYOUT',
      escrowValue: {
        currency: 'SEK',
        amount: escrowValue,
        unit: 'MINOR',
      },
      serviceFee: {
        currency: 'SEK',
        amount: fee,
        unit: 'MINOR',
      },
      serviceFeeItems: feeItems,
      externalData: { productId },
      images: imageUrls,
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

  async createSwishPayment(
    offerId: string,
    buyerId: string,
    paymentType: PaymentTypeEnum,
  ): Promise<IPaymentResponse> {
    if (process.env.NODE_ENV === 'development') {
      const fakeResponse: IPaymentResponse = {
        id: '1',
        paymentMethodData: {
          $type: 'Swish',
          token: '1234',
        },
        merchantId: '1',
        sellerId: buyerId,
        offerId,
        buyerId,
        amount: undefined,
        paymentMethod: PaymentMethodEnum.SWISH,
        reference: '1234',
        status: PaymentStatusEnum.INIT,
        payoutConsent: PayoutConsentEnum.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
        pauseState: PauseStateEnum.NOT_PAUSED,
        title: '',
      };
      return fakeResponse;
    }
    const body: ICreatePaymentRequest = {
      offerId,
      buyerId,
      paymentMethod: PaymentMethodEnum.SWISH,
      paymentMethodData: { $type: 'Swish', paymentType: paymentType },
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

  async getPayment(paymentId: string) {
    const response: IPaymentResponse = await this.customFetch.send(
      this.url + `/merchant-api/v1/payments/${paymentId}`,
      {
        method: 'GET',
      },
    );

    return response;
  }

  async createStripePayment(offerId: string, buyerId: string) {
    const body: ICreatePaymentRequest = {
      offerId,
      buyerId,
      paymentMethod: PaymentMethodEnum.STRIPE,
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

  async createTrustlyPayment(
    offerId: string,
    buyerId: string,
    successUri: string,
    failureUri: string,
  ) {
    const body: ICreatePaymentRequest = {
      offerId,
      buyerId,
      paymentMethod: PaymentMethodEnum.TRUSTLY,
      paymentMethodData: {
        $type: 'Trustly',
        successUri,
        failureUri,
      },
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

  async createPayoutAccountSwish(rockerUserId: string, phoneNumber: string) {
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
  async createPayoutAccountTrustly(
    successUrl: string,
    failureUrl: string,
    rockerUserId: string,
  ) {
    const body: ICreateTrustlyAccountRequest = {
      successUrl,
      failureUrl,
    };
    const response: ICreateTrustlyAccountResponse = await this.customFetch.send(
      this.url + `/merchant-api/v1/payout-accounts/${rockerUserId}/trustly`,
      { body, method: 'POST' },
    );
    return response;
  }
  async createPayoutAccountRix(
    clearingNumber: string,
    accountNumber: string,
    accountName: string,
    rockerUserId: string,
  ) {
    const body: ICreateRixPayoutAccountRequest = {
      userId: rockerUserId,
      identifier: {
        clearingNumber,
        accountNumber,
      },
      accountName,
    };

    const response: IPayoutAccountResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/payout-accounts/rix',
      { body, method: 'POST' },
    );

    return response;
  }
  async createPayoutAccountBankGiro(
    identifier: string,
    accountName: string,
    rockerUserId: string,
  ) {
    const body: ICreateBankGiroPayoutAccountRequest = {
      userId: rockerUserId,
      identifier,
      accountName,
    };
    const response: IPayoutAccountResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/payout-accounts/bankgiro',
      { body, method: 'POST' },
    );
    return response;
  }
  async createPayoutAccountPlusGiro(
    identifier: string,
    accountName: string,
    rockerUserId: string,
  ) {
    const body: ICreatePlusGiroPayoutAccountRequest = {
      userId: rockerUserId,
      identifier,
      accountName,
    };
    const response: IPayoutAccountResponse = await this.customFetch.send(
      this.url + '/merchant-api/v1/payout-accounts/plusgiro',
      { body, method: 'POST' },
    );
    return response;
  }
  async setDefaultPayoutMethod(
    payoutMethod: PayoutMethodEnum,
    rockerUserId: string,
  ) {
    const body: IDefaultPayoutMethodRequest = {
      payoutMethod,
    };
    await this.customFetch.send(
      this.url + `/merchant-api/v1/users/${rockerUserId}/default-payout-method`,
      {
        body,
        method: 'POST',
      },
    );
  }
  async payoutAccounts(rockerUserId: string) {
    return await this.customFetch.send(
      this.url + `/merchant-api/v1/payout-accounts/${rockerUserId}`,
      {
        method: 'GET',
      },
    );
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

  async createPayout(paymentId: string, payoutMethod: PayoutMethodEnum) {
    const body: ICreatePayoutRequest = {
      paymentId,
      payoutMethod,
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

  async setPaymentPauseState(
    paymentId: string,
    newState: PauseStateEnum,
    comment?: string,
  ) {
    const uriComment = encodeURIComponent(comment);
    const response: IPaymentResponse = await this.customFetch.send(
      this.url +
        `/merchant-api/v1/payments/${paymentId}/pause-state/${newState}${comment ? '?comment=' + uriComment : ''}`,
      { method: 'POST' },
    );

    return response;
  }

  /**
   *
   * Rocker docs: Cancel ongoing payment. A new payment can be created after the ongoing payment is cancelled.
   *
   * Dev note: Will return 400 "Illegal operation: Only unresolved payments can be cancelled" if the payment has been settled.
   */
  async cancelPayment(paymentId: string) {
    const response: IPaymentResponse = await this.customFetch.send(
      this.url + `/merchant-api/v1/payments/${paymentId}/cancel`,
      { method: 'PUT' },
    );
    return response;
  }

  async refundPayment(
    paymentId: string,
    serviceFeeRefundable: boolean,
    comment: string,
  ) {
    const response: IPaymentResponse = await this.customFetch.send(
      this.url +
        `/merchant-api/v1/payments/${paymentId}/refund/?${'?comment=' + encodeURIComponent(comment)}${'&service-fee-refundable=' + serviceFeeRefundable ? 'true' : 'false'}`,
      { method: 'POST' },
    );
    return response;
  }
}
