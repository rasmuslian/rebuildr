import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuantityAndMesurements1744187420270
  implements MigrationInterface
{
  name = 'AddQuantityAndMesurements1744187420270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "volume"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "depth"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "amount"`);
    await queryRunner.query(
      `CREATE TYPE "public"."quantity_unit_enum" AS ENUM('AMOUNT', 'BAGS', 'ROLLS', 'M', 'M2', 'M3', 'LITERS', 'CANS', 'PLATTOR', 'PACKAGES', 'DISCS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD "primary_quantity_unit" "public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD "secondary_quantity_unit" "public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "primary_quantity" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "primary_unit" "public"."quantity_unit_enum" NOT NULL DEFAULT 'AMOUNT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "primary_quantity" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "primary_unit" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "secondary_quantity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "secondary_unit" "public"."quantity_unit_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "product" ADD "length" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "thickness" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "diameter" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "weight" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "weight"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "diameter"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "thickness"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "length"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "secondary_unit"`,
    );
    await queryRunner.query(`DROP TYPE "public"."quantity_unit_enum"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "secondary_quantity"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "primary_unit"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "primary_quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP COLUMN "secondary_quantity_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP COLUMN "primary_quantity_unit"`,
    );
    await queryRunner.query(`ALTER TABLE "product" ADD "amount" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "depth" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "volume" integer`);
  }
}
