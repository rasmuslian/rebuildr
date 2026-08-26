import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBannerLabelOptional1784100000001
  implements MigrationInterface
{
  name = 'MakeBannerLabelOptional1784100000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner" ALTER COLUMN "label" DROP NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "banner" SET "label" = '' WHERE "label" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "banner" ALTER COLUMN "label" SET NOT NULL`,
    );
  }
}
