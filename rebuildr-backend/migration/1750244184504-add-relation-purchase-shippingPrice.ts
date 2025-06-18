import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationPurchaseShippingPrice1750244184504 implements MigrationInterface {
    name = 'AddRelationPurchaseShippingPrice1750244184504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "shippingPriceId" uuid`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_dc6cfe4f6a07655be7c89cf2ead" FOREIGN KEY ("shippingPriceId") REFERENCES "shipping_price"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_dc6cfe4f6a07655be7c89cf2ead"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "shippingPriceId"`);
    }

}
