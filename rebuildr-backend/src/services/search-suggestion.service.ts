import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  GetSearchSuggestionsInput,
  SearchSuggestion,
  SearchSuggestionTypeEnum,
} from 'src/resolvers/search-suggestion.resolver';

interface SearchSuggestionRow {
  label: string;
  type: SearchSuggestionTypeEnum;
  categoryId: string | null;
  parentId: string | null;
  productCount: string;
}

@Injectable()
export class SearchSuggestionService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getSearchSuggestions(
    input: GetSearchSuggestionsInput,
  ): Promise<SearchSuggestion[]> {
    const searchString = input.searchString.trim().toLocaleLowerCase('sv-SE');

    if (searchString.length < 2 || this.hasSpammyRepetition(searchString)) {
      return [];
    }

    const limit = Math.min(input.limit ?? 8, 12);

    const rows = await this.dataSource.query<SearchSuggestionRow[]>(
      `
      WITH published_products AS (
        SELECT
          p.id,
          p.title,
          p."categoryId",
          p."brandId",
          p."searchAliases",
          p."searchRelatedTerms",
          p."searchUseCases",
          p."publishedAt"
        FROM product p
        WHERE p.status = 'PUBLISHED'::product_status_enum
          AND p."visibility" = 'PUBLIC'::product_visibility_enum
          AND p."hiddenReason" IS NULL
          AND p."deletedAt" IS NULL
      ),
      title_terms AS (
        SELECT
          pp.id,
          pp."categoryId",
          term
        FROM published_products pp
        CROSS JOIN LATERAL regexp_split_to_table(
          lower(regexp_replace(pp.title, '[^[:alpha:][:space:]-]', ' ', 'g')),
          '\\s+'
        ) term
        WHERE char_length(term) BETWEEN 3 AND 30
          AND term !~ '[0-9]'
          AND term NOT IN (
            'att',
            'och',
            'eller',
            'för',
            'med',
            'som',
            'till',
            'vit',
            'vita',
            'svart',
            'svarta',
            'grå',
            'gråa',
            'ny',
            'nya',
            'gammal',
            'gamla',
            'stabil',
            'stadig',
            'fin',
            'fint',
            'bra'
          )
      ),
      candidates AS (
        SELECT
          alias AS label,
          'PRODUCT_TERM' AS type,
          c.id AS "categoryId",
          NULL::uuid AS "parentId",
          pp.id AS "productId",
          5.25 AS "baseScore"
        FROM category c
        CROSS JOIN LATERAL unnest(coalesce(c."searchAliases", '{}')) alias
        INNER JOIN published_products pp
          ON pp."categoryId" = c.id OR pp."categoryId" IN (
            SELECT child.id FROM category child WHERE child."parentId" = c.id
          )
        WHERE (
            alias ILIKE ($1 || '%')
            OR alias ILIKE ('%' || $1 || '%')
            OR word_similarity(lower($1), lower(alias)) >= 0.55
          )
          AND lower(alias) <> lower(c.name)

        UNION ALL

        SELECT
            tt.term AS label,
          'PRODUCT_TERM' AS type,
            tt."categoryId" AS "categoryId",
          NULL::uuid AS "parentId",
            tt.id AS "productId",
            4.75 AS "baseScore"
          FROM title_terms tt
          WHERE tt.term ILIKE ($1 || '%')
            OR tt.term ILIKE ('%' || $1 || '%')
            OR word_similarity(lower($1), lower(tt.term)) >= 0.55

        UNION ALL

        SELECT
          alias AS label,
          'PRODUCT_TERM' AS type,
          pp."categoryId" AS "categoryId",
          NULL::uuid AS "parentId",
          pp.id AS "productId",
          5.5 AS "baseScore"
        FROM published_products pp
        CROSS JOIN LATERAL unnest(coalesce(pp."searchAliases", '{}')) alias
        WHERE alias ILIKE ($1 || '%')
          OR alias ILIKE ('%' || $1 || '%')
          OR word_similarity(lower($1), lower(alias)) >= 0.55

        UNION ALL

        SELECT
          b.name AS label,
          'BRAND' AS type,
          pp."categoryId" AS "categoryId",
          NULL::uuid AS "parentId",
          pp.id AS "productId",
          4.5 AS "baseScore"
        FROM published_products pp
        INNER JOIN brand b ON b.id = pp."brandId"
        WHERE b.name ILIKE ($1 || '%')
          OR word_similarity(lower($1), lower(b.name)) >= 0.6

        UNION ALL

        SELECT
          term AS label,
          'PRODUCT_TERM' AS type,
          pp."categoryId" AS "categoryId",
          NULL::uuid AS "parentId",
          pp.id AS "productId",
          3.5 AS "baseScore"
        FROM published_products pp
        CROSS JOIN LATERAL unnest(coalesce(pp."searchRelatedTerms", '{}')) term
        WHERE term ILIKE ($1 || '%')
          OR word_similarity(lower($1), lower(term)) >= 0.6

        UNION ALL

        SELECT
          use_case AS label,
          'USE_CASE' AS type,
          pp."categoryId" AS "categoryId",
          NULL::uuid AS "parentId",
          pp.id AS "productId",
          2.5 AS "baseScore"
        FROM published_products pp
        CROSS JOIN LATERAL unnest(coalesce(pp."searchUseCases", '{}')) use_case
        WHERE use_case ILIKE ($1 || '%')
          OR word_similarity(lower($1), lower(use_case)) >= 0.65
      ),
      scored AS (
        SELECT
          label,
          type,
          "categoryId",
          "parentId",
          COUNT(DISTINCT "productId") AS "productCount",
          MAX("baseScore")
            + LEAST(COUNT(DISTINCT "productId") * 0.15, 2)
            + MAX(CASE WHEN lower(label) = $1 THEN 2 ELSE 0 END)
            + MAX(CASE WHEN label ILIKE ($1 || '%') THEN 1 ELSE 0 END)
            + MAX(word_similarity(lower($1), lower(label))) AS score
        FROM candidates
        WHERE char_length(label) BETWEEN 2 AND 40
          AND label !~* '([[:alpha:]])\\1{4,}'
        GROUP BY lower(label), label, type, "categoryId", "parentId"
      ),
      deduped AS (
        SELECT
          label,
          type,
          "categoryId",
          "parentId",
          "productCount",
          score,
          ROW_NUMBER() OVER (
            PARTITION BY lower(label)
            ORDER BY score DESC, "productCount" DESC, char_length(label) ASC
          ) AS row_number
        FROM scored
      )
      SELECT
        label,
        type,
        "categoryId",
        "parentId",
        "productCount"
      FROM deduped
      WHERE "productCount" > 0
        AND row_number = 1
      ORDER BY score DESC, "productCount" DESC, char_length(label) ASC
      LIMIT $2
      `,
      [searchString, limit],
    );

    return rows.map((row) => ({
      label: row.label,
      type: row.type,
      categoryId: row.categoryId ?? undefined,
      parentId: row.parentId ?? undefined,
      productCount: Number(row.productCount),
    }));
  }

  private hasSpammyRepetition(searchString: string) {
    return /(\p{L})\1{4,}/u.test(searchString);
  }
}
