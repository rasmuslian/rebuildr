import { Injectable } from '@nestjs/common';
import { ServicePointResponse } from 'src/resolvers/shipping.resolver';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { PostnordAPI } from 'src/apis/postnord.api';
import { BadUserInputException } from 'src/exceptions';

@Injectable()
export class ShippingService {
  constructor(private postnordAPI: PostnordAPI) {}

  async findNearbyServicePoints(
    postalCode: string,
    provider: ShippingProviderEnum,
    amount?: number,
  ): Promise<ServicePointResponse[]> {
    if (provider === ShippingProviderEnum.DHL) {
      throw BadUserInputException();
    }

    const response = await this.postnordAPI.nearestByAdress({
      postalCode,
      amount,
    });
    return (
      (response.servicePointInformationResponse.servicePoints?.map(
        (servicePoint) => {
          return {
            id: servicePoint.servicePointId,
            name: servicePoint.name,
            distance: servicePoint.routeDistance,
            streetName: servicePoint.visitingAddress?.streetName,
            streetNumber: servicePoint.visitingAddress?.streetNumber,
            postalCode: servicePoint.visitingAddress?.postalCode,
            city: servicePoint.visitingAddress?.city,
          };
        },
      ) as ServicePointResponse[]) ?? []
    );
  }
}
