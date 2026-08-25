import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyOrganizationMembers1784100000000
  implements MigrationInterface
{
  name = 'SimplifyOrganizationMembers1784100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "organization_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_organization_member_organization_email" UNIQUE ("organizationId", "email"), CONSTRAINT "PK_organization_member" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "organization_member" ADD CONSTRAINT "FK_organization_member_organization" FOREIGN KEY ("organizationId") REFERENCES "user"("id") ON DELETE CASCADE`);

    await queryRunner.query(`ALTER TABLE "product" ADD "createdByOrganizationMemberId" uuid`);
    await queryRunner.query(`ALTER TABLE "product" ADD "createdByOrganizationMemberName" character varying`);
    await queryRunner.query(`ALTER TABLE "product" ADD "createdByOrganizationMemberEmail" character varying`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" ADD "reservedByOrganizationMemberId" uuid`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" ADD "reservedByOrganizationMemberName" character varying`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" ADD "reservedByOrganizationMemberEmail" character varying`);
    await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" ADD "organizationMemberId" uuid`);
    await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_created_by_organization_member" FOREIGN KEY ("createdByOrganizationMemberId") REFERENCES "organization_member"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" ADD CONSTRAINT "FK_internal_ad_reservation_organization_member" FOREIGN KEY ("reservedByOrganizationMemberId") REFERENCES "organization_member"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" ADD CONSTRAINT "FK_internal_ad_import_batch_organization_member" FOREIGN KEY ("organizationMemberId") REFERENCES "organization_member"("id") ON DELETE SET NULL`);

    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "FK_product_created_by_user"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP CONSTRAINT IF EXISTS "FK_internal_ad_reservation_user"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" DROP CONSTRAINT IF EXISTS "FK_internal_ad_import_batch_created_by"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "createdByUserId"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP COLUMN IF EXISTS "reservedByUserId"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" DROP COLUMN IF EXISTS "createdByUserId"`);

    await queryRunner.query(`ALTER TABLE "organization_invite" DROP CONSTRAINT IF EXISTS "FK_organization_invite_accepted_by"`);
    await queryRunner.query(`ALTER TABLE "organization_invite" DROP CONSTRAINT IF EXISTS "FK_organization_invite_invited_by"`);
    await queryRunner.query(`ALTER TABLE "organization_invite" DROP CONSTRAINT IF EXISTS "FK_organization_invite_organization"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organization_invite"`);
    await queryRunner.query(`ALTER TABLE "organization_membership" DROP CONSTRAINT IF EXISTS "FK_organization_membership_user"`);
    await queryRunner.query(`ALTER TABLE "organization_membership" DROP CONSTRAINT IF EXISTS "FK_organization_membership_organization"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organization_membership"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "organization_invite_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "organization_member_role_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" DROP CONSTRAINT IF EXISTS "FK_internal_ad_import_batch_organization_member"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "FK_product_created_by_organization_member"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP CONSTRAINT IF EXISTS "FK_internal_ad_reservation_organization_member"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" DROP COLUMN IF EXISTS "organizationMemberId"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP COLUMN IF EXISTS "reservedByOrganizationMemberEmail"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP COLUMN IF EXISTS "reservedByOrganizationMemberName"`);
    await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP COLUMN IF EXISTS "reservedByOrganizationMemberId"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "createdByOrganizationMemberEmail"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "createdByOrganizationMemberName"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "createdByOrganizationMemberId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organization_member"`);
  }
}
