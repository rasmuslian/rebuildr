import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';
import { DataloaderService } from './dataloader.service';
import { Brand } from 'src/entities/brand.entity';

export interface ICategoryLoaders {
  childrenLoader: DataLoader<string, Category[]>;
  imageLoader: DataLoader<string, File>;
  brandsLoader: DataLoader<string, Brand[]>;
  parentLoader: DataLoader<string, Category>;
}

@Injectable()
export class CategoryLoader {
  constructor(
    private readonly dataSource: DataSource,
    private dataloaderService: DataloaderService,
  ) {}

  private childrenLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const parents = await this.dataSource
        .getRepository(Category)
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.children', 'children')
        .where('c.id IN (:...ids)', { ids: keys })
        .getMany();

      return keys.map(
        (key) => parents.find((parent) => parent.id === key)?.children,
      );
    });
  }

  private imageLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const categories = await this.dataSource.getRepository(Category).find({
        where: { id: In(keys) },
        relations: { image: true },
      });

      return keys.map(
        (key) => categories.find((category) => category.id === key)?.image,
      );
    });
  }

  private brandsLoader() {
    return new DataLoader(async (keys: readonly string[]) => {
      const categories = await this.dataSource.getRepository(Category).find({
        where: { id: In(keys) },
        relations: { brands: true },
        order: { brands: { name: 'ASC' } },
      });

      return keys.map(
        (key) => categories.find((category) => category.id === key)?.brands,
      );
    });
  }

  createLoaders(): ICategoryLoaders {
    return {
      childrenLoader: this.childrenLoader(),
      imageLoader: this.imageLoader(),
      brandsLoader: this.brandsLoader(),
      parentLoader: this.dataloaderService.targetByParentIdLoader<Category>(
        'parent',
        Category,
      ),
    };
  }
}
