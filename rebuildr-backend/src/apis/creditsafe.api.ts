import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EnvironmentVariables } from 'src/config';
import { CustomFetch } from 'src/utility/custom-fetch';
import { Logger } from 'winston';
import {
  ICreditsafeRejection,
  IGetDataResponse,
  IGetSignatoryResponse,
} from './types/creditsafe/types';
import {
  CreditsafeErrorException,
  CreditsafeRejectionException,
} from 'src/exceptions';

@Injectable()
export class CreditsafeAPI {
  private baseUrl: string;
  private username: string;
  private password: string;
  private customFetch: CustomFetch;

  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.baseUrl =
      process.env.NODE_ENV === 'development'
        ? 'https://se-webservice-sandbox.apps.creditsafe.com'
        : 'https://se-webservice.apps.creditsafe.com';
    this.username = '';
    this.password = '';
    this.customFetch = new CustomFetch(this.logger, {
      accept: 'application/json',
    });
    this.username = this.configService.get('CREDITSAFE_USERNAME');
    this.password = this.configService.get('CREDITSAFE_PASSWORD');
    if (!this.username || !this.password) {
      this.logger.warn('Creditsafe: Missing authentication variables');
    }
  }

  // Rejection codes (e.g. company inactive/bankrupt) are S-prefixed; anything
  // else is a genuine API/integration error (bad token, unknown block, ...).
  private throwOnError(error?: ICreditsafeRejection) {
    if (!error) return;
    if (error.code.startsWith('S')) {
      throw CreditsafeRejectionException(error);
    }
    throw CreditsafeErrorException(error);
  }

  //Authenticate.
  //Retrieve token to be used for api requests. Can have multiple tokens simultaneously and each live for 1 hour.
  private async getToken() {
    try {
      const authResponse = await this.customFetch.send(
        'https://connect.creditsafe.com/v1/authenticate',
        {
          method: 'POST',
          body: {
            username: this.username,
            password: this.password,
          },
        },
      );
      return authResponse.token;
    } catch (e) {
      this.logger.error('CreditsafeAPI: error when authenticating', { e });
      throw new InternalServerErrorException();
    }
  }
  /**
   * 
   * With one request you can receive the parameters
needed to build your own credit report
    * @param searchNumber Personal number or organization number (up to 12 digits)
   */
  async getData(
    searchnumber: string,
    blockType: 'basic' | 'credit' = 'basic',
  ): Promise<IGetDataResponse> {
    const basicBlockname = 'REBUILDR_C_BASIC';
    const creditBlockname = 'REBUILDR_C_CREDIT';
    const token = await this.getToken();
    const response: IGetDataResponse = await this.customFetch.send(
      this.baseUrl + '/getdata',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          searchnumber,
          blockname: blockType === 'basic' ? basicBlockname : creditBlockname,
          language: 'sv',
        },
        surfaceErrorBody: true,
      },
    );
    this.throwOnError(response.error);
    return response;
  }
  /**
   * The best way to make sure the person trying to sign an agreement
actually has the right to do it.
    * @param searchNumber Organisation number (10 digits)
   */
  async getSignatory(
    searchnumber: string,
    transactionid?: string,
  ): Promise<IGetSignatoryResponse> {
    const token = await this.getToken();
    const response: IGetSignatoryResponse = await this.customFetch.send(
      this.baseUrl + '/getsignatory',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          searchnumber,
          language: 'sv',
          ...(transactionid ? { transactionid } : {}),
        },
        surfaceErrorBody: true,
      },
    );
    this.throwOnError(response.error);
    return response;
  }
}
