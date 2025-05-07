import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';

export interface IUserLoaders {
  projectsLoader: DataLoader<string, Project[]>;
}

@Injectable()
export class UserLoader {
  constructor(private dataloaderService: DataloaderService) {}

  createLoaders(): IUserLoaders {
    return {
      projectsLoader: this.dataloaderService.targetByParentIdLoader<Project[]>(
        'projects',
        Project,
      ),
    };
  }
}
