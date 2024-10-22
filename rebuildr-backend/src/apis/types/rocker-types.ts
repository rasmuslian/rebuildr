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
export enum PaymentMethodEnum {
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

export enum PayoutConsentEnum {
  UNDEFINED = 'UNDEFINED',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED',
}

export enum PauseStateEnum {
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

export interface ICreateSwishPayoutAccountRequest {
  userId: string;
  phoneNumber?: string;
}

export enum PayoutMethodEnum {
  TRUSTLY = 'TRUSTLY',
  AUTOGIRO = 'AUTOGIRO',
  ROCKER_CARD = 'ROCKER_CARD',
  ROCKER_CARD_REFUND = 'ROCKER_CARD_REFUND',
  SWISH = 'SWISH',
}
export interface IPayoutAccountResponse {
  merchantId: string;
  id: string;
  userId: string;
  provider: PayoutMethodEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePayoutRequest {
  paymentId: string;
  payoutMethod: PayoutMethodEnum;
  payoutReference?: string;
}

export enum Status1Enum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IPayoutResponse {
  id: string;
  amount: IMoneyObject;
  paymentId: string;
  payoutMethod: PayoutMethodEnum;
  payoutAccountId?: string;
  status: Status1Enum;
  payoutFee: IMoneyObject;
  serviceFee: IMoneyObject;
  createdAt: Date;
  updatedAt: Date;
  errorCode?: string;
  providedErrorCode?: string;
}

//----------- WEBHOOK PAYLOADS ------------
export interface IPaymentStarted {
  $type: 'PaymentStarted';
  offerId: string;
  paymentId: string;
  status: PaymentStatusEnum;
  timestamp: Date;
}
export interface IPaymentFailed {
  $type: 'PaymentFailed';
  offerId: string;
  paymentId: string;
  paymentStatus: PaymentStatusEnum;
  paymentMethod: PaymentMethodEnum;
  errorCode?: string;
  swishErrorCode?: string;
  timestamp: Date;
}
export interface IPaymentCompleted {
  $type: 'PaymentCompleted';
  offerId: string;
  paymentId: string;
  paymentStatus: PaymentStatusEnum;
  paymentMethod: PaymentMethodEnum;
  timestamp: Date;
}

export enum VerificationStatusEnum {
  UNVERIFIED = 'UNVERIFIED',
  PAYABLE = 'PAYABLE',
  VERIFIED_OWNER = 'VERIFIED_OWNER',
  INVALID = 'INVALID',
  TIMED_OUT = 'TIMED_OUT',
  CANCELLED = 'CANCELLED',
}
export interface IPayoutAccountVerification {
  $type: 'PayoutAccountVerification';
  payoutAccountId: string;
  merchantId: string;
  userId: string;
  status: VerificationStatusEnum;
  timestamp: Date;
}

export interface IPayoutStarted {
  $type: 'PayoutStarted';
  offerId?: string;
  payoutId: string;
  paymentId: string;
  payoutStatus: Status1Enum;
  timestamp: Date;
}

export interface IPayoutCompleted {
  $type: 'PayoutCompleted';
  offerId?: string;
  payoutId: string;
  paymentId: string;
  payoutStatus: Status1Enum;
  timestamp: Date;
}

export interface IPayoutFailed {
  $type: 'PayoutFailed';
  offerId?: string;
  payoutId: string;
  paymentId: string;
  payoutStatus: Status1Enum;
  errorCode: string;
  providerErrorCode: string;
  timestamp: Date;
}
