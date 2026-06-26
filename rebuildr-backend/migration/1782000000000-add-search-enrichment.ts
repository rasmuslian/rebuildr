import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchEnrichment1782000000000 implements MigrationInterface {
  name = 'AddSearchEnrichment1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);
    await queryRunner.query(
      `ALTER TABLE "category" ADD "searchAliases" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "searchAliases" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "searchRelatedTerms" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "searchUseCases" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(`ALTER TABLE "product" ADD "searchDocument" text`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "searchDocumentVector" tsvector GENERATED ALWAYS AS (to_tsvector('swedish', coalesce("searchDocument", ''))) STORED`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'postgres',
        'public',
        'product',
        'GENERATED_COLUMN',
        'searchDocumentVector',
        `to_tsvector('swedish', coalesce("searchDocument", ''))`,
      ],
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_search_document_vector" ON "product" USING GIN ("searchDocumentVector")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_title_trgm" ON "product" USING GIN ("title" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_search_document_trgm" ON "product" USING GIN ("searchDocument" gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_product_search_document_trgm"`);
    await queryRunner.query(`DROP INDEX "IDX_product_title_trgm"`);
    await queryRunner.query(`DROP INDEX "IDX_product_search_document_vector"`);
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      [
        'GENERATED_COLUMN',
        'searchDocumentVector',
        'postgres',
        'public',
        'product',
      ],
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "searchDocumentVector"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "searchDocument"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "searchUseCases"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "searchRelatedTerms"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "searchAliases"`);
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "searchAliases"`);
  }
}