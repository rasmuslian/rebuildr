import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentIntentIdToPurchase1760009178742 implements MigrationInterface {
    name = 'AddPaymentIntentIdToPurchase1760009178742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "paymentIntentId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "paymentIntentId"`);
    }

}
