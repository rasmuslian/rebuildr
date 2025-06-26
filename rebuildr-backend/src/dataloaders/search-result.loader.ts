import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductStatus } from 'src/entities/product.entity';
import { PurchaseStatusEnum } from 'src/entities/purchase.entity';

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
          `ts_rank(p."textSearch", plainto_tsquery(sr."searchString"), 0) + similarity (p. "title", sr."searchString") > 0.3 AND p."status" = '${ProductStatus.PUBLISHED}'::product_status_enum`,
        )
        .where('sr.id IN (:...ids)', { ids: searchResultIds })
        .andWhere((qb) => {
          const subquery = qb
            .subQuery()
            .select('1')
            .from('purchase', 'pu')
            .where('pu.productId = p.id')
            .andWhere(
              `pu."status" = '${PurchaseStatusEnum.FINISHED_FAILED}'::purchase_status_enum OR pu."status" IS NULL`,
            )
            .getQuery();
          return `NOT EXISTS ${subquery}`;
        })
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
