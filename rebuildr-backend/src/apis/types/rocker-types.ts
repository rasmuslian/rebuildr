import { registerEnumType } from '@nestjs/graphql';

export enum AuthResponseStatusEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}
registerEnumType(AuthResponseStatusEnum, { name: 'AuthResponseStatusEnum' });

export enum RockerCountryEnum {
  SE = 'SE',
  DK = 'DK',
  FI = 'FI',
  AX = 'AX',
  NO = 'NO',
  IS = 'IS',
}
export enum UserTypeEnum {
  AUTHENTICATED_USER = 'AUTHENTICATED_USER',
  FOREIGN_USER = 'FOREIGN_USER',
  COMPANY_USER = 'COMPANY_USER',
  INDIVIDUAL_USER = 'INDIVIDUAL_USER',
}

export interface ICreateForeignUserRequest {
  foreignUserId: string;
  country: RockerCountryEnum;
  email: string;
  externalData: object;
}

export interface IPostUsersResponse {
  id: string;
  country: RockerCountryEnum;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  userType: UserTypeEnum;
  phone?: string;
  firstName?: string;
  lastName?: string;
}
export type IGetAuthResponse =
  | {
      status: AuthResponseStatusEnum.PENDING;
      authenticationInformation: {
        autoStartToken: string;
        qrCode: string;
      };
    }
  | {
      status: AuthResponseStatusEnum.SUCCESS;
      jwtToken: string;
    }
  | {
      status: AuthResponseStatusEnum.ERROR;
    };
export interface IPostAuthResponse {
  authenticationToken: string;
  authenticationInformation: {
    autoStartToken: string;
    qrCode: string;
  };
}

export interface IMoneyObject {
  amount: number;
  currency: string;
  unit: string;
}

export enum OfferStatusEnum {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  IN_PAYOUT = 'IN_PAYOUT',
  WAITING_ON_REVIEW = 'WAITING_ON_REVIEW',
  FINISHED_SOLD = 'FINISHED_SOLD',
  FINISHED_DELETED = 'FINISHED_DELETED',
}

export interface ICreateOfferRequest {
  title: string;
  description?: string;
  sellerNote?: string;
  sellerId: string;
  payoutSpec: 'CONFIRMED_PAYOUT' | 'AUTO_PAYOUT' | 'NO_PAYOUT';
  externalData: { [key: string]: any };
  escrowValue: IMoneyObject;
  serviceFee: IMoneyObject;
}

export interface IOfferResponse {
  id: string;
  status: OfferStatusEnum;
  title: string;
  price: IMoneyObject;
  sellerId: string;
  escrowValue: IMoneyObject;
  serviceFee: {
    actual: IMoneyObject;
    original?: IMoneyObject;
  };
  serviceFeeRefundable: boolean;
  createdAt: Date;
  updatedAt: Date;
  offerUrl: string;
  externalData: { [key: string]: any };
}

export interface ICreatePaymentRequest {
  offerId: string;
  buyerId: string;
  paymentMethod: 'SWISH';
  paymentMethodData: {
    paymentType: 'MOBILE';
  };
}
enum PaymentMethodEnum {
  TRUSTLY = 'TRUSTLY',
  STRIPE = 'STRIPE',
  SWISH = 'SWISH',
  EXTERNAL = 'EXTERNAL',
  LOAN = 'LOAN',
  INVOICE = 'INVOICE',
  ROCKER_CARD = 'ROCKER_CARD',
}

export enum PaymentStatusEnum {
  INIT = 'INIT',
  SETTLED = 'SETTLED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  BOOKKEEPING_FAILED = 'BOOKKEEPING_FAILED',
  TIMED_OUT = 'TIMED_OUT',
}

enum PayoutConsentEnum {
  UNDEFINED = 'UNDEFINED',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED',
}

enum PauseStateEnum {
  NOT_PAUSED = 'NOT_PAUSED',
  PAUSED = 'PAUSED',
}
export interface IPaymentResponse {
  id: string;
  merchantId: string;
  sellerId: string;
  offerId: string;
  buyerId: string;
  amount: IMoneyObject;
  paymentMethod: PaymentMethodEnum;
  paymentMethodData?: {
    token: string;
  };
  reference: string;
  status: PaymentStatusEnum;
  payoutConsent: PayoutConsentEnum;
  createdAt: Date;
  updatedAt: Date;
  pauseState: PauseStateEnum;
  buyerNote?: string;
  errorMessage?: string;
  title: string;
}
