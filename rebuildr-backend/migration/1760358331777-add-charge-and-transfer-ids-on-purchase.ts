import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChargeAndTransferIdsOnPurchase1760358331777 implements MigrationInterface {
    name = 'AddChargeAndTransferIdsOnPurchase1760358331777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "chargeId" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."chargeId" IS 'charge made on payment'`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "transferId" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."transferId" IS 'tranfer regarding payment'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."transferId" IS 'tranfer regarding payment'`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "transferId"`);
        await queryRunner.query(`COMMENT ON COLUMN "purchase"."chargeId" IS 'charge made on payment'`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "chargeId"`);
    }

}
