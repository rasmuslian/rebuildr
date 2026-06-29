import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductVisibility1782413829293 implements MigrationInterface {
  name = 'AddProductVisibility1782413829293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_visibility_enum" AS ENUM('PUBLIC', 'INTERNAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "visibility" "public"."product_visibility_enum" NOT NULL DEFAULT 'PUBLIC'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_visibility" ON "product" ("visibility")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_product_visibility"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "visibility"`);
    await queryRunner.query(`DROP TYPE "public"."product_visibility_enum"`);
  }
}
