import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CustomFetch } from 'src/utility/custom-fetch';
import { Logger } from 'winston';
import { IGetAllResousesResponse } from './types/boverket/all-resources';

@Injectable()
export class BoverketAPI {
  private customFetch: CustomFetch;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.customFetch = new CustomFetch(this.logger, {
      accept: 'application/json',
    });
  }

  async getAllResouces() {
    const dbVersion = 'latest';
    const response: IGetAllResousesResponse = await this.customFetch.send(
      `https://api.boverket.se/klimatdatabas/api/Klimat/v2/GetAllResources/${dbVersion}/sv/json`,
      { method: 'GET', headers: { 'Content-Control': 'no-cache' } },
    );
    return response;
  }
}
