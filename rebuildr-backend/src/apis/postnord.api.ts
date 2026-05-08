import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/entities/user.entity';
import {
  BookingResponse,
  EdiInstruction,
  PartyIdentification,
} from './types/postnord/booking-api';
import { ResponseDto as ServicePointResponseDto } from './types/postnord/service-points-v5';
import { ResponseDto as TrackingResponseDto } from './types/postnord/track-shipment-v5';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { GraphQLError } from 'graphql';

import { LinksResponse } from './types/postnord/track-shipment-url';
import { CustomFetch } from 'src/utility/custom-fetch';
import { InternalServerException, NotFoundException } from 'src/exceptions';
import { removeCountryCode } from 'src/utility/phone-number';
@Injectable()
export class PostnordAPI {
  private url: string;
  private apiKey: string;
  private customFetch: CustomFetch;
  private partyIdentification: PartyIdentification;
  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.url = this.configService.get('POSTNORD_URL') as string;
    this.apiKey = this.configService.get('POSTNORD_API_KEY') as string;
    this.partyIdentification = {
      partyId: this.configService.get('POSTNORD_CUSTOMER_NUMBER') as string,
      partyIdType: '160',
    };
    if (!this.url || !this.apiKey || !this.partyIdentification) {
      throw new Error('Postnord variables not defined not set');
    }
    this.customFetch = new CustomFetch(this.logger, {
      accept: 'application/json',
    });
  }

  /**
   * Query the enables applications to discover the nearest service point by address.
   * Always use as detailed information as possible, to get the most accurate response.
   * The response contains an array of service points sorted by distance from the search point.
   */
  async nearestByAdress(input: { postalCode: string; amount?: number }) {
    const baseUrl =
      this.url + '/rest/businesslocation/v5/servicepoints/nearest/byaddress?';
    const urlWithStaticSearchParams =
      baseUrl +
      'returnType=json&countryCode=SE&agreementCountry=SE&srId=EPSG%3A4326&context=optionalservicepoint&responseFilter=public&typeId=24%2C25%2C54&located=all&whiteLabelName=false';
    const finalUrl =
      urlWithStaticSearchParams +
      `&apikey=${this.apiKey}&postalCode=${input.postalCode}&numberOfServicePoints=${input.amount ?? 5}`;

    const response: ServicePointResponseDto = await this.customFetch.send(
      finalUrl,
      {
        method: 'GET',
      },
    );

    return response;
  }

  async servicePointById(servicePointId: string) {
    const baseUrl = this.url + '/rest/businesslocation/v5/servicepoints/ids?';
    const urlWithStaticSearchParams =
      baseUrl + `returnType=json&countryCode=SE&responseFilter=public`;

    const finalUrl =
      urlWithStaticSearchParams +
      `&apikey=${this.apiKey}&ids=${servicePointId}`;

    const response: ServicePointResponseDto = await this.customFetch.send(
      finalUrl,
      {
        method: 'GET',
      },
    );
    return response;
  }

  async trackShipment(shipmentId: string): Promise<TrackingResponseDto> {
    const baseUrl =
      this.url + '/rest/shipment/v5/trackandtrace/findByIdentifier.';
    const urlWithStaticSearchParams = baseUrl + `json`;

    const finalUrl =
      urlWithStaticSearchParams + `?apikey=${this.apiKey}&id=${shipmentId}`;

    const response: TrackingResponseDto = await this.customFetch.send(
      finalUrl,
      {
        method: 'GET',
      },
    );

    return response;
  }

  async edi(
    purchaseId: string,
    buyer: User,
    seller: User,
    servicePointId: string,
  ): Promise<BookingResponse> {
    const servicePointsResponse = await this.servicePointById(servicePointId);

    if (
      !servicePointsResponse?.servicePointInformationResponse?.servicePoints
        ?.length
    ) {
      this.logger.error(
        `Service point not found for id ${servicePointId} or no service pointId provided`,
        {
          servicePointId,
          purchaseId,
        },
      );
      throw NotFoundException('Service point not found');
    }

    if (
      !seller.address ||
      !seller.postCode ||
      !seller.city ||
      !seller.phoneNumber ||
      !seller.email ||
      !seller.name
    ) {
      this.logger.error(
        'Edi failed: seller is missing address and/or contact information',
        {
          sellerId: seller.id,
          purchaseId,
        },
      );
      throw new GraphQLError('Seller is missing address information', {
        extensions: { code: 'MISSING_ADDRESS_INFORMATION' },
      });
    }

    if (
      !buyer.address ||
      !buyer.postCode ||
      !buyer.city ||
      !buyer.phoneNumber ||
      !buyer.email ||
      !buyer.name
    ) {
      this.logger.error(
        'Edi failed: buyer is missing address and/or contact information',
        {
          buyerId: buyer.id,
          purchaseId,
        },
      );
      throw new GraphQLError('Buyer is missing address information', {
        extensions: { code: 'BUYER_MISSING_ADDRESS_INFORMATION' },
      });
    }

    const servicePoint =
      servicePointsResponse?.servicePointInformationResponse?.servicePoints[0];

    const endpointUrl =
      this.url +
      `/rest/shipment/v3/edi?apikey=${this.apiKey}&generateQrcodeImage=true&emailQRcodeTo=${seller.email}`;

    const internalId = purchaseId.replace(/-/g, ''); //Since PostNord only allows 35 characters, strip the hyphens. Convert back using toUUID() in utils/text.ts

    const body: EdiInstruction = {
      messageDate: new Date().toISOString(),
      updateIndicator: 'Original',
      shipment: [
        {
          references: [
            {
              referenceType: 'CU',
              referenceNo: internalId,
            },
          ],
          parties: {
            consignor: {
              issuerCode: 'Z12', //PostNord Sweden
              partyIdentification: this.partyIdentification,
              party: {
                nameIdentification: {
                  name: seller.name ?? '',
                },
                address: {
                  streets: [seller.address],
                  postalCode: seller.postCode,
                  city: seller.city,
                  countryCode: 'SE',
                },
                contact: {
                  contactName: seller.name,
                  phoneNo: removeCountryCode(seller.phoneNumber),
                  smsNo: removeCountryCode(seller.phoneNumber),
                  emailAddress: seller.email,
                },
              },
            },
            consignee: {
              party: {
                nameIdentification: {
                  name: buyer.name,
                },
                address: {
                  streets: [buyer.address],
                  postalCode: buyer.postCode,
                  city: buyer.city,
                  countryCode: 'SE',
                },
                contact: {
                  contactName: buyer.name,
                  phoneNo: removeCountryCode(buyer.phoneNumber),
                  smsNo: removeCountryCode(buyer.phoneNumber),
                  emailAddress: buyer.email,
                },
              },
            },
            deliveryParty: {
              party: {
                nameIdentification: {
                  name: servicePoint.name ?? '',
                },
                address: {
                  postalCode: servicePoint.deliveryAddress?.postalCode ?? '',
                  city: servicePoint.deliveryAddress?.city ?? '',
                  countryCode: 'SE',
                },
              },
              partyIdentification: {
                partyId: servicePointId,
                partyIdType: '156', //Service point
              },
            },
          },
          goodsItem: [
            {
              items: [
                {
                  itemIdentification: {
                    itemId: '0', //Let PostNord determine itemId
                  },
                },
              ],
            },
          ],
          service: {
            basicServiceCode: '19', //PostNord MyPack Collect
            additionalServiceCode: ['C2'], //Print Label, valid for 60 days
          },
        },
      ],
      application: {
        applicationId: 2225,
        name: 'Swace Digital AB',
      },
    };

    const response: BookingResponse = await this.customFetch.send(endpointUrl, {
      method: 'POST',
      body,
    });
    return response;
  }

  async getTrackingUrl(shipmentId: string): Promise<string> {
    const url =
      this.url +
      '/rest/links/v1/tracking/SE/' +
      shipmentId +
      '?apikey=' +
      this.apiKey;

    const response: LinksResponse = await this.customFetch.send(url, {
      method: 'GET',
    });
    if (response.faults || !response.url) {
      this.logger.error({
        message: 'Error fetching tracking url',
        shipmentId: shipmentId,
        faults: JSON.stringify(response.faults),
      });
      throw InternalServerException();
    }
    return response.url;
  }
}
