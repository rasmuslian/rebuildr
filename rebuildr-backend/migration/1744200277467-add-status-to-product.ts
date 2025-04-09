import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToProduct1744200277467 implements MigrationInterface {
    name = 'AddStatusToProduct1744200277467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_status_enum" AS ENUM('DRAFT', 'PUBLISHED')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "status" "public"."product_status_enum" NOT NULL DEFAULT 'DRAFT'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
    }

}
