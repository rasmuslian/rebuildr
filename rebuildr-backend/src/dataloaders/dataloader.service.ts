import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataSource, EntityTarget, In } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DataloaderService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  targetByParentIdLoader<T extends { id: string } | { id: string }[]>(
    target: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ParentClass: EntityTarget<any>,
  ): DataLoader<string, T, string> {
    return new DataLoader<string, T>(async (parentIds: readonly string[]) => {
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
}
