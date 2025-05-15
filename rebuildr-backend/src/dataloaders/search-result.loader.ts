import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SearchResult } from 'src/entities/search-result.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike, In, IsNull } from 'typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { PurchaseStatusEnum } from 'src/entities/purchase.entity';

export interface ISearchResultLoaders {
  getSearchResultProductCount: DataLoader<string, number>;
}
@Injectable()
export class SearchResultLoader {
  constructor(@InjectDataSource() private readonly datasource: DataSource) {}

  private getSearchResultProductCount() {
    return new DataLoader<string, number>(async (searchResultIds) => {
      const searchResults = await this.datasource
        .getRepository(SearchResult)
        .find({ where: { id: In(searchResultIds) } });

      return await Promise.all(
        searchResultIds.map(async (searchResultId) => {
          const searchResult = searchResults.find(
            (sr) => sr.id === searchResultId,
          );
          const found = await this.datasource.getRepository(Product).find({
            where: [
              {
                title: ILike(`%${searchResult?.searchString}%`),
                status: ProductStatus.PUBLISHED,
                purchases: [
                  {
                    status: PurchaseStatusEnum.FINISHED_FAILED,
                  },
                  { status: IsNull() },
                ],
              },
              {
                description: ILike(`%${searchResult?.searchString}%`),
                status: ProductStatus.PUBLISHED,
                purchases: [
                  {
                    status: PurchaseStatusEnum.FINISHED_FAILED,
                  },
                  { status: IsNull() },
                ],
              },
            ],
            relations: {
              purchases: true,
            },
          });
          return found?.length;
        }),
      );
    });
  }

  createLoaders(): ISearchResultLoaders {
    return {
      getSearchResultProductCount: this.getSearchResultProductCount(),
    };
  }
}
