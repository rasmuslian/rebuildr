import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from 'src/entities/product.entity';

export interface IProductLoaders {
  likedByUserLoader: DataLoader<
    { productId: string; userId?: string },
    boolean
  >;
}

@Injectable()
export class ProductLoaderService {
  constructor(private readonly dataSource: DataSource) {}

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

  createLoaders(): IProductLoaders {
    return { likedByUserLoader: this.likedByUserLoader() };
  }
}
