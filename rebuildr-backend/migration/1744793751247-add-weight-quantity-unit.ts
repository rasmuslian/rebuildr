import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeightQuantityUnit1744793751247 implements MigrationInterface {
  name = 'AddWeightQuantityUnit1744793751247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."quantity_unit_enum" ADD VALUE 'KG'`,
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
