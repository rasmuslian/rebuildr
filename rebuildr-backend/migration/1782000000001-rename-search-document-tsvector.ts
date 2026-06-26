import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSearchDocumentTsvector1782000000001
  implements MigrationInterface
{
  name = 'RenameSearchDocumentTsvector1782000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'product'
            AND column_name = 'searchDocumentVector'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'product'
            AND column_name = 'searchDocumentTsvector'
        ) THEN
          ALTER TABLE "product"
          RENAME COLUMN "searchDocumentVector" TO "searchDocumentTsvector";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'product'
            AND indexname = 'IDX_product_search_document_vector'
        ) AND NOT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'product'
            AND indexname = 'IDX_product_search_document_tsvector'
        ) THEN
          ALTER INDEX "IDX_product_search_document_vector"
          RENAME TO "IDX_product_search_document_tsvector";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `UPDATE "typeorm_metadata"
       SET "name" = $1
       WHERE "type" = $2
         AND "database" = $3
         AND "schema" = $4
         AND "table" = $5
         AND "name" = $6`,
      [
        'searchDocumentTsvector',
        'GENERATED_COLUMN',
        'postgres',
        'public',
        'product',
        'searchDocumentVector',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'product'
            AND indexname = 'IDX_product_search_document_tsvector'
        ) AND NOT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = 'product'
            AND indexname = 'IDX_product_search_document_vector'
        ) THEN
          ALTER INDEX "IDX_product_search_document_tsvector"
          RENAME TO "IDX_product_search_document_vector";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'product'
            AND column_name = 'searchDocumentTsvector'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'product'
            AND column_name = 'searchDocumentVector'
        ) THEN
          ALTER TABLE "product"
          RENAME COLUMN "searchDocumentTsvector" TO "searchDocumentVector";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `UPDATE "typeorm_metadata"
       SET "name" = $1
       WHERE "type" = $2
         AND "database" = $3
         AND "schema" = $4
         AND "table" = $5
         AND "name" = $6`,
      [
        'searchDocumentVector',
        'GENERATED_COLUMN',
        'postgres',
        'public',
        'product',
        'searchDocumentTsvector',
      ],
    );
  }
}