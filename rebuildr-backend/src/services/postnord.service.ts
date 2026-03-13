import { Inject, Injectable } from '@nestjs/common';
import { PostnordAPI } from 'src/apis/postnord.api';
import { Purchase, PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, In, Not, Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Status18 } from 'src/apis/types/postnord/track-shipment-v5';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { BadUserInputException } from 'src/exceptions';
import { SystemMessagesService } from './system-messages.service';

@Injectable()
export class PostnordService {
  constructor(
    private postnordApi: PostnordAPI,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    private systemMessagesService: SystemMessagesService,
  ) {}

  async findNearbyServicePoints(postalCode: string, amount?: number) {
    const nearbyServicePoints = await this.postnordApi.nearestByAdress({
      postalCode,
      amount,
    });

    return (
      nearbyServicePoints.servicePointInformationResponse.servicePoints?.map(
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
      ) ?? []
    );
  }

  // TODO: Move from postnord to another service since it also handles DHL
  // TODO: Cron need to be refactored to support multiple backend instances
  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_10_MINUTES
      : CronExpression.EVERY_6_HOURS,
  )
  async updateShippingStatus() {
    const requestId = randomUUID();
    const childLogger = this.logger.child({
      requestId,
      provider: ShippingProviderEnum.POSTNORD,
    });

    const purchases = await this.purchaseRepository.find({
      where: {
        shippingPrice: {
          provider: ShippingProviderEnum.POSTNORD,
        },
        shippingId: Not(IsNull()),
        status: Not(
          In([
            PurchaseStatusEnum.CLAIMED,
            PurchaseStatusEnum.PAYMENT_STARTED,
            PurchaseStatusEnum.PAYMENT_ACCEPTED,
            PurchaseStatusEnum.DELIVERED,
            PurchaseStatusEnum.APPROVED,
            PurchaseStatusEnum.PAYOUT_STARTED,
            PurchaseStatusEnum.FINISHED_SUCCESS,
            PurchaseStatusEnum.FINISHED_FAILED,
            PurchaseStatusEnum.PAUSED,
            PurchaseStatusEnum.PAYOUT_FAILED,
          ]),
        ),

        createdAt: MoreThan(dayjs().subtract(30, 'days').toDate()),
      },
      relations: {
        shippingPrice: true,
        product: { seller: true },
        buyer: true,
      },
    });

    childLogger.info('Updating Shipping status PostNord', {
      purchasesCount: purchases?.length,
    });

    purchases?.forEach(async (purchase) => {
      const purchaseChildLogger = childLogger.child({
        purchaseId: purchase.id,
      });

      purchaseChildLogger.info('Updating Shipping status', {
        shippingId: purchase.shippingId,
        status: purchase.status,
      });

      if (!purchase.shippingId) {
        purchaseChildLogger.error('ShippingId is missing', {
          purchaseId: purchase.id,
        });
        return;
      }

      const response = await this.postnordApi.trackShipment(
        purchase.shippingId,
      );

      purchase.postnordRawData = response as JSON;

      const status =
        response.TrackingInformationResponse?.shipments?.at(0)?.status;
      const events = response.TrackingInformationResponse?.shipments
        ?.at(0)
        ?.items?.at(0)?.events;

      purchaseChildLogger.info('Tracking events', {
        events,
        status,
      });

      events?.forEach((event) => {
        const { eventTime, eventCode } = event;
        const eventStatus = event.status as Status18;

        /**
         * 1 - AVALIABLE_FOR_DELIVERY (The shipment item has been delivered to a service point)
         * Z79 - AVALIABLE_FOR_DELIVERY (The shipment item has been delivered to a service point)
         */
        if (['1', 'Z79'.toLowerCase()].includes(eventCode.toLowerCase())) {
          purchaseChildLogger.info('Shipment delivered', {
            eventTime,
          });
          if (!purchase.shipmentDeliveredAt) {
            purchase.shipmentDeliveredAt = new Date(eventTime);
            //only send message if the purchase is not already picked up by the recipient
            if (!purchase.deliveredAt) {
              this.systemMessagesService.shipmentArrived(
                purchase.buyer,
                purchase.product.seller,
                purchase.product,
                purchase,
                ShippingProviderEnum.POSTNORD,
              );
            }
          }
        }

        /**
         * z30 - EN_ROUTE
         * 344 - INFORMED
         * z4H - OTHER (Handover to parcel box)
         */
        if (
          ['z30'.toLowerCase(), '344', 'z4H'.toLowerCase()].includes(
            eventCode.toLowerCase(),
          )
        ) {
          purchaseChildLogger.info('Shipment dropped off', {
            eventTime,
          });

          if (!purchase.shipmentDroppedOffAt) {
            //to seller
            this.systemMessagesService.shipmentDroppedOff(
              purchase.buyer,
              purchase.product.seller,
              purchase.product,
            );
          }
          purchase.shipmentDroppedOffAt = new Date(eventTime);
        }

        if (eventStatus === Status18.EN_ROUTE && eventCode !== 'z30') {
          purchaseChildLogger.info('Shipment started', {
            eventTime,
          });
          purchase.shipmentStartedAt = new Date(eventTime);
        }
      });

      await this.purchaseRepository.save(purchase);

      if (status === Status18.DELIVERED) {
        if (!purchase.deliveredAt) {
          //to buyer
          this.systemMessagesService.shipmentDeliveredBuyer(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
          );

          //to seller
          this.systemMessagesService.shipmentDeliveredSeller(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
          );
        }
        await this.purchaseRepository.save({
          ...purchase,
          deliveredAt: new Date(),
        });
      }

      if (status === Status18.DELIVERY_IMPOSSIBLE) {
        purchaseChildLogger.info('Delivery impossible', {
          status,
          events,
          purchaseId: purchase.id,
        });
      }

      if (status === Status18.DELIVERY_REFUSED) {
        purchaseChildLogger.info('Delivery refused', {
          status,
          events,
          purchaseId: purchase.id,
        });
      }
      if (status === Status18.STOPPED) {
        purchaseChildLogger.info('Delivery stopped', {
          status,
          events,
          purchaseId: purchase.id,
        });
      }

      if (status === Status18.RETURNED) {
        purchaseChildLogger.info('Delivery returned', {
          status,
          events,
        });
      }
    });
  }

  async getTrackingUrl(shippingId: string) {
    if (!shippingId) {
      throw BadUserInputException('Shipping ID is required');
    }

    return await this.postnordApi.getTrackingUrl(shippingId);
  }
}
