import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MapPin } from "src/entities/map-pin.entity";
import { Point } from "typeorm/driver/types/GeoJsonTypes";
import { Repository } from "typeorm/repository/Repository";

@Injectable()
export class MapPinService {
  constructor(
    @InjectRepository(MapPin)
    private mapPinRepository: Repository<MapPin>,
  ) {}

  async create(input: {
    productId?: string;
    projectId?: string;
    userId?: string;
    address: string;
    location: Point;
  }): Promise<MapPin> {
    const mapPin = new MapPin();
    mapPin.address = input.address;
    mapPin.location = input.location;
    mapPin.productId = input.productId;
    mapPin.projectId = input.projectId;
    mapPin.userId = input.userId;
    return await this.mapPinRepository.save(mapPin);
  }

  async createMany(mapPins: MapPin[]): Promise<MapPin[]> {
    return await this.mapPinRepository.save(mapPins);
  }

  async update(mapPin: MapPin): Promise<MapPin> {
    return await this.mapPinRepository.save(mapPin);
  }

  async delete(mapPinId: string): Promise<void> {
    await this.mapPinRepository.delete({ id: mapPinId });
  }
}