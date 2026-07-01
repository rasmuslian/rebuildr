import { MigrationInterface, QueryRunner } from "typeorm";

export class InternalAds1777000000000 implements MigrationInterface {
    name = 'InternalAds1777000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organization_member_role_enum" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`CREATE TYPE "public"."organization_invite_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REVOKED')`);
        await queryRunner.query(`CREATE TYPE "public"."internal_ad_import_batch_status_enum" AS ENUM('UPLOADING', 'QUEUED', 'PROCESSING', 'READY', 'FAILED', 'PUBLISHED')`);
        await queryRunner.query(`CREATE TYPE "public"."product_visibility_enum" AS ENUM('PUBLIC', 'INTERNAL')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "internalAdsAccess" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "product" ADD "visibility" "public"."product_visibility_enum" NOT NULL DEFAULT 'PUBLIC'`);
        await queryRunner.query(`ALTER TABLE "product" ADD "internalOrganizationId" uuid`);
        await queryRunner.query(`ALTER TABLE "product" ADD "createdByUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "product" ADD "internalValidationIssues" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "product" ADD "internalAdImportBatchId" uuid`);
        await queryRunner.query(`CREATE TABLE "organization_membership" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "userId" uuid NOT NULL, "role" "public"."organization_member_role_enum" NOT NULL DEFAULT 'MEMBER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_organization_membership_organization_user" UNIQUE ("organizationId", "userId"), CONSTRAINT "PK_organization_membership" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organization_invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "token" character varying NOT NULL, "organizationId" uuid NOT NULL, "invitedByUserId" uuid NOT NULL, "role" "public"."organization_member_role_enum" NOT NULL DEFAULT 'MEMBER', "status" "public"."organization_invite_status_enum" NOT NULL DEFAULT 'PENDING', "acceptedByUserId" uuid, "acceptedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_organization_invite_token" UNIQUE ("token"), CONSTRAINT "PK_organization_invite" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "internal_ad_reservation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid NOT NULL, "reservedByUserId" uuid NOT NULL, "quantity" integer, "reservedAt" TIMESTAMP NOT NULL DEFAULT now(), "canceledAt" TIMESTAMP, "soldAt" TIMESTAMP, CONSTRAINT "PK_internal_ad_reservation" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "internal_ad_import_batch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "createdByUserId" uuid NOT NULL, "status" "public"."internal_ad_import_batch_status_enum" NOT NULL DEFAULT 'UPLOADING', "progress" integer NOT NULL DEFAULT 0, "errorMessage" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_internal_ad_import_batch" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "internal_ad_import_batch_files_file" ("internalAdImportBatchId" uuid NOT NULL, "fileId" uuid NOT NULL, CONSTRAINT "PK_internal_ad_import_batch_files_file" PRIMARY KEY ("internalAdImportBatchId", "fileId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_internal_ad_import_batch_files_batch" ON "internal_ad_import_batch_files_file" ("internalAdImportBatchId")`);
        await queryRunner.query(`CREATE INDEX "IDX_internal_ad_import_batch_files_file" ON "internal_ad_import_batch_files_file" ("fileId")`);
        await queryRunner.query(`CREATE INDEX "IDX_product_visibility_internal_org" ON "product" ("visibility", "internalOrganizationId")`);
        await queryRunner.query(`ALTER TABLE "organization_membership" ADD CONSTRAINT "FK_organization_membership_organization" FOREIGN KEY ("organizationId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_membership" ADD CONSTRAINT "FK_organization_membership_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_invite" ADD CONSTRAINT "FK_organization_invite_organization" FOREIGN KEY ("organizationId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_invite" ADD CONSTRAINT "FK_organization_invite_invited_by" FOREIGN KEY ("invitedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_invite" ADD CONSTRAINT "FK_organization_invite_accepted_by" FOREIGN KEY ("acceptedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internal_ad_reservation" ADD CONSTRAINT "FK_internal_ad_reservation_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internal_ad_reservation" ADD CONSTRAINT "FK_internal_ad_reservation_user" FOREIGN KEY ("reservedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" ADD CONSTRAINT "FK_internal_ad_import_batch_organization" FOREIGN KEY ("organizationId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" ADD CONSTRAINT "FK_internal_ad_import_batch_created_by" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch_files_file" ADD CONSTRAINT "FK_internal_ad_import_batch_files_batch" FOREIGN KEY ("internalAdImportBatchId") REFERENCES "internal_ad_import_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch_files_file" ADD CONSTRAINT "FK_internal_ad_import_batch_files_file" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_internal_organization" FOREIGN KEY ("internalOrganizationId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_created_by_user" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_internal_ad_import_batch" FOREIGN KEY ("internalAdImportBatchId") REFERENCES "internal_ad_import_batch"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_internal_ad_import_batch"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_created_by_user"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_internal_organization"`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch_files_file" DROP CONSTRAINT "FK_internal_ad_import_batch_files_file"`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch_files_file" DROP CONSTRAINT "FK_internal_ad_import_batch_files_batch"`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" DROP CONSTRAINT "FK_internal_ad_import_batch_created_by"`);
        await queryRunner.query(`ALTER TABLE "internal_ad_import_batch" DROP CONSTRAINT "FK_internal_ad_import_batch_organization"`);
        await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP CONSTRAINT "FK_internal_ad_reservation_user"`);
        await queryRunner.query(`ALTER TABLE "internal_ad_reservation" DROP CONSTRAINT "FK_internal_ad_reservation_product"`);
        await queryRunner.query(`ALTER TABLE "organization_invite" DROP CONSTRAINT "FK_organization_invite_accepted_by"`);
        await queryRunner.query(`ALTER TABLE "organization_invite" DROP CONSTRAINT "FK_organization_invite_invited_by"`);
        await queryRunner.query(`ALTER TABLE "organization_invite" DROP CONSTRAINT "FK_organization_invite_organization"`);
        await queryRunner.query(`ALTER TABLE "organization_membership" DROP CONSTRAINT "FK_organization_membership_user"`);
        await queryRunner.query(`ALTER TABLE "organization_membership" DROP CONSTRAINT "FK_organization_membership_organization"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_visibility_internal_org"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_internal_ad_import_batch_files_file"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_internal_ad_import_batch_files_batch"`);
        await queryRunner.query(`DROP TABLE "internal_ad_import_batch_files_file"`);
        await queryRunner.query(`DROP TABLE "internal_ad_import_batch"`);
        await queryRunner.query(`DROP TABLE "internal_ad_reservation"`);
        await queryRunner.query(`DROP TABLE "organization_invite"`);
        await queryRunner.query(`DROP TABLE "organization_membership"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "internalAdImportBatchId"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "internalValidationIssues"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "createdByUserId"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "internalOrganizationId"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "visibility"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "internalAdsAccess"`);
        await queryRunner.query(`DROP TYPE "public"."product_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."internal_ad_import_batch_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."organization_invite_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."organization_member_role_enum"`);
    }

}
