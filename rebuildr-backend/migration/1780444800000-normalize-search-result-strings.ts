import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeSearchResultStrings1780444800000 implements MigrationInterface {
    name = 'NormalizeSearchResultStrings1780444800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "search_result" SET "searchString" = LOWER(TRIM("searchString"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Normalization is not reversible
    }
}
