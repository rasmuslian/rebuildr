import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileHasVariants1783000000000 implements MigrationInterface {
  name = 'AddFileHasVariants1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Defaults to false for all existing rows so the ImageVariantService cron
    // sweep picks up the whole historical backlog (no separate backfill job).
    await queryRunner.query(
      `ALTER TABLE "file" ADD "hasVariants" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "hasVariants"`);
  }
}
