import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';
import { File } from 'src/entities/file.entity';
import { DataSource, In } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { MapPin } from 'src/entities/map-pin.entity';

export interface IProjectLoaders {
  productsLoader: DataLoader<
    { projectId: string; searchString?: string },
    Product[]
  >;
  projectPictureLoader: DataLoader<string, File>;
  likedByUserLoader: DataLoader<{ projectId: string; userId: string }, boolean>;
  userLoader: DataLoader<string, User>;
  mapPinLoader: DataLoader<string, MapPin>;
}

@Injectable()
export class ProjectLoader {
  constructor(
    private readonly dataloaderService: DataloaderService,
    private readonly dataSource: DataSource,
  ) {}

  private likedByUserLoader() {
    return new DataLoader(
      async (keys: readonly { projectId: string; userId: string }[]) => {
        const userId = keys[0]?.userId;
        const projectIds = keys.map((k) => k.projectId);
        const projects = await this.dataSource.getRepository(Project).find({
          where: { id: In(projectIds), likedBy: { id: userId } },
        });

        return projectIds.map((id) =>
          projects.find((p) => p.id === id) ? true : false,
        );
      },
    );
  }

  private productsLoader() {
    return new DataLoader<
      { projectId: string; searchString?: string },
      Product[]
    >(async (keys: readonly { projectId: string; searchString?: string }[]) => {
      const searchString = keys[0]?.searchString;
      const projectIds = keys.map((k) => k.projectId);

      const query = this.dataSource
        .getRepository(Product)
        .createQueryBuilder('p');

      query
        .where('p."projectId" IN (:...projectIds)', { projectIds })
        .andWhere('p.status NOT IN (:...excludedStatuses)', {
          excludedStatuses: [ProductStatus.DELETED, ProductStatus.DRAFT],
        })
        .orderBy('p."status", p."createdAt"');

      if (searchString && searchString.length > 0) {
        query
          .addCommonTableExpression(
            `SELECT
            p.id,
            ts_rank(p."textSearch", plainto_tsquery(:searchString), 0) + similarity(p.title, :searchString) as resultrank
          FROM product p
          WHERE p."textSearch" @@ plainto_tsquery(:searchString)
            OR similarity(p.title, :searchString) > 0
          `,
            'ranked_products',
          )
          .setParameter('searchString', searchString)
          .innerJoin('ranked_products', 'rp', 'rp.id = p.id')
          .andWhere('rp.resultrank > 0.3')
          .addSelect('rp.resultrank', 'resultrank');
      }

      const products = await query.getMany();
      return projectIds.map((projectId) =>
        products.filter((product) => product.projectId === projectId),
      );
    });
  }

  createLoaders(): IProjectLoaders {
    return {
      productsLoader: this.productsLoader(),
      projectPictureLoader: this.dataloaderService.targetByParentIdLoader<File>(
        'profilePicture',
        Project,
      ),
      likedByUserLoader: this.likedByUserLoader(),
      userLoader: this.dataloaderService.targetByParentIdLoader<User>(
        'user',
        Project,
      ),
      mapPinLoader: this.dataloaderService.targetByParentIdLoader<MapPin>(
        'mapPin',
        Project,
      ),
    };
  }
}
