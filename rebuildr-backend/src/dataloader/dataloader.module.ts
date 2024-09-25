import { Module } from '@nestjs/common';
import { DataloaderService } from './dataloader.service';
import { ProductLoaderService } from './product.loader.service';
import { CategoryLoaderService } from './category.loader.service';

@Module({
  providers: [DataloaderService, ProductLoaderService, CategoryLoaderService],
  exports: [DataloaderService, ProductLoaderService, CategoryLoaderService],
})
export class DataloaderModule {}
