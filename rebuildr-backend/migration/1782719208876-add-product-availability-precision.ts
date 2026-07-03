import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductAvailabilityPrecision1782719208876
  implements MigrationInterface
{
  name = 'AddProductAvailabilityPrecision1782719208876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_availability_precision_enum" AS ENUM('EXACT', 'MONTH', 'QUARTER', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "availabilityPrecision" "public"."product_availability_precision_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "availabilityPrecision"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."product_availability_precision_enum"`,
    );
  }
}
