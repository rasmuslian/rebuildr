import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceSuggestionToProduct1781000000000 implements MigrationInterface {
    name = 'AddPriceSuggestionToProduct1781000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "priceSuggestionMin" integer`);
        await queryRunner.query(`ALTER TABLE "product" ADD "priceSuggestionMax" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "priceSuggestionMax"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "priceSuggestionMin"`);
    }
}
