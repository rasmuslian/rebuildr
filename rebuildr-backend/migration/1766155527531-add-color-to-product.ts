import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColorToProduct1766155527531 implements MigrationInterface {
    name = 'AddColorToProduct1766155527531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "color" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."product_colortype_enum" AS ENUM('NCS', 'FREE_TEXT')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "colorType" "public"."product_colortype_enum" NOT NULL DEFAULT 'NCS'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "colorType"`);
        await queryRunner.query(`DROP TYPE "public"."product_colortype_enum"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "color"`);
    }

}
