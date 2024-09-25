import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';

export interface IProductLoaders {
  likedByUserLoader: DataLoader<
    { productId: string; userId?: string },
    boolean
  >;
  userLoader: DataLoader<string, User>;
  mainImageLoader: DataLoader<string, File>;
}

@Injectable()
export class ProductLoader {
  constructor(private readonly dataSource: DataSource) {}

  private likedByUserLoader() {
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

  private userLoader() {
    return new DataLoader(async (keys: string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: { id: In(keys) },
        relations: { user: true },
      });

      //make sure data is returned in the correct order by mapping from keys
      return keys.map((key) => products.find((p) => p.id === key)?.user);
    });
  }

  private mainImageLoader() {
    return new DataLoader(async (keys: string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: { id: In(keys) },
        relations: { images: true },
      });

      //make sure data is returned in the correct order by mapping from keys
      return keys.map((key) => products.find((p) => p.id === key)?.images?.[0]);
    });
  }

  createLoaders(): IProductLoaders {
    return {
      likedByUserLoader: this.likedByUserLoader(),
      userLoader: this.userLoader(),
      mainImageLoader: this.mainImageLoader(),
    };
  }
}
