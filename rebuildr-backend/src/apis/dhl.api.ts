/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InternalServerException } from 'src/exceptions';
import { CustomFetch } from 'src/utility/custom-fetch';
import { TransportInstructionResponse } from './types/dhl/transport-instruction-api';
import {
  NearestServicePointResponse,
  ServicePointDetailResponse,
} from './types/dhl/service-point-api';
import { TrackingShipments } from './types/dhl/shipment-tracking-api';

@Injectable()
export class DHLAPI {
  private url: string;
  private apiKey: string;
  private globalApiKey: string;
  private globalApiUrl: string;
  private customerNumber: string;
  private customFetch: CustomFetch;
  @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;

  constructor() {
    this.url = process.env.DHL_URL as string;
    this.apiKey = process.env.DHL_CLIENT_KEY as string;
    this.globalApiKey = process.env.DHL_GLOBAL_API_KEY as string;
    this.globalApiUrl = process.env.DHL_GLOBAL_API_URL as string;
    this.customerNumber = process.env.DHL_CUSTOMER_NUMBER as string;
    this.customFetch = new CustomFetch(this.logger, {
      accept: 'application/json',
    });
  }

  async createShippingOrder(
    purchaseId: string,
    buyer: User,
    seller: User,
    servicePointId: string,
    weight: number,
  ): Promise<TransportInstructionResponse> {
    throw InternalServerException('Not implemented!');
  }

  async getServicePointLocations(
    postalCode: string,
    address?: string,
  ): Promise<NearestServicePointResponse> {
    throw InternalServerException('Not implemented!');
  }

  private async getServicePointById(
    servicePointId: string,
  ): Promise<ServicePointDetailResponse> {
    throw InternalServerException('Not implemented!');
  }

  async trackShipment(shipmentId: string): Promise<TrackingShipments> {
    throw InternalServerException('Not implemented!');
  }
}
