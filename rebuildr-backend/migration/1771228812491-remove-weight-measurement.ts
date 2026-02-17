import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveWeightMeasurement1771228812491 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      UPDATE category
        SET "measurements" = array_remove(
          "measurements",
          'WEIGHT'::measurement_type_enum
        )
        WHERE 'WEIGHT' = ANY("measurements");
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      UPDATE category
        SET "measurements" = array_append(
          "measurements",
          'WEIGHT'::measurement_type_enum
        )
        WHERE NOT ('WEIGHT' = ANY("measurements"));
      `,
    );
  }
}
