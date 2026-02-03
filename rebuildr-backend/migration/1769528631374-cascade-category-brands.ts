import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeCategoryBrands1769528631374 implements MigrationInterface {
    name = 'CascadeCategoryBrands1769528631374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_bbcbcfd74d7d1046174b3954ddf"`);
        await queryRunner.query(`ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_bbcbcfd74d7d1046174b3954ddf" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_bbcbcfd74d7d1046174b3954ddf"`);
        await queryRunner.query(`ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_bbcbcfd74d7d1046174b3954ddf" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
