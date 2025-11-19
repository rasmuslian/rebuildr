import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApproximateLocationToProduct1763562654067 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "approximateLocation" geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "approximateAddress" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_product_approximateLocation" ON "product" USING GIST ("approximateLocation")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_product_approximateLocation"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "approximateLocation"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "approximateAddress"`);
    }
}
