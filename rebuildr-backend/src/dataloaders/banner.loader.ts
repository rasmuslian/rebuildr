import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataloaderService } from './dataloader.service';
import { Banner } from 'src/entities/banner.entity';
import { File } from 'src/entities/file.entity';

export interface IBannerLoaders {
  backgroundImageLoader: DataLoader<string, File | undefined>;
  logoLoader: DataLoader<string, File | undefined>;
}

@Injectable()
export class BannerLoader {
  constructor(private dataloaderService: DataloaderService) {}

  createLoaders(): IBannerLoaders {
    return {
      backgroundImageLoader: this.dataloaderService.targetByParentIdLoader<
        File | undefined
      >('backgroundImage', Banner),
      logoLoader: this.dataloaderService.targetByParentIdLoader<
        File | undefined
      >('logo', Banner),
    };
  }
}
