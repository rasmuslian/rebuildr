import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MapPin } from "src/entities/map-pin.entity";
import { Product, ProductStatus } from "src/entities/product.entity";
import { Project } from "src/entities/project.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm/repository/Repository";
import { GeocodingService } from "./geocoding.service";

@Injectable()
export class MapPinService {
  constructor(
    @InjectRepository(MapPin)
    private mapPinRepository: Repository<MapPin>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
  ) {}

  async createMany(mapPins: MapPin[]): Promise<MapPin[]> {
    return await this.mapPinRepository.save(mapPins);
  }

  async upsert(mapPin: MapPin): Promise<MapPin> {
    return await this.mapPinRepository.save(mapPin);
  }

  async getByPinTypeId({ productId, projectId, userId }: { productId?: string; projectId?: string; userId?: string }): Promise<MapPin | null> {
    return await this.mapPinRepository.findOneBy({ productId, projectId, userId });
  }

  async removeMapPin(id: string): Promise<void> {
    if (id) {
      await this.mapPinRepository.delete(id);
    }
  }

  async syncApproximateLocations() {
    const batchSize = 100;
    let offset = 0;
    while (true) {
      const products = await this.productRepository.createQueryBuilder('product')
        .leftJoin(MapPin, 'map_pin', 'map_pin."productId" = product.id')
        .where('map_pin.id IS NULL')
        .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
        .limit(batchSize)
        .offset(offset)
        .getMany();

      if (products.length === 0) {
        break;
      }

      const mapPins = [];
      for (const product of products) {
        try {
          const location = {
            lat: product.addressLocation.coordinates[0],
            lng: product.addressLocation.coordinates[1],
          };
          const approximateLocation =
            await this.geocodingService.locationToApproximation(location);

          mapPins.push(new MapPin({
            productId: product.id,
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          }));
        } catch (error) {
          console.log(`Failed to approximate location for product ${product.id}: ${error}`);
        }
      }

      await this.mapPinRepository.save(mapPins);
      offset += batchSize;
    }

    offset = 0;
    while (true) {
      const projects = await this.projectRepository.createQueryBuilder('project')
        .leftJoin(MapPin, 'map_pin', 'map_pin."projectId" = project.id')
        .where('map_pin.id IS NULL')
        .limit(batchSize)
        .offset(offset)
        .getMany();

      if (projects.length === 0) {
        break;
      }

      const mapPins = [];
      for (const project of projects) {
        try {
          const location = {
            lat: project.addressLocation.coordinates[0],
            lng: project.addressLocation.coordinates[1],
          };
          const approximateLocation =
            await this.geocodingService.locationToApproximation(location);

          mapPins.push(new MapPin({
            projectId: project.id,
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          }));
        } catch (error) {
          console.log(`Failed to approximate location for project ${project.id}: ${error}`);
        }
      }

      await this.mapPinRepository.save(mapPins);
      offset += batchSize;
    }

    offset = 0;
    while (true) {
      const users = await this.userRepository.createQueryBuilder('user')
        .leftJoin(MapPin, 'map_pin', 'map_pin."userId" = user.id')
        .where('map_pin.id IS NULL')
        .limit(batchSize)
        .offset(offset)
        .getMany();

      if (users.length === 0) {
        break;
      }

      const mapPins = [];
      for (const user of users) {
        try {
          const location = {
            lat: user.addressLocation.coordinates[0],
            lng: user.addressLocation.coordinates[1],
          };
          const approximateLocation =
            await this.geocodingService.locationToApproximation(location);

          mapPins.push(new MapPin({
            userId: user.id,
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          }));
        } catch (error) {
          console.log(`Failed to approximate location for user ${user.id}: ${error}`);
        }
      }

      await this.mapPinRepository.save(mapPins);
      offset += batchSize;
    }
  }
}