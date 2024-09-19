import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIconToCategory1726750290061 implements MigrationInterface {
  name = 'AddIconToCategory1726750290061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."category_icon_enum" AS ENUM('MATERIAL', 'WOOD', 'DOOR', 'WINDOW', 'FLOOR', 'INTERIOR', 'PAINT', 'FASTENERS', 'ROOF', 'TILES', 'KITCHEN_BATHROOM', 'ELECTRICAL', 'OUTDOORS', 'TOOLS', 'WORKPLACE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD "icon" "public"."category_icon_enum"`,
    );
    await queryRunner.query(`
  UPDATE category
  SET icon = 'MATERIAL'
  WHERE "name" = 'Byggmaterial'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'WOOD'
  WHERE "name" = 'Träprodukter'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'DOOR'
  WHERE "name" = 'Dörrar'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'WINDOW'
  WHERE "name" = 'Fönster'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'FLOOR'
  WHERE "name" = 'Golv'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'INTERIOR'
  WHERE "name" = 'Interiör'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'PAINT'
  WHERE "name" = 'Färg'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'FASTENERS'
  WHERE "name" = 'Fästdon - Spik & skruv m.m'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'ROOF'
  WHERE "name" = 'Tak'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'TILES'
  WHERE "name" = 'Kakel & klinker'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'KITCHEN_BATHROOM'
  WHERE "name" = 'Kök & bad'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'ELECTRICAL'
  WHERE "name" = 'Elinstallation'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'OUTDOORS'
  WHERE "name" = 'Utemiljö'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'TOOLS'
  WHERE "name" = 'Maskiner & Verktyg'
  `);
    await queryRunner.query(`
  UPDATE category
  SET icon = 'WORKPLACE'
  WHERE "name" = 'Arbetsplats'
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "icon"`);
    await queryRunner.query(`DROP TYPE "public"."category_icon_enum"`);
  }
}
