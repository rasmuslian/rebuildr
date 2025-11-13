import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { File } from 'src/entities/file.entity';
import { DataloaderService } from './dataloader.service';
import { Message } from 'src/entities/message.entity';

export interface IMessageLoaders {
  imagesLoader: DataLoader<string, File[]>;
  documentsLoader: DataLoader<string, File[]>;
}
@Injectable()
export class MessageLoader {
  constructor(private readonly dataloaderService: DataloaderService) {}

  createLoaders(): IMessageLoaders {
    return {
      imagesLoader: this.dataloaderService.targetByParentIdLoader<File[]>(
        'images',
        Message,
      ),
      documentsLoader: this.dataloaderService.targetByParentIdLoader<File[]>(
        'documents',
        Message,
      ),
    };
  }
}
