import { Injectable } from '@nestjs/common';
import { CreditsafeService } from 'src/services/creditsafe.service';

export interface OrganizationData {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  companyTypeCode?: string;
}

@Injectable()
export class OrganizationService {
  constructor(private creditsafeService: CreditsafeService) {}

  async lookupOrganizationNumber(
    orgNumber: string,
  ): Promise<OrganizationData | null> {
    const result =
      await this.creditsafeService.getBusinessInformation(orgNumber);
    const business = result.data?.report;
    const address = business?.contactInformation?.registeredAddress;

    if (!business?.companyName || !address) {
      if (process.env.CREDITSAFE_DEV_STUB === 'true') {
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
      name: business.companyName,
      address: address.fullAddress,
      zipCode: address.zipCode,
      city: address.town,
      companyTypeCode: business.companyType?.code,
    };
  }
}
