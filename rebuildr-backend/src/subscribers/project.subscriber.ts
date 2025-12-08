import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Project } from 'src/entities/project.entity';
import { GeocodingService } from 'src/services/geocoding.service';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class ProjectSubscriber implements EntitySubscriberInterface<Project> {
  constructor(
    dataSource: DataSource,
    private geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return Project;
  }

  // Lifecycle hooks
  async afterUpdate(event: UpdateEvent<Project>) {
    if (!event.entity || !event.databaseEntity) {
      return;
    }

    const coordinatesChanged =
      event.databaseEntity.addressLocation?.coordinates[0] !==
        event.entity.addressLocation?.coordinates[0] ||
      event.databaseEntity.addressLocation?.coordinates[1] !==
        event.entity.addressLocation?.coordinates[1];

    if (coordinatesChanged) {
      const project = await event.manager.findOne(Project, {
        where: {
          id: event.entity.id,
        },
        relations: {
          mapPin: true,
          products: { mapPin: true },
        },
      });
      if (!project) {
        return;
      }
      const projectMapPin = project.mapPin;
      if (!projectMapPin) {
        return;
      }

      //Update project mapPin
      const location = {
        lat: event.entity.addressLocation.coordinates[0],
        lng: event.entity.addressLocation.coordinates[1],
      };
      const approximateLocation =
        await this.geocodingService.locationToApproximation(location);
      projectMapPin.address = approximateLocation.address;
      projectMapPin.location = {
        type: 'Point',
        coordinates: [approximateLocation.lat, approximateLocation.lng],
      };
      await event.manager.save(projectMapPin);

      //Update all mapPin of related products
      await Promise.all(
        project.products
          .filter((p) => !!p.mapPin)
          .map(async (p) => {
            p.mapPin.address = projectMapPin.address;
            p.mapPin.location = projectMapPin.location;
            event.manager.save(p.mapPin);
          }),
      );
    }
  }
}
