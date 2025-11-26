import { Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { MapPin } from "src/entities/map-pin.entity";
import { Product } from "src/entities/product.entity";
import { Project } from "src/entities/project.entity";
import { GeocodingService } from "src/services/geocoding.service";
import { DataSource, EntityManager, EntitySubscriberInterface, EventSubscriber, Point, UpdateEvent } from "typeorm";

@EventSubscriber()
export class ProjectSubscriber implements EntitySubscriberInterface<Project> {
  constructor(
    dataSource: DataSource,
    private geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return Project;
  }

  // Lifecycle hooks
  async afterUpdate(event: UpdateEvent<Project>) {
    if ((!event.entity) || (!event.databaseEntity)) {
      return;
    }

    const coordinatesChanged = event.databaseEntity.addressLocation?.coordinates[0] !== event.entity.addressLocation?.coordinates[0] ||
      event.databaseEntity.addressLocation?.coordinates[1] !== event.entity.addressLocation?.coordinates[1];

    if (coordinatesChanged) {
      // Update all products' map pins associated with this project
      const products = await event.manager.find(
        Product,
        {
          where: {
            projectId: event.entity.id
          },
          relations: { mapPin: true }
        },
      );
      for (const product of products) {
        if (product.mapPinId) {
          await this.updateMapPin(product.mapPin, event.entity.addressLocation, event.manager);
        }
        // Should we handle create map pin if missing?
      }
    }
  }

  async updateMapPin(mapPin: MapPin, newLocation: Point, manager: EntityManager) {
    const location = {
      lat: newLocation.coordinates[0],
      lng: newLocation.coordinates[1],
    };
    const approximateLocation =
      await this.geocodingService.locationToApproximation(location);
    mapPin.address = approximateLocation.address;
    mapPin.location = {
      type: "Point",
      coordinates: [approximateLocation.lat, approximateLocation.lng],
    };
    await manager.save(mapPin);
  }
}