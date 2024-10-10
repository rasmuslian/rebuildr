import { Injectable } from '@nestjs/common';
import {
  IGetAuthResponse,
  IPostAuthResponse,
  IPostUsersResponse,
  RockerCountryEnum,
} from './types/rocker-types';
import { ConfigService } from '@nestjs/config';
import { fetchAux } from 'src/utility/fetchAux';

@Injectable()
export class RockerAPI {
  private url: string;
  private merchantId: string;
  private apiKey: string;
  constructor(private configService: ConfigService) {
    //TODO: use production endpoint when we get into production
    // const isProd = this.configService.get('NODE_ENV') === 'production';
    // this.url = isProd
    //   ? 'https://pay.rocker.com'
    //   : 'https://pay-test.rocker.com';

    this.url = 'https://pay-test.rocker.com';
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
    const response: IPostAuthResponse = await fetchAux({
      url: this.url + '/merchant-api/v2/auth',
      method: 'POST',
      body: body,
      headers: {
        'X-merchantId': this.merchantId,
        'X-Api-Key': this.apiKey,
      },
    });
    console.log('response in POST authenticate :>> ', response);

    return response;
  }

  /**
   * Checks result of bankID authentication
   * @param authorizationToken Received from call to authenticate()
   */
  async authResult(authorizationToken: string) {
    const response: IGetAuthResponse = await fetchAux({
      url: this.url + '/merchant-api/v2/auth',
      method: 'GET',
      headers: {
        'X-merchantId': this.merchantId,
        'X-Api-Key': this.apiKey,
        Authorization: 'Bearer ' + authorizationToken,
      },
    });

    console.log('response in GET authenticate :>> ', response);

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
    const response: IPostUsersResponse = await fetchAux({
      url: this.url + '/merchant-api/v1/users',
      method: 'POST',
      body: body,
      headers: {
        'X-merchantId': this.merchantId,
        'X-Api-Key': this.apiKey,
      },
    });
    return response;
  }
}
