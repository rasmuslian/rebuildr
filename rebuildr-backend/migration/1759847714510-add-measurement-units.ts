import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMeasurementUnits1759847714510 implements MigrationInterface {
  name = 'AddMeasurementUnits1759847714510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."measurement_unit_enum" AS ENUM('M', 'DM', 'CM', 'MM', 'KG')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "heightUnit" "public"."measurement_unit_enum" NOT NULL DEFAULT 'MM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "widthUnit" "public"."measurement_unit_enum" NOT NULL DEFAULT 'MM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "lengthUnit" "public"."measurement_unit_enum" NOT NULL DEFAULT 'MM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "thicknessUnit" "public"."measurement_unit_enum" NOT NULL DEFAULT 'MM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "diameterUnit" "public"."measurement_unit_enum" NOT NULL DEFAULT 'MM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "weightUnit" "public"."measurement_unit_enum" NOT NULL DEFAULT 'KG'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "weightUnit"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "diameterUnit"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "thicknessUnit"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "lengthUnit"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "widthUnit"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "heightUnit"`);
    await queryRunner.query(`DROP TYPE "public"."measurement_unit_enum"`);
  }
}
