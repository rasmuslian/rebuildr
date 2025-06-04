import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixQuantityEnum1748875793493 implements MigrationInterface {
  name = 'FixQuantityEnum1748875793493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."quantity_unit_enum" RENAME TO "quantity_unit_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."quantity_unit_enum" AS ENUM('AMOUNT', 'BAGS', 'ROLLS', 'M', 'M2', 'M3', 'LITERS', 'CANS', 'PLATES', 'PACKAGES', 'BOARDS', 'KG')`,
    );

    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "primaryQuantityUnit" TYPE "public"."quantity_unit_enum" USING "primaryQuantityUnit"::"text"::"public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "secondaryQuantityUnit" TYPE "public"."quantity_unit_enum" USING "secondaryQuantityUnit"::"text"::"public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "primaryUnit" TYPE "public"."quantity_unit_enum" USING "primaryUnit"::"text"::"public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "secondaryUnit" TYPE "public"."quantity_unit_enum" USING "secondaryUnit"::"text"::"public"."quantity_unit_enum"`,
    );

    await queryRunner.query(`DROP TYPE "public"."quantity_unit_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."quantity_unit_enum" RENAME TO "quantity_unit_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."quantity_unit_enum" AS ENUM('AMOUNT', 'BAGS', 'ROLLS', 'M', 'M2', 'M3', 'LITERS', 'CANS', 'PLATTOR', 'PACKAGES', 'DISCS', 'KG')`,
    );

    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "primaryQuantityUnit" TYPE "public"."quantity_unit_enum" USING "primaryQuantityUnit"::"text"::"public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "secondaryQuantityUnit" TYPE "public"."quantity_unit_enum" USING "secondaryQuantityUnit"::"text"::"public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "primaryUnit" TYPE "public"."quantity_unit_enum" USING "primaryUnit"::"text"::"public"."quantity_unit_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "secondaryUnit" TYPE "public"."quantity_unit_enum" USING "secondaryUnit"::"text"::"public"."quantity_unit_enum"`,
    );

    await queryRunner.query(`DROP TYPE "public"."quantity_unit_enum_old"`);
  }
}
