import { Injectable } from "@nestjs/common";
import { DataSource, EntityTarget, In } from "typeorm";
import * as DataLoader from 'dataloader';

export interface IDataloaders {}

@Injectable()
export class DataloaderService {
  constructor(private readonly dataSource: DataSource) {}

  targetByParentIdLoader<T extends { id: string } | Array<{ id: string }>>(
    target: string,
    ParentClass: EntityTarget<any>,
  ): DataLoader<string, T, string> {
    return new DataLoader<string, T>(async (parentIds: string[]) => {
      const parents = await this.dataSource.getRepository(ParentClass).find({
        where: {
          id: In(parentIds),
        },
        relations: [target],
      });

      return parentIds.map(
        (id) => parents.find((parent) => parent.id === id)[target],
      );
    });
  }

  createLoaders(): IDataloaders {
    return {}
  }
}