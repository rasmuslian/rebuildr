import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';
import { File } from 'src/entities/file.entity';
import { DataSource, In, Not } from 'typeorm';
import { User } from 'src/entities/user.entity';

export interface IProjectLoaders {
  productsLoader: DataLoader<string, Product[]>;
  projectPictureLoader: DataLoader<string, File>;
  likedByUserLoader: DataLoader<{ projectId: string; userId: string }, boolean>;
  userLoader: DataLoader<string, User>;
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
    return new DataLoader<string, Product[]>(async (projectIds) => {
      const projects = await this.dataSource.getRepository(Project).find({
        where: {
          id: In(projectIds),
          products: {
            status: Not(In([ProductStatus.DELETED, ProductStatus.DRAFT])),
          },
        },
        relations: { products: true },
      });

      return projectIds.map(
        (projectId) =>
          projects.find((project) => project.id === projectId)?.products ?? [],
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
    };
  }
}
