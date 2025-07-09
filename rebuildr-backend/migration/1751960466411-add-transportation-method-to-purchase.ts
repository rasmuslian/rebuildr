import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransportationMethodToPurchase1751960466411
  implements MigrationInterface
{
  name = 'AddTransportationMethodToPurchase1751960466411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_tranportationmethod_enum" AS ENUM('PICKUP', 'SHIPPING', 'DELIVERY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD "tranportationMethod" "public"."purchase_tranportationmethod_enum" DEFAULT 'PICKUP'`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ALTER COLUMN "tranportationMethod" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP COLUMN "tranportationMethod"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."purchase_tranportationmethod_enum"`,
    );
  }
}
