import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Product } from 'src/entities/product.entity';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';
import { File } from 'src/entities/file.entity';
import { DataSource, In } from 'typeorm';

export interface IProjectLoaders {
  productsLoader: DataLoader<string, Product[]>;
  projectPictureLoader: DataLoader<string, File>;
  likedByUserLoader: DataLoader<{ projectId: string; userId: string }, boolean>;
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

  createLoaders(): IProjectLoaders {
    return {
      productsLoader: this.dataloaderService.targetByParentIdLoader<Product[]>(
        'products',
        Project,
      ),
      projectPictureLoader: this.dataloaderService.targetByParentIdLoader<File>(
        'profilePicture',
        File,
      ),
      likedByUserLoader: this.likedByUserLoader(),
    };
  }
}
