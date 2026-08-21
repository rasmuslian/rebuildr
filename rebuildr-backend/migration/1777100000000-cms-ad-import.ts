import { MigrationInterface, QueryRunner } from 'typeorm';

export class CmsAdImport1777100000000 implements MigrationInterface {
  name = 'CmsAdImport1777100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."cms_ad_import_batch_status_enum" AS ENUM('UPLOADING', 'QUEUED', 'PROCESSING', 'READY', 'FAILED', 'PUBLISHED')`);
    await queryRunner.query(`CREATE TABLE "cms_ad_import_batch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sellerId" uuid NOT NULL, "createdByUserId" uuid NOT NULL, "status" "public"."cms_ad_import_batch_status_enum" NOT NULL DEFAULT 'UPLOADING', "progress" integer NOT NULL DEFAULT 0, "errorMessage" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cms_ad_import_batch" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "cms_ad_import_batch_files_file" ("cmsAdImportBatchId" uuid NOT NULL, "fileId" uuid NOT NULL, CONSTRAINT "PK_cms_ad_import_batch_files_file" PRIMARY KEY ("cmsAdImportBatchId", "fileId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_cms_ad_import_batch_files_batch" ON "cms_ad_import_batch_files_file" ("cmsAdImportBatchId")`);
    await queryRunner.query(`CREATE INDEX "IDX_cms_ad_import_batch_files_file" ON "cms_ad_import_batch_files_file" ("fileId")`);
    await queryRunner.query(`ALTER TABLE "product" ADD "cmsAdImportBatchId" uuid`);
    await queryRunner.query(`ALTER TABLE "product" ADD "cmsImportValidationIssues" text array NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch" ADD CONSTRAINT "FK_cms_ad_import_batch_seller" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch" ADD CONSTRAINT "FK_cms_ad_import_batch_created_by" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch_files_file" ADD CONSTRAINT "FK_cms_ad_import_batch_files_batch" FOREIGN KEY ("cmsAdImportBatchId") REFERENCES "cms_ad_import_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch_files_file" ADD CONSTRAINT "FK_cms_ad_import_batch_files_file" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_cms_ad_import_batch" FOREIGN KEY ("cmsAdImportBatchId") REFERENCES "cms_ad_import_batch"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_cms_ad_import_batch"`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch_files_file" DROP CONSTRAINT "FK_cms_ad_import_batch_files_file"`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch_files_file" DROP CONSTRAINT "FK_cms_ad_import_batch_files_batch"`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch" DROP CONSTRAINT "FK_cms_ad_import_batch_created_by"`);
    await queryRunner.query(`ALTER TABLE "cms_ad_import_batch" DROP CONSTRAINT "FK_cms_ad_import_batch_seller"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "cmsImportValidationIssues"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "cmsAdImportBatchId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cms_ad_import_batch_files_file"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cms_ad_import_batch_files_batch"`);
    await queryRunner.query(`DROP TABLE "cms_ad_import_batch_files_file"`);
    await queryRunner.query(`DROP TABLE "cms_ad_import_batch"`);
    await queryRunner.query(`DROP TYPE "public"."cms_ad_import_batch_status_enum"`);
  }
}
