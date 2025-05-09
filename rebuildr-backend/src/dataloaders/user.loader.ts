import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataloaderService } from './dataloader.service';
import { Project } from 'src/entities/project.entity';
import { GetSearchResultsInput } from 'src/resolvers/search-result.resolver';
import { SearchResult } from 'src/entities/search-result.entity';
import { DataSource, In, IsNull } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { File } from 'src/entities/file.entity';

export interface IUserLoaders {
  projectsLoader: DataLoader<string, Project[]>;
  soldProductsLoader: DataLoader<string, Product[]>;
  publishedProductsLoader: DataLoader<string, Product[]>;
  getSearchResultsLoader: (
    input: GetSearchResultsInput,
  ) => DataLoader<string, SearchResult[]>;
  profilePictureLoader: DataLoader<string, File>;
}

@Injectable()
export class UserLoader {
  constructor(
    private dataloaderService: DataloaderService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private getSearchResultsLoader(input: GetSearchResultsInput) {
    return new DataLoader<string, SearchResult[]>(async (userIds) => {
      const searchResults = await this.dataSource
        .getRepository(SearchResult)
        .find({
          where: {
            deletedAt: IsNull(),
            searcher: {
              id: In(userIds),
            },
          },
          take: input.pageSize,
          skip: input.page * input.pageSize,
          order: {
            updatedAt: 'DESC',
          },

          relations: ['searcher'],
        });

      const searchResultsMap = userIds.map((userId) =>
        searchResults.filter(
          (searchResult) => searchResult.searcher.id === userId,
        ),
      );
      return searchResultsMap;
    });
  }

  private soldProductsLoader() {
    return new DataLoader<string, Product[]>(async (userIds) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          sellerId: In(userIds),
          status: ProductStatus.SOLD,
        },
      });

      const productsMap = userIds.map((userId) =>
        products.filter((product) => product.sellerId === userId),
      );
      return productsMap;
    });
  }

  private publishedProductsLoader() {
    return new DataLoader(async (userIds) => {
      const products = await this.dataSource.getRepository(Product).find({
        where: {
          seller: {
            id: In(userIds),
          },
          status: ProductStatus.PUBLISHED,
          deletedAt: IsNull(),
          purchases: [
            { status: IsNull() },
            { status: PurchaseStatusEnum.FINISHED_FAILED },
          ],
        },
      });

      const productsMap = userIds.map((userId) =>
        products.filter((product) => product.seller?.id === userId),
      );
      return productsMap;
    });
  }

  createLoaders(): IUserLoaders {
    return {
      projectsLoader: this.dataloaderService.targetByParentIdLoader<Project[]>(
        'projects',
        Project,
      ),
      getSearchResultsLoader: (input: GetSearchResultsInput) =>
        this.getSearchResultsLoader(input),
      soldProductsLoader: this.soldProductsLoader(),
      publishedProductsLoader: this.publishedProductsLoader(),
      profilePictureLoader: this.dataloaderService.targetByParentIdLoader<File>(
        'profilePicture',
        File,
      ),
    };
  }
}
