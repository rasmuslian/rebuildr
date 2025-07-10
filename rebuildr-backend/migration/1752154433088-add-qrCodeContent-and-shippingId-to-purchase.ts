import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQrCodeContentAndShippingIdToPurchase1752154433088 implements MigrationInterface {
    name = 'AddQrCodeContentAndShippingIdToPurchase1752154433088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "shippingId" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "qrCodeContent" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "qrCodeContent"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "shippingId"`);
    }

}
