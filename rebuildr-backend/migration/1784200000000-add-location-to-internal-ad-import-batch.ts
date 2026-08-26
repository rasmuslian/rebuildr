import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationToInternalAdImportBatch1784200000000
  implements MigrationInterface
{
  name = 'AddLocationToInternalAdImportBatch1784200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" ADD "projectId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" ADD "address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" ADD "addressLocation" geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" ADD CONSTRAINT "FK_internal_ad_import_batch_project" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" DROP CONSTRAINT "FK_internal_ad_import_batch_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" DROP COLUMN "addressLocation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" DROP COLUMN "address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_import_batch" DROP COLUMN "projectId"`,
    );
  }
}
