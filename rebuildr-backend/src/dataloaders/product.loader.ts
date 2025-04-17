import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';
import { DataloaderService } from './dataloader.service';
import { Brand } from 'src/entities/brand.entity';

export interface IProductLoaders {
  likedByUserLoader: DataLoader<{ productId: string; userId: string }, boolean>;
  sellerLoader: DataLoader<string, User>;
  primaryImageLoader: DataLoader<string, File>;
  imagesLoader: DataLoader<string, File[]>;
  documentsLoader: DataLoader<string, File[]>;
  brandLoader: DataLoader<string, Brand>;
}

@Injectable()
export class ProductLoader {
  constructor(
    private readonly dataSource: DataSource,
    private readonly dataloaderService: DataloaderService,
  ) {}

  private likedByUserLoader() {
    return new DataLoader(
      async (keys: readonly { productId: string; userId: string }[]) => {
        const userId = keys[0]?.userId;
        const productIds = keys.map((k) => k.productId);

        const products = await this.dataSource.getRepository(Product).find({
          where: { id: In(productIds), likedBy: { id: userId } },
        });

        return productIds.map((id) =>
          products.find((p) => p.id === id) ? true : false,
        );
      },
    );
  }

  private sellerLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: { id: In(keys) },
        relations: { seller: true },
      });

      //make sure data is returned in the correct order by mapping from keys
      return keys.map((key) => products.find((p) => p.id === key)?.seller);
    });
  }

  private primaryImageLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: { id: In(keys) },
        relations: { images: true },
      });

      //make sure data is returned in the correct order by mapping from keys
      return keys.map((key) => products.find((p) => p.id === key)?.images?.[0]);
    });
  }

  private brandLoader;

  createLoaders(): IProductLoaders {
    return {
      likedByUserLoader: this.likedByUserLoader(),
      sellerLoader: this.sellerLoader(),
      primaryImageLoader: this.primaryImageLoader(),
      imagesLoader: this.dataloaderService.targetByParentIdLoader<File[]>(
        'images',
        Product,
      ),
      documentsLoader: this.dataloaderService.targetByParentIdLoader<File[]>(
        'documents',
        Product,
      ),
      brandLoader: this.dataloaderService.targetByParentIdLoader<Brand>(
        'brand',
        Product,
      ),
    };
  }
}
