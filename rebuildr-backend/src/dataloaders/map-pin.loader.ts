import { Injectable } from "@nestjs/common";
import { DataloaderService } from "./dataloader.service";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, In } from "typeorm";
import DataLoader from "dataloader";
import { MapPin } from "src/entities/map-pin.entity";
import { Product } from "src/entities/product.entity";

export interface IMapPinLoaders {
  getMapPin: DataLoader<string, MapPin | null>;
  productLoader: DataLoader<string, Product>;
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

  private productLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          mapPinId: In(keys as string[]),
        },
      });

      return keys.map((key) => {
        return products.find((product) => product.mapPinId === key);
      })
    });
  }

  createLoaders() {
    return {
      getMapPin: this.getMapPin(),
      productLoader: this.productLoader(),
    };
  }
}