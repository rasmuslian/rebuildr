import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationAndInventory1782325972315
  implements MigrationInterface
{
  name = 'AddOrganizationAndInventory1782325972315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- enum types (dedicated to the internlager domain) ---
    await queryRunner.query(
      `CREATE TYPE "public"."organization_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_import_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_item_status_enum" AS ENUM('DRAFT_AI', 'REVIEWED', 'AVAILABLE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_availability_enum" AS ENUM('AVAILABLE', 'UPCOMING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_condition_enum" AS ENUM('NEW', 'VERY_GOOD', 'GOOD', 'OKAY', 'BAD')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_quantity_unit_enum" AS ENUM('AMOUNT', 'BAGS', 'ROLLS', 'M', 'M2', 'M3', 'LITERS', 'CANS', 'PLATES', 'PACKAGES', 'BOARDS', 'KG')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_measurement_unit_enum" AS ENUM('M', 'DM', 'CM', 'MM', 'KG')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_color_type_enum" AS ENUM('NCS', 'FREE_TEXT')`,
    );

    // --- organization ---
    await queryRunner.query(
      `CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "organizationNumber" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_organization" PRIMARY KEY ("id"))`,
    );

    // --- organization_membership ---
    await queryRunner.query(
      `CREATE TABLE "organization_membership" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "userId" uuid NOT NULL, "role" "public"."organization_role_enum" NOT NULL DEFAULT 'MEMBER', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_organization_membership" PRIMARY KEY ("id"), CONSTRAINT "UQ_organization_membership_org_user" UNIQUE ("organizationId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_org_membership_organization" ON "organization_membership" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_org_membership_user" ON "organization_membership" ("userId")`,
    );

    // --- inventory_import ---
    await queryRunner.query(
      `CREATE TABLE "inventory_import" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "uploadedByUserId" uuid, "status" "public"."inventory_import_status_enum" NOT NULL DEFAULT 'PENDING', "error" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_inventory_import" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_import_organization" ON "inventory_import" ("organizationId")`,
    );

    // --- inventory_item ---
    await queryRunner.query(
      `CREATE TABLE "inventory_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "importId" uuid, "status" "public"."inventory_item_status_enum" NOT NULL DEFAULT 'DRAFT_AI', "availability" "public"."inventory_availability_enum" NOT NULL DEFAULT 'AVAILABLE', "estimatedAvailableAt" TIMESTAMP WITH TIME ZONE, "title" character varying, "description" character varying, "additionalInfo" character varying, "categoryId" uuid, "brandId" uuid, "condition" "public"."inventory_condition_enum" NOT NULL DEFAULT 'GOOD', "primaryQuantity" integer, "primaryUnit" "public"."inventory_quantity_unit_enum", "secondaryQuantity" integer, "secondaryUnit" "public"."inventory_quantity_unit_enum", "height" integer, "width" integer, "length" integer, "thickness" integer, "diameter" integer, "weight" integer, "measurementUnit" "public"."inventory_measurement_unit_enum" NOT NULL DEFAULT 'MM', "color" character varying, "colorType" "public"."inventory_color_type_enum" NOT NULL DEFAULT 'FREE_TEXT', "priceEstimateMin" integer, "priceEstimateMax" integer, "co2SavingBuyer" double precision, "co2SavingSeller" double precision, "reviewedByUserId" uuid, "reviewedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_inventory_item" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_item_organization" ON "inventory_item" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_item_import" ON "inventory_item" ("importId")`,
    );

    // --- file relation columns ---
    await queryRunner.query(
      `ALTER TABLE "file" ADD "inventoryImportId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD "inventoryItemImageId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_inventory_import" ON "file" ("inventoryImportId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_inventory_item_image" ON "file" ("inventoryItemImageId")`,
    );

    // --- foreign keys ---
    await queryRunner.query(
      `ALTER TABLE "organization_membership" ADD CONSTRAINT "FK_org_membership_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_membership" ADD CONSTRAINT "FK_org_membership_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_import" ADD CONSTRAINT "FK_inventory_import_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_import" ADD CONSTRAINT "FK_inventory_import_uploaded_by" FOREIGN KEY ("uploadedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_inventory_item_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_inventory_item_import" FOREIGN KEY ("importId") REFERENCES "inventory_import"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_inventory_item_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_inventory_item_brand" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_inventory_item_reviewed_by" FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_file_inventory_import" FOREIGN KEY ("inventoryImportId") REFERENCES "inventory_import"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_file_inventory_item_image" FOREIGN KEY ("inventoryItemImageId") REFERENCES "inventory_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_file_inventory_item_image"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_file_inventory_import"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_inventory_item_reviewed_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_inventory_item_brand"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_inventory_item_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_inventory_item_import"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_inventory_item_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_import" DROP CONSTRAINT "FK_inventory_import_uploaded_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_import" DROP CONSTRAINT "FK_inventory_import_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_membership" DROP CONSTRAINT "FK_org_membership_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_membership" DROP CONSTRAINT "FK_org_membership_organization"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_file_inventory_item_image"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_file_inventory_import"`);
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "inventoryItemImageId"`);
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "inventoryImportId"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_inventory_item_import"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_inventory_item_organization"`,
    );
    await queryRunner.query(`DROP TABLE "inventory_item"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_inventory_import_organization"`,
    );
    await queryRunner.query(`DROP TABLE "inventory_import"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_org_membership_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_org_membership_organization"`,
    );
    await queryRunner.query(`DROP TABLE "organization_membership"`);
    await queryRunner.query(`DROP TABLE "organization"`);

    await queryRunner.query(`DROP TYPE "public"."inventory_color_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."inventory_measurement_unit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."inventory_quantity_unit_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."inventory_condition_enum"`);
    await queryRunner.query(`DROP TYPE "public"."inventory_availability_enum"`);
    await queryRunner.query(`DROP TYPE "public"."inventory_item_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."inventory_import_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."organization_role_enum"`);
  }
}
