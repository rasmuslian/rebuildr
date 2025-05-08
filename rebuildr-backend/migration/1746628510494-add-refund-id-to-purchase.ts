import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefundIdToPurchase1746628510494 implements MigrationInterface {
    name = 'AddRefundIdToPurchase1746628510494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "refund_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "refund_id"`);
    }

}
