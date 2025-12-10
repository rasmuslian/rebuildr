import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { MapPin } from 'src/entities/map-pin.entity';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { Project } from 'src/entities/project.entity';
import { GeocodingService } from 'src/services/geocoding.service';
import { MapPinService } from 'src/services/map-pin.service';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Point,
  UpdateEvent,
} from 'typeorm';
import { Logger } from 'winston';

@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  constructor(
    dataSource: DataSource,
    private mapPinService: MapPinService,
    private geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return Product;
  }

  // Lifecycle hooks
  async afterInsert(event: InsertEvent<Product>) {
    if (event.entity.projectId) {
      const project = await event.manager.findOne(Project, {
        where: { id: event.entity.projectId },
        relations: { mapPin: true },
      });
      await this.createMapPin(event, project?.mapPin);
    } else if (event.entity.addressLocation) {
      await this.createMapPin(event);
    }
  }

  async afterUpdate(event: UpdateEvent<Product>) {
    if (!event.entity || !event.databaseEntity) {
      return;
    }

    if (
      [ProductStatus.DELETED].includes(event.entity.status) &&
      event.databaseEntity.status !== event.entity.status
    ) {
      if (event.entity.mapPinId) {
        const mapPinId = event.entity.mapPinId;
        await event.manager.update(
          Product,
          { id: event.entity.id },
          { mapPinId: null },
        );
        await event.manager.delete(MapPin, { id: mapPinId });
      }
    }

    const coordinatesChanged =
      event.databaseEntity.addressLocation?.coordinates[0] !==
        event.entity.addressLocation?.coordinates[0] ||
      event.databaseEntity.addressLocation?.coordinates[1] !==
        event.entity.addressLocation?.coordinates[1];

    if (
      !event.entity.projectId &&
      coordinatesChanged &&
      ![ProductStatus.DELETED].includes(event.entity.status)
    ) {
      if (event.entity.mapPinId) {
        await this.updateMapPin(event);
      } else {
        await this.createMapPin(event);
      }
    }

    // Removal of project association
    if (event.databaseEntity.projectId && !event.entity.projectId) {
      if (event.entity.mapPinId) {
        await this.updateMapPin(event);
      } else {
        await this.createMapPin(event);
      }
    } else if (
      (!event.databaseEntity.projectId && event.entity.projectId) ||
      (event.databaseEntity.projectId &&
        event.entity.projectId &&
        event.databaseEntity.projectId !== event.entity.projectId)
    ) {
      const project = await event.manager.findOne(Project, {
        where: { id: event.entity.projectId },
        relations: { mapPin: true },
      });
      if (!project || !project.mapPin) {
        this.logger.error('Product subscriber: Project missing map pin', {
          projectId: project?.id,
        });
        return;
      }

      if (event.entity.mapPinId) {
        await this.updateMapPin(event, project.mapPin);
      } else {
        await this.createMapPin(event, project.mapPin);
      }
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
        type: 'Point',
        coordinates: [approximateLocation.lat, approximateLocation.lng],
      },
    };
  }

  async createMapPin(
    event: InsertEvent<Product> | UpdateEvent<Product>,
    copyFrom?: MapPin,
  ): Promise<void> {
    if (!copyFrom && !event.entity.addressLocation) {
      return;
    }

    const mapPinData = copyFrom
      ? { address: copyFrom.address, location: copyFrom.location }
      : await this.newApproximateLocationMapPin(event.entity.addressLocation);
    const mapPin = event.manager.create(MapPin, {
      ...mapPinData,
      product: event.entity,
    });

    await event.manager.save(mapPin);
  }

  async updateMapPin(
    event: UpdateEvent<Product>,
    copyFrom?: MapPin,
  ): Promise<void> {
    if (!copyFrom && !event.entity.addressLocation) {
      return;
    }
    const mapPin = await this.mapPinService.getOne(event.entity.mapPinId);

    const mapPinData = copyFrom
      ? { address: copyFrom.address, location: copyFrom.location }
      : await this.newApproximateLocationMapPin(event.entity.addressLocation);
    mapPin.address = mapPinData.address;
    mapPin.location = mapPinData.location;
    await event.manager.save(mapPin);
  }
}
