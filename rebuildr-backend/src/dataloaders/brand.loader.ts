import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataloaderService } from './dataloader.service';
import { User } from 'src/entities/user.entity';
import { Brand } from 'src/entities/brand.entity';

export interface IBrandLoaders {
  createdByLoader: DataLoader<string, User | undefined>;
}

@Injectable()
export class BrandLoader {
  constructor(private dataloaderService: DataloaderService) {}

  createLoaders(): IBrandLoaders {
    return {
      createdByLoader: this.dataloaderService.targetByParentIdLoader<
        User | undefined
      >('createdBy', Brand),
    };
  }
}
