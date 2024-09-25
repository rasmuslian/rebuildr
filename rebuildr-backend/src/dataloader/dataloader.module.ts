import { Module } from '@nestjs/common';
import { ProductLoader } from './product.loader';
import { CategoryLoader } from './category.loader';

@Module({
  providers: [ProductLoader, CategoryLoader],
  exports: [ProductLoader, CategoryLoader],
})
export class DataloaderModule {}
