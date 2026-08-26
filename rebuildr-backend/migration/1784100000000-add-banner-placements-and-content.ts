import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBannerPlacementsAndContent1784100000000
  implements MigrationInterface
{
  name = 'AddBannerPlacementsAndContent1784100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "banner_placements_enum" AS ENUM ('STANDARD', 'END', 'PRODUCT_INLINE')
    `);
    await queryRunner.query(`
      ALTER TABLE "banner"
      ALTER COLUMN "label" DROP NOT NULL,
      ADD "placements" "banner_placements_enum" array NOT NULL DEFAULT ARRAY['STANDARD']::"banner_placements_enum"[],
      ADD "ctaText" character varying,
      ADD "logoId" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "banner"
      ADD CONSTRAINT "FK_banner_logo" FOREIGN KEY ("logoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "banner" DROP CONSTRAINT "FK_banner_logo"`);
    await queryRunner.query(`UPDATE "banner" SET "label" = '' WHERE "label" IS NULL`);
    await queryRunner.query(`
      ALTER TABLE "banner"
      ALTER COLUMN "label" SET NOT NULL,
      DROP COLUMN "logoId",
      DROP COLUMN "ctaText",
      DROP COLUMN "placements"
    `);
    await queryRunner.query(`DROP TYPE "banner_placements_enum"`);
  }
}
