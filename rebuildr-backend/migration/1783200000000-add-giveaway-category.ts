import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGiveawayCategory1783200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "category_type_enum" AS ENUM ('STANDARD', 'GIVEAWAY')
    `);
    await queryRunner.query(`
      ALTER TABLE "category"
      ADD "categoryType" "category_type_enum" NOT NULL DEFAULT 'STANDARD'
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_category_one_giveaway"
      ON "category" ("categoryType")
      WHERE "categoryType" = 'GIVEAWAY'
    `);
    await queryRunner.query(`
      INSERT INTO "category" ("name", "description", "categoryType", "orderIndex")
      VALUES ('Bortskänkes', 'Produkter som skänks bort.', 'GIVEAWAY', 9999)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "category" WHERE "categoryType" = 'GIVEAWAY'`,
    );
    await queryRunner.query(`DROP INDEX "IDX_category_one_giveaway"`);
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "categoryType"`);
    await queryRunner.query(`DROP TYPE "category_type_enum"`);
  }
}
