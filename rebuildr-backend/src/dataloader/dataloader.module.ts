import { Module } from '@nestjs/common';
import { DataloaderService } from './dataloader.service';
import { ProductLoaderService } from './product.loader.service';

@Module({
  providers: [DataloaderService, ProductLoaderService],
  exports: [DataloaderService, ProductLoaderService],
})
export class DataloaderModule {}
