import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { File } from 'src/entities/file.entity';
import { DataloaderService } from './dataloader.service';
import { Partner } from 'src/entities/partner.entity';

export interface IPartnerLoaders {
  logoLoader: DataLoader<string, File>;
}

@Injectable()
export class PartnerLoader {
  constructor(private readonly dataloaderService: DataloaderService) {}

  createLoaders(): IPartnerLoaders {
    return {
      logoLoader: this.dataloaderService.targetByParentIdLoader<File>(
        'logo',
        Partner,
      ),
    };
  }
}
