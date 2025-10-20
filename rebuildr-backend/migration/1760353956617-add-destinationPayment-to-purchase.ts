import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDestinationPaymentToPurchase1760353956617 implements MigrationInterface {
    name = 'AddDestinationPaymentToPurchase1760353956617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "destinationPaymentId" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."destinationPaymentId" IS 'payment id on seller''s side'`);
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."paymentIntentId" IS 'payment id on buyer''s side'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."paymentIntentId" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."destinationPaymentId" IS 'payment id on seller''s side'`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "destinationPaymentId"`);
    }

}
