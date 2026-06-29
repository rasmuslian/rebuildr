import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Retire the standalone InventoryItem store. The internal inventory is now
 * represented by Product (visibility=INTERNAL), so this table and its enums are
 * no longer used. The inventory_import table (upload jobs) is kept.
 */
export class DropInventoryItem1782426993420 implements MigrationInterface {
  name = 'DropInventoryItem1782426993420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT IF EXISTS "FK_file_inventory_item_image"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_file_inventory_item_image"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP COLUMN IF EXISTS "inventoryItemImageId"`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_item"`);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inventory_item_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inventory_availability_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inventory_condition_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inventory_quantity_unit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inventory_measurement_unit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inventory_color_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the enums and table as they were (see
    // 1782325972315-add-organization-and-inventory).
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
    await queryRunner.query(
      `CREATE TABLE "inventory_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "importId" uuid, "status" "public"."inventory_item_status_enum" NOT NULL DEFAULT 'DRAFT_AI', "availability" "public"."inventory_availability_enum" NOT NULL DEFAULT 'AVAILABLE', "estimatedAvailableAt" TIMESTAMP WITH TIME ZONE, "title" character varying, "description" character varying, "additionalInfo" character varying, "categoryId" uuid, "brandId" uuid, "condition" "public"."inventory_condition_enum" NOT NULL DEFAULT 'GOOD', "primaryQuantity" integer, "primaryUnit" "public"."inventory_quantity_unit_enum", "secondaryQuantity" integer, "secondaryUnit" "public"."inventory_quantity_unit_enum", "height" integer, "width" integer, "length" integer, "thickness" integer, "diameter" integer, "weight" integer, "measurementUnit" "public"."inventory_measurement_unit_enum" NOT NULL DEFAULT 'MM', "color" character varying, "colorType" "public"."inventory_color_type_enum" NOT NULL DEFAULT 'FREE_TEXT', "priceEstimateMin" integer, "priceEstimateMax" integer, "co2SavingBuyer" double precision, "co2SavingSeller" double precision, "reviewedByUserId" uuid, "reviewedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_inventory_item" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "file" ADD "inventoryItemImageId" uuid`);
  }
}
