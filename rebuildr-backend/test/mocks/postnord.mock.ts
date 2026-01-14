/* eslint-disable @typescript-eslint/no-unused-vars */
import { BookingResponse } from 'src/apis/types/postnord/booking-api';
import { ResponseDto as ServicePointResponseDto } from 'src/apis/types/postnord/service-points-v5';
import { ResponseDto as TrackingResponseDto } from 'src/apis/types/postnord/track-shipment-v5';
import { User } from 'src/entities/user.entity';

export class PostnordMock {
  nearestByAdress(input: {
    postalCode: string;
    amount?: number;
  }): Promise<ServicePointResponseDto> {
    const response: ServicePointResponseDto = {
      servicePointInformationResponse: {
        servicePoints: [{ servicePointId: '1' }],
      },
    };
    return new Promise(() => response);
  }
  servicePointById(servicePointId: string): Promise<ServicePointResponseDto> {
    const response: ServicePointResponseDto = {
      servicePointInformationResponse: {
        servicePoints: [{ servicePointId: '1' }],
      },
    };
    return new Promise(() => response);
  }
  trackShipment(shipmentId: string): Promise<TrackingResponseDto> {
    const response: TrackingResponseDto = {};
    return new Promise(() => response);
  }
  edi(
    purchaseId: string,
    buyer: User,
    seller: User,
    servicePointId: string,
  ): Promise<BookingResponse> {
    const response: BookingResponse = {
      bookingId: '1',
    };
    return new Promise(() => response);
  }
  getTrackingUrl(shipmentId: string): Promise<string> {
    return new Promise(() => 'getTrackingUrl');
  }
}
