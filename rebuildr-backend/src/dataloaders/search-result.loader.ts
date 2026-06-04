import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductStatus } from 'src/entities/product.entity';
import { PRODUCT_SEARCH_RANK_THRESHOLD } from 'src/services/product.service';

export interface ISearchResultLoaders {
  getSearchResultProductCount: DataLoader<string, number>;
}
@Injectable()
export class SearchResultLoader {
  constructor(@InjectDataSource() private readonly datasource: DataSource) {}

  private getSearchResultProductCount() {
    return new DataLoader<string, number>(async (searchResultIds) => {
      const result = await this.datasource
        .createQueryBuilder()
        .select('sr.id', 'id')
        .addSelect('COUNT(p.id)', 'count')
        .from('search_result', 'sr')
        .leftJoin(
          'product',
          'p',
          `(
            ts_rank(p."textSearch", plainto_tsquery(sr."searchString"), 0) + similarity(p."title", sr."searchString") > ${PRODUCT_SEARCH_RANK_THRESHOLD}
            OR p."title" ILIKE (sr."searchString" || '%')
          )
          AND (p."status" = '${ProductStatus.PUBLISHED}'::product_status_enum OR p."status" = '${ProductStatus.SOLD}'::product_status_enum)
          AND p."hiddenReason" IS NULL`,
        )
        .where('sr.id IN (:...ids)', { ids: searchResultIds })
        .groupBy('sr.id')
        .getRawMany();
      return searchResultIds.map(
        (id) => result.find((r) => r.id === id)?.count ?? 0,
      );
    });
  }

  createLoaders(): ISearchResultLoaders {
    return {
      getSearchResultProductCount: this.getSearchResultProductCount(),
    };
  }
}
