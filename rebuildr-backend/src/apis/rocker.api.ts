import { Injectable } from '@nestjs/common';
import {
  IGetAuthResponse,
  IPostAuthResponse,
  IPostUsersResponse,
} from './types/rockerTypes';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RockerAPI {
  private url: string;
  private merchantId: string;
  private apiKey: string;
  constructor(private configService: ConfigService) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    this.url = isProd
      ? 'https://pay.rocker.com'
      : 'https://pay-test.rocker.com';
    this.merchantId = this.configService.get('ROCKER_MERCHANT_ID');
    this.apiKey = this.configService.get('ROCKER_API_KEY');
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
    const data = await fetch(this.url + '/merchant-api/v2/auth', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: [
        ['X-merchantId', this.merchantId],
        ['X-Api-Key', this.apiKey],
      ],
    });
    const response: IPostAuthResponse = await data.json();

    return response;
  }

  /**
   * Checks result of bankID authentication
   * @param authorizationToken Received from call to authenticate()
   */
  async authResult(authorizationToken: string) {
    const data = await fetch(this.url + '/merchant-api/v2/auth', {
      method: 'GET',
      headers: [
        ['X-merchantId', this.merchantId],
        ['X-Api-Key', this.apiKey],
        ['Authorization', authorizationToken],
      ],
    });

    const response: IGetAuthResponse = await data.json();

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
    };
    const data = await fetch(this.url + '/merchant-api/v1/users', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: [
        ['X-merchantId', this.merchantId],
        ['X-Api-Key', this.apiKey],
      ],
    });

    const response: IPostUsersResponse = await data.json();
    return response;
  }
}
