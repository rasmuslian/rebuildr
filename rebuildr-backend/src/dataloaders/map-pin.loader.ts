import { Injectable } from "@nestjs/common";
import { DataloaderService } from "./dataloader.service";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, In } from "typeorm";
import DataLoader from "dataloader";
import { MapPin } from "src/entities/map-pin.entity";

export interface IMapPinLoaders {
  getMapPin: DataLoader<string, MapPin | null>;
}

@Injectable()
export class MapPinLoader {

  constructor(
    private dataloaderService: DataloaderService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private getMapPin() {
    return new DataLoader<string, MapPin>(async (mapPinIds) => {
      const mapPins = await this.dataSource.getRepository(MapPin).find({
        where: {
          id: In(mapPinIds),
        },
      });

      return mapPinIds.map((id) =>
        mapPins.find((mapPin) => mapPin.id === id),
      ) as MapPin[];
    });
  }

  createLoaders() {
    return {
      getMapPin: this.getMapPin(),
    };
  }
}