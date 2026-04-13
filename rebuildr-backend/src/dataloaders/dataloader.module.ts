import { Module } from '@nestjs/common';
import { ProductLoader } from './product.loader';
import { CategoryLoader } from './category.loader';
import { DataloaderService } from './dataloader.service';
import { UserLoader } from './user.loader';
import { SearchResultLoader } from './search-result.loader';
import { ProjectLoader } from './project.loader';
import { ReviewLoader } from './review.loader';
import { PurchaseLoader } from './purchase.loader';
import { MessageLoader } from './message.loader';
import { PartnerLoader } from './partner.loader';
import { BrandLoader } from './brand.loader';
import { BannerLoader } from './banner.loader';

@Module({
  providers: [
    DataloaderService,
    ProductLoader,
    CategoryLoader,
    UserLoader,
    SearchResultLoader,
    ProjectLoader,
    ReviewLoader,
    PurchaseLoader,
    MessageLoader,
    PartnerLoader,
    BrandLoader,
    BannerLoader,
  ],
  exports: [
    DataloaderService,
    ProductLoader,
    CategoryLoader,
    UserLoader,
    SearchResultLoader,
    ProjectLoader,
    ReviewLoader,
    PurchaseLoader,
    MessageLoader,
    PartnerLoader,
    BrandLoader,
    BannerLoader,
  ],
})
export class DataloaderModule {}
