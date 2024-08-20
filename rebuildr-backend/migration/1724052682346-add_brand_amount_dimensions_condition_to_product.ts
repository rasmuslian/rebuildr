import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBrandAmountDimensionsConditionToProduct1724052682346
  implements MigrationInterface
{
  name = 'AddBrandAmountDimensionsConditionToProduct1724052682346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "brand" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "product" ADD "amount" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "height" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "width" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "depth" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "volume" integer`);
    await queryRunner.query(
      `CREATE TYPE "public"."product_condition_enum" AS ENUM('NEW', 'VERY_GOOD', 'GOOD', 'OKAY', 'BAD')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "condition" "public"."product_condition_enum" NOT NULL DEFAULT 'OKAY'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "condition" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "condition"`);
    await queryRunner.query(`DROP TYPE "public"."product_condition_enum"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "volume"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "depth"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "width"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "height"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "amount"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brand"`);
  }
}
