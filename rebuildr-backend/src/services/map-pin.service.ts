import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MapPin } from "src/entities/map-pin.entity";
import { Repository } from "typeorm/repository/Repository";

@Injectable()
export class MapPinService {
  constructor(
    @InjectRepository(MapPin)
    private mapPinRepository: Repository<MapPin>,
  ) {}

  async createMany(mapPins: MapPin[]): Promise<MapPin[]> {
    return await this.mapPinRepository.save(mapPins);
  }
}