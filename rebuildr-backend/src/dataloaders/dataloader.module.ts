import { Module } from '@nestjs/common';
import { ProductLoader } from './product.loader';
import { CategoryLoader } from './category.loader';
import { DataloaderService } from './dataloader.service';
import { UserLoader } from './user.loader';
import { SearchResultLoader } from './search-result.loader';
import { ProjectLoader } from './project.loader';
import { ReviewLoader } from './review.loader';

@Module({
  providers: [
    DataloaderService,
    ProductLoader,
    CategoryLoader,
    UserLoader,
    SearchResultLoader,
    ProjectLoader,
    ReviewLoader,
  ],
  exports: [
    DataloaderService,
    ProductLoader,
    CategoryLoader,
    UserLoader,
    SearchResultLoader,
    ProjectLoader,
    ReviewLoader,
  ],
})
export class DataloaderModule {}
