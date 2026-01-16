import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMeasurementTypeCategory1768555577600
  implements MigrationInterface
{
  name = 'AddMeasurementTypeCategory1768555577600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."measurement_type_enum" AS ENUM('THICKNESS', 'HEIGHT', 'WIDTH', 'LENGTH', 'DIAMETER', 'WEIGHT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD "measurements" "public"."measurement_type_enum" array NOT NULL DEFAULT '{}'`,
    );

    await queryRunner.query(
      `
      UPDATE category
        SET "measurements" = ARRAY['THICKNESS', 'HEIGHT', 'WIDTH', 'LENGTH', 'DIAMETER', 'WEIGHT']::measurement_type_enum[]
        WHERE "parentId" IS NOT NULL;
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category" DROP COLUMN "measurements"`,
    );
    await queryRunner.query(`DROP TYPE "public"."measurement_type_enum"`);
  }
}
