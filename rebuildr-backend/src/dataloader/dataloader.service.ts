import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from 'src/entities/product.entity';

export interface IDataloaders {
  likedByUserLoader: DataLoader<
    { productId: string; userId?: string },
    boolean
  >;
}

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

  likedByUserLoader() {
    return new DataLoader(
      async (keys: { productId: string; userId?: string }[]) => {
        const userId = keys[0]?.userId;
        const productIds = keys.map((k) => k.productId);
        if (!userId) {
          return null;
        }

        const products = await this.dataSource.getRepository(Product).find({
          where: { id: In(productIds), likedBy: { id: userId } },
        });

        return productIds.map((id) =>
          products.find((p) => p.id === id) ? true : false,
        );
      },
    );
  }

  createLoaders(): IDataloaders {
    return { likedByUserLoader: this.likedByUserLoader() };
  }
}
