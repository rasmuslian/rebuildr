import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBannerForegroundColor1784100000002
  implements MigrationInterface
{
  name = 'AddBannerForegroundColor1784100000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "banner_foreground_color_enum" AS ENUM (
        'LOGO_BACKGROUND',
        'LOGO_VECTOR',
        'WHITE',
        'CHARCOAL'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "banner"
      ADD "foregroundColor" "banner_foreground_color_enum" NOT NULL DEFAULT 'LOGO_BACKGROUND'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "banner" DROP COLUMN "foregroundColor"`);
    await queryRunner.query(`DROP TYPE "banner_foreground_color_enum"`);
  }
}
