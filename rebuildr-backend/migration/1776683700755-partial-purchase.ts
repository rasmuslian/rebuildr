import { MigrationInterface, QueryRunner } from "typeorm";

export class PartialPurchase1776683700755 implements MigrationInterface {
    name = 'PartialPurchase1776683700755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "purchasedQuantity" integer`);
        await queryRunner.query(`ALTER TABLE "product" ADD "soldByQuantity" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "soldByQuantity"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "purchasedQuantity"`);
    }

}
