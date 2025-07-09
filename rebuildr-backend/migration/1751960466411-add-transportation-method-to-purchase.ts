import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransportationMethodToPurchase1751960466411
  implements MigrationInterface
{
  name = 'AddTransportationMethodToPurchase1751960466411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_transportationmethod_enum" AS ENUM('PICKUP', 'SHIPPING', 'DELIVERY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD "transportationMethod" "public"."purchase_transportationmethod_enum" DEFAULT 'PICKUP'`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ALTER COLUMN "transportationMethod" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ALTER COLUMN "transportationMethod" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP COLUMN "transportationMethod"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."purchase_transportationmethod_enum"`,
    );
  }
}
