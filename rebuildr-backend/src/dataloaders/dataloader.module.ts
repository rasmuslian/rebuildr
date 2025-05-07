import { Module } from '@nestjs/common';
import { ProductLoader } from './product.loader';
import { CategoryLoader } from './category.loader';
import { DataloaderService } from './dataloader.service';
import { UserLoader } from './user.loader';

@Module({
  providers: [DataloaderService, ProductLoader, CategoryLoader, UserLoader],
  exports: [DataloaderService, ProductLoader, CategoryLoader, UserLoader],
})
export class DataloaderModule {}
