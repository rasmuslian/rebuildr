import { Module } from '@nestjs/common';
import { ProductLoader } from './product.loader';
import { CategoryLoader } from './category.loader';
import { DataloaderService } from './dataloader.service';

@Module({
  providers: [DataloaderService, ProductLoader, CategoryLoader],
  exports: [DataloaderService, ProductLoader, CategoryLoader],
})
export class DataloaderModule {}
