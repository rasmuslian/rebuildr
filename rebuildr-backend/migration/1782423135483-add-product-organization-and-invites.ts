import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductOrganizationAndInvites1782423135483
  implements MigrationInterface
{
  name = 'AddProductOrganizationAndInvites1782423135483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- product.organizationId ---
    await queryRunner.query(`ALTER TABLE "product" ADD "organizationId" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_organization" ON "product" ("organizationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // --- organization_invite ---
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invite_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REVOKED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "email" character varying NOT NULL, "role" "public"."organization_role_enum" NOT NULL DEFAULT 'MEMBER', "status" "public"."organization_invite_status_enum" NOT NULL DEFAULT 'PENDING', "token" character varying NOT NULL, "invitedByUserId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "acceptedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_organization_invite" PRIMARY KEY ("id"), CONSTRAINT "UQ_organization_invite_token" UNIQUE ("token"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organization_invite_organization" ON "organization_invite" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organization_invite_email" ON "organization_invite" ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invite" ADD CONSTRAINT "FK_organization_invite_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invite" DROP CONSTRAINT "FK_organization_invite_organization"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_organization_invite_email"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_organization_invite_organization"`,
    );
    await queryRunner.query(`DROP TABLE "organization_invite"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_invite_status_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_organization"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_product_organization"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "organizationId"`);
  }
}
