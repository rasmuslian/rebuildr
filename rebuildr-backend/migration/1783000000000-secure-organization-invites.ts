import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecureOrganizationInvites1783000000000
  implements MigrationInterface
{
  name = 'SecureOrganizationInvites1783000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await queryRunner.query(
      'ALTER TABLE "organization_invite" ADD "tokenHash" character varying',
    );
    await queryRunner.query(
      'UPDATE "organization_invite" SET "tokenHash" = encode(digest("token", \'sha256\'), \'hex\')',
    );
    await queryRunner.query(
      'ALTER TABLE "organization_invite" ALTER COLUMN "tokenHash" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "organization_invite" ADD CONSTRAINT "UQ_organization_invite_token_hash" UNIQUE ("tokenHash")',
    );
    await queryRunner.query(
      'ALTER TABLE "organization_invite" ADD "expiresAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'UPDATE "organization_invite" SET "expiresAt" = "createdAt" + interval \'7 days\'',
    );
    await queryRunner.query(
      'ALTER TABLE "organization_invite" ALTER COLUMN "expiresAt" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "organization_invite" DROP CONSTRAINT "UQ_organization_invite_token"',
    );
    await queryRunner.query('ALTER TABLE "organization_invite" DROP COLUMN "token"');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_organization_invite_pending_email" ON "organization_invite" ("organizationId", "email") WHERE status = \'PENDING\'',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_organization_invite_pending_email"');
    await queryRunner.query('ALTER TABLE "organization_invite" ADD "token" character varying');
    await queryRunner.query('ALTER TABLE "organization_invite" DROP CONSTRAINT "UQ_organization_invite_token_hash"');
    await queryRunner.query('ALTER TABLE "organization_invite" DROP COLUMN "tokenHash"');
    await queryRunner.query('ALTER TABLE "organization_invite" DROP COLUMN "expiresAt"');
  }
}
