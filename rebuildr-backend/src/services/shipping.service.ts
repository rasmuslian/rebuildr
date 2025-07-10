import { Injectable } from '@nestjs/common';
import {
  BookShippingResponse,
  ServicePointResponse,
} from 'src/resolvers/shipping.resolver';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { PostnordAPI } from 'src/apis/postnord.api';
import {
  BadUserInputException,
  InternalServerException,
  NotFoundException,
} from 'src/exceptions';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Purchase } from 'src/entities/purchase.entity';
import { Logger } from 'winston';
import { GraphQLError } from 'graphql';
import { DHLAPI } from 'src/apis/dhl.api';

@Injectable()
export class ShippingService {
  constructor(
    private postnordAPI: PostnordAPI,
    private dhlAPI: DHLAPI,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

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

  async bookShipping(
    purchaseId: string,
    logger: Logger,
  ): Promise<BookShippingResponse> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: Equal(purchaseId) },
      relations: {
        shippingPrice: true,
        product: { seller: true },
        buyer: true,
      },
    });

    if (!purchase) {
      logger.error('Book shipping failed: purchase not found', {
        purchaseId,
      });
      throw NotFoundException('Purchase not found');
    }
    const seller = purchase.product.seller;

    if (
      !seller.address ||
      !seller.postCode ||
      !seller.city ||
      !seller.phoneNumber ||
      !seller.email ||
      !seller.name
    ) {
      logger.error(
        'Book shipping failed: seller is missing address and/or contact information',
        {
          sellerId: seller.id,
          purchaseId,
        },
      );
      throw new GraphQLError('Seller is missing address information', {
        extensions: { code: 'MISSING_ADDRESS_INFORMATION' },
      });
    }

    if (!purchase.toServicePointId) {
      logger.error(
        'Book shipping failed: purchase is missing pickup service point id',
        {
          purchaseId,
          sellerId: seller.id,
        },
      );
      throw BadUserInputException(
        'Purchase is missing pickup service point id',
      );
    }

    if (purchase.shippingId) {
      logger.error({
        message:
          'Book shipping failed: shipping already booked for this purchase',
        purchaseId,
        shippingId: purchase.shippingId,
      });
      throw BadUserInputException(
        'Shipping has already been booked for this purchase',
      );
    }
    const buyer = purchase.buyer;
    const paymentAccepted = !!purchase.paymentAcceptedAt;

    logger.info('Booking shipping', {
      sellerId: seller.id,
      buyerId: buyer.id,
      paymentAccepted,
    });

    if (!paymentAccepted) {
      throw BadUserInputException(
        'Payment has not been accepted and therefore the purchase is not ready for shipping',
      );
    }

    if (!purchase.shippingPrice) {
      throw BadUserInputException(
        'Can not book shipping since Purchase is missing shipping information',
      );
    }

    if (purchase.shippingPrice.provider === ShippingProviderEnum.POSTNORD) {
      const response = await this.postnordAPI.edi(
        purchaseId,
        buyer,
        seller,
        purchase.toServicePointId,
      );

      const ok = response.idInformation?.at(0)?.status === 'OK';

      const shippingId = response.idInformation?.at(0)?.ids?.at(0)?.value;

      const referenceNumber = response?.idInformation
        ?.at(0)
        ?.references?.item?.find(
          ({ referenceType }) => referenceType === 'ALQ',
        )?.referenceNo; //Same number as in the QR code from the API

      const qrCodeUrl =
        response.idInformation
          ?.at(0)
          ?.urls?.find(({ type }) => type === 'QRCODE')?.url ?? undefined;

      if (!ok || !qrCodeUrl || !referenceNumber) {
        throw InternalServerException('Failed to book shipping');
      }

      purchase.qrCodeUrl = qrCodeUrl;
      purchase.shipmentBookedAt = new Date();
      purchase.shippingId = shippingId;
      purchase.qrCodeContent = referenceNumber;
      await this.purchaseRepository.save(purchase);

      return {
        success: ok,
        qrCodeUrl,
        qrCodeContent: referenceNumber,
      };
    }

    //else DHL
    const response = await this.dhlAPI.createShippingOrder(
      purchaseId,
      buyer,
      seller,
      purchase.toServicePointId,
      purchase.shippingPrice.maxWeight,
    );

    const ok = response?.status?.toLowerCase() !== 'error';

    const shippingId = response?.transportInstruction?.id;

    if (!ok || !shippingId) {
      throw InternalServerException('Failed to book shipping with DHL');
    }

    await this.purchaseRepository.save({
      ...purchase,
      shippingId: response.transportInstruction?.id,
      shipmentBookedAt: new Date(),
      qrCodeContent: shippingId,
    });

    return {
      success: ok,
      qrCodeContent: shippingId,
    };
  }
}
