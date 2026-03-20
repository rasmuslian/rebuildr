import * as https from 'https';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IFetchBusinessResponse } from './types/scb/types';

@Injectable()
export class SCBAPI {
  private certificate: string;
  private passphrase: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.certificate = process.env.SCB_CERTIFICATE;
    this.passphrase = process.env.SCB_API_KEY;
    if (!this.certificate || !this.passphrase) {
      this.logger.error('SCB API missing certificte or passphrase');
    }
  }

  async fetchBusiness(
    organizationNumber: string,
  ): Promise<IFetchBusinessResponse> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        Företagsstatus: '1',
        Registreringsstatus: '1',
        variabler: [
          {
            Varde1: organizationNumber,
            Operator: 'ArLikaMed',
            Variabel: 'OrgNr (10 siffror)',
          },
        ],
      });

      const options: https.RequestOptions = {
        hostname: 'privateapi.scb.se',
        path: '/nv0101/v1/sokpavar/api/Je/HamtaForetag',
        method: 'POST',
        pfx: Buffer.from(this.certificate, 'base64'),
        passphrase: this.passphrase,
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(JSON.parse(data)));
      });

      req.on('error', (err) => reject(err));
      req.end(body);
    });
  }
}
