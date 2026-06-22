import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductStatus } from 'src/entities/product.entity';

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
            coalesce(p."searchDocumentTsvector", p."textSearch") @@ websearch_to_tsquery('swedish', sr."searchString")
            OR p."title" ILIKE ('%' || sr."searchString" || '%')
            OR p.description ILIKE ('%' || sr."searchString" || '%')
            OR EXISTS (SELECT 1 FROM category c WHERE c.id = p."categoryId" AND c.name ILIKE ('%' || sr."searchString" || '%'))
            OR EXISTS (
              SELECT 1 FROM category c
              INNER JOIN category parent ON parent.id = c."parentId"
              WHERE c.id = p."categoryId" AND parent.name ILIKE ('%' || sr."searchString" || '%')
            )
            OR EXISTS (
              SELECT 1 FROM category c, unnest(coalesce(c."searchAliases", '{}')) alias
              WHERE c.id = p."categoryId" AND alias ILIKE ('%' || sr."searchString" || '%')
            )
            OR EXISTS (SELECT 1 FROM unnest(coalesce(p."searchAliases", '{}')) alias WHERE alias ILIKE ('%' || sr."searchString" || '%'))
            OR EXISTS (SELECT 1 FROM unnest(coalesce(p."searchRelatedTerms", '{}')) term WHERE term ILIKE ('%' || sr."searchString" || '%'))
            OR EXISTS (SELECT 1 FROM unnest(coalesce(p."searchUseCases", '{}')) use_case WHERE use_case ILIKE ('%' || sr."searchString" || '%'))
            OR word_similarity(lower(sr."searchString"), lower(p.title)) >= 0.55
            OR word_similarity(lower(sr."searchString"), lower(coalesce(p."searchDocument", ''))) >= 0.45
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
