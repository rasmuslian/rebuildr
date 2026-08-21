import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInternalProjects1782900000000 implements MigrationInterface {
  name = 'AddInternalProjects1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" ADD "internalOrganizationId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_project_internal_organization" ON "project" ("internalOrganizationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_project_internal_organization" FOREIGN KEY ("internalOrganizationId") REFERENCES "user"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_project_internal_organization"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_project_internal_organization"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "internalOrganizationId"`);
  }
}
