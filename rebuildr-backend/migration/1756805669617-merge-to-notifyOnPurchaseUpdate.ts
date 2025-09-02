import { MigrationInterface, QueryRunner } from "typeorm";

export class MergeToNotifyOnPurchaseUpdate1756805669617 implements MigrationInterface {
    name = 'MergeToNotifyOnPurchaseUpdate1756805669617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notifyOnBuy"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notifyOnSale"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notifyOnPurchaseUpdate" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notifyOnPurchaseUpdate"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notifyOnSale" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notifyOnBuy" boolean NOT NULL DEFAULT true`);
    }

}
