import { Injectable } from '@nestjs/common';
import { SCBAPI } from 'src/apis/scb.api';

export interface OrganizationData {
  name: string;
  address: string;
  zipCode: string;
  city: string;
}

@Injectable()
export class OrganizationService {
  constructor(private scbAPI: SCBAPI) {}

  async lookupOrganizationNumber(
    orgNumber: string,
  ): Promise<OrganizationData | null> {
    const results = await this.scbAPI.fetchBusiness(orgNumber);
    const business = results[0];

    if (!business) {
      if (process.env.SCB_DEV_STUB === 'true') {
        return {
          name: `Stub AB (${orgNumber})`,
          address: 'Stubgatan 1',
          zipCode: '111 11',
          city: 'Stockholm',
        };
      }
      return null;
    }

    return {
      name: business.Företagsnamn,
      address: business.PostAdress,
      zipCode: business.PostNr,
      city: business.PostOrt,
    };
  }
}
