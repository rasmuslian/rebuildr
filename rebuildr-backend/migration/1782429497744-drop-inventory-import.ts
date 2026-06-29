import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Retire the S3-based inventory_import flow. AI import now runs directly from
 * uploaded photos / pasted product lists and creates internal Products — no
 * import job record or S3 upload is involved.
 */
export class DropInventoryImport1782429497744 implements MigrationInterface {
  name = 'DropInventoryImport1782429497744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT IF EXISTS "FK_file_inventory_import"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_file_inventory_import"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP COLUMN IF EXISTS "inventoryImportId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_import"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inventory_import_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_import_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_import" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "uploadedByUserId" uuid, "status" "public"."inventory_import_status_enum" NOT NULL DEFAULT 'PENDING', "error" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_inventory_import" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "file" ADD "inventoryImportId" uuid`);
  }
}
