import { Injectable } from "@nestjs/common";
import { DataloaderService } from "./dataloader.service";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, In } from "typeorm";
import DataLoader from "dataloader";
import { MapPin } from "src/entities/map-pin.entity";

export interface IMapPinLoaders {
  mapPinsByProductIdsLoader: DataLoader<string, MapPin | null>;
  mapPinsByUserIdsLoader: DataLoader<string, MapPin | null>;
  mapPinsByProjectIdsLoader: DataLoader<string, MapPin | null>;
}

@Injectable()
export class MapPinLoader {

  constructor(
    private dataloaderService: DataloaderService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private mapPinsByProductIdsLoader() {
    return new DataLoader<string, MapPin | null>(async (productIds) => {
      const mapPins = await this.dataSource.getRepository(MapPin).find({
        where: {
          productId: In(productIds),
        },
      });

      return productIds.map((productId) =>
        mapPins.find((mapPin) => mapPin.productId === productId) || null,
      );
    });
  }

  private mapPinsByUserIdsLoader() {
    return new DataLoader<string, MapPin | null>(async (userIds) => {
      const mapPins = await this.dataSource.getRepository(MapPin).find({
        where: {
          userId: In(userIds),
        },
      });

      return userIds.map((userId) =>
        mapPins.find((mapPin) => mapPin.userId === userId) || null,
      );
    });
  }

  private mapPinsByProjectIdsLoader() {
    return new DataLoader<string, MapPin | null>(async (projectIds) => {
      const mapPins = await this.dataSource.getRepository(MapPin).find({
        where: {
          projectId: In(projectIds),
        },
      });

      return projectIds.map((projectId) =>
        mapPins.find((mapPin) => mapPin.projectId === projectId) || null,
      );
    });
  }

  createLoaders() {
    return {
      mapPinsByProductIdsLoader: this.mapPinsByProductIdsLoader(),
      mapPinsByUserIdsLoader: this.mapPinsByUserIdsLoader(),
      mapPinsByProjectIdsLoader: this.mapPinsByProjectIdsLoader(),
    };
  }
}