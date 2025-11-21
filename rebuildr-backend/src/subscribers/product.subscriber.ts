import { Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { MapPin } from "src/entities/map-pin.entity";
import { Product, ProductStatus } from "src/entities/product.entity";
import { GeocodingService } from "src/services/geocoding.service";
import { MapPinService } from "src/services/map-pin.service";
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, Point, UpdateEvent } from "typeorm";
import { Logger } from 'winston';

@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  constructor(
    dataSource: DataSource,
    private mapPinService: MapPinService,
    private geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return Product;
  }

  // Lifecycle hooks
  async afterInsert(event: InsertEvent<Product>) {
    if (event.entity.addressLocation) {
      event.entity.mapPin = new MapPin(await this.newApproximateLocationMapPin(event.entity.addressLocation));
      await this.mapPinService.upsert(event.entity.mapPin);
    }
  }

  async beforeUpdate(event: UpdateEvent<Product>) {
    if ([ProductStatus.SOLD, ProductStatus.DELETED].includes(event.entity.status) &&
        event.databaseEntity.status !== event.entity.status) {
      const mapPin = await this.mapPinService.getByPinTypeId({ productId: event.entity.id });
      if (mapPin) {
        await this.mapPinService.removeMapPin(mapPin.id);
      }
    }
    if (event.entity.status === ProductStatus.PUBLISHED && event.databaseEntity.status === ProductStatus.SOLD) {
      const mapPin = await this.mapPinService.getByPinTypeId({ productId: event.entity.id });
      if (event.entity.addressLocation && !mapPin) {
        event.entity.mapPin = new MapPin(await this.newApproximateLocationMapPin(event.entity.addressLocation));
        await this.mapPinService.upsert(event.entity.mapPin);
      }
    }
    if (event.databaseEntity.addressLocation !== event.entity.addressLocation &&
        ![ProductStatus.DELETED, ProductStatus.SOLD].includes(event.entity.status)) {
      const newMapPin = await this.newApproximateLocationMapPin(event.entity.addressLocation);
      const mapPin = await this.mapPinService.getByPinTypeId({ productId: event.entity.id });
      if (mapPin) {
        event.entity.mapPin = mapPin;
        event.entity.mapPin.address = newMapPin.address;
        event.entity.mapPin.location = newMapPin.location;
      } else {
        event.entity.mapPin = new MapPin(newMapPin);
      }
      await this.mapPinService.upsert(event.entity.mapPin);
    }
  }

  // Helper methods
  async newApproximateLocationMapPin(addressLocation: Point): Promise<{
    address: string;
    location: Point;
  }> {
      const location = {
        lat: addressLocation.coordinates[0],
        lng: addressLocation.coordinates[1],
      };
    const approximateLocation =
      await this.geocodingService.locationToApproximation(location);
    return {
      address: approximateLocation.address,
      location: {
        type: "Point",
        coordinates: [approximateLocation.lat, approximateLocation.lng],
      },
    };
  }
}