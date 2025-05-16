import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Product } from 'src/entities/product.entity';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';
import { File } from 'src/entities/file.entity';

export interface IProjectLoaders {
  productsLoader: DataLoader<string, Product[]>;
  projectPictureLoader: DataLoader<string, File>;
}

@Injectable()
export class ProjectLoader {
  constructor(private readonly dataloaderService: DataloaderService) {}

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
    };
  }
}
