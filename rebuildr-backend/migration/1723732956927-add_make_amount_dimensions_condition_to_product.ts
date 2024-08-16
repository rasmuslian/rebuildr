import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMakeAmountAndConditionToProduct1723732956927
  implements MigrationInterface
{
  name = 'AddMakeAmountAndConditionToProduct1723732956927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "make" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "amount" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "dimensions" character varying`,
    );
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
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "amount"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "make"`);
  }
}
