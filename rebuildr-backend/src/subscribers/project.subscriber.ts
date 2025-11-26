import { Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Product } from "src/entities/product.entity";
import { Project } from "src/entities/project.entity";
import { GeocodingService } from "src/services/geocoding.service";
import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";

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
      const location = {
        lat: event.entity.addressLocation.coordinates[0],
        lng: event.entity.addressLocation.coordinates[1],
      };
      const approximateLocation =
        await this.geocodingService.locationToApproximation(location);
      for (const product of products) {
        if (product.mapPinId) {
          const mapPin = product.mapPin;
          mapPin.address = approximateLocation.address;
          mapPin.location = {
            type: "Point",
            coordinates: [approximateLocation.lat, approximateLocation.lng],
          };
          await event.manager.save(mapPin);
        }
        // Should we handle create map pin if missing?
      }
    }
  }
}