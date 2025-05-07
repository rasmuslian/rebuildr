import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexToCategory1744616881456 implements MigrationInterface {
    name = 'AddIndexToCategory1744616881456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "order_index" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "order_index"`);
    }

}
