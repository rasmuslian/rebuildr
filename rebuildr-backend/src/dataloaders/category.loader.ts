import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';

export interface ICategoryLoaders {
  childrenLoader: DataLoader<string, Category[]>;
  imageLoader: DataLoader<string, File>;
}

@Injectable()
export class CategoryLoader {
  constructor(private readonly dataSource: DataSource) {}

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

  createLoaders(): ICategoryLoaders {
    return {
      childrenLoader: this.childrenLoader(),
      imageLoader: this.imageLoader(),
    };
  }
}
