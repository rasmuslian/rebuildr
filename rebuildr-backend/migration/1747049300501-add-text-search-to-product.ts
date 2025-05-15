import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTextSearchToProduct1747049300501 implements MigrationInterface {
    name = 'AddTextSearchToProduct1747049300501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "text_search" tsvector GENERATED ALWAYS AS (setweight(to_tsvector('swedish', coalesce(title, '')), 'A') || setweight(to_tsvector('swedish', coalesce(description, '')), 'B')) STORED`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["postgres","public","product","GENERATED_COLUMN","text_search","setweight(to_tsvector('swedish', coalesce(title, '')), 'A') || setweight(to_tsvector('swedish', coalesce(description, '')), 'B')"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","text_search","postgres","public","product"]);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "text_search"`);
    }

}
