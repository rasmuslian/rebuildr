import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQrCodeToPurchase1750243026051 implements MigrationInterface {
    name = 'AddQrCodeToPurchase1750243026051'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "qrCodeUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "qrCodeUrl"`);
    }

}
