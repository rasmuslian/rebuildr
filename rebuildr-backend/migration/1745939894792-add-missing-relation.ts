import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingRelation1745939894792 implements MigrationInterface {
    name = 'AddMissingRelation1745939894792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_shipping_prices_shipping_price" ("product_id" uuid NOT NULL, "shipping_price_id" uuid NOT NULL, CONSTRAINT "PK_240420e6744b5e818c412711a19" PRIMARY KEY ("product_id", "shipping_price_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a76e45317cf597ca607d6113bc" ON "product_shipping_prices_shipping_price" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8b5fba7aa2d84a7c98b71668d" ON "product_shipping_prices_shipping_price" ("shipping_price_id") `);
        await queryRunner.query(`ALTER TABLE "product_shipping_prices_shipping_price" ADD CONSTRAINT "FK_a76e45317cf597ca607d6113bc5" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_shipping_prices_shipping_price" ADD CONSTRAINT "FK_a8b5fba7aa2d84a7c98b71668d7" FOREIGN KEY ("shipping_price_id") REFERENCES "shipping_price"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_shipping_prices_shipping_price" DROP CONSTRAINT "FK_a8b5fba7aa2d84a7c98b71668d7"`);
        await queryRunner.query(`ALTER TABLE "product_shipping_prices_shipping_price" DROP CONSTRAINT "FK_a76e45317cf597ca607d6113bc5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8b5fba7aa2d84a7c98b71668d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a76e45317cf597ca607d6113bc"`);
        await queryRunner.query(`DROP TABLE "product_shipping_prices_shipping_price"`);
    }

}
