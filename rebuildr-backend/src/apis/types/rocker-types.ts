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
