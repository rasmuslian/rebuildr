import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticleIsInternal1783000000001 implements MigrationInterface {
  name = 'AddArticleIsInternal1783000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" ADD "isInternal" boolean NOT NULL DEFAULT false`,
    );
    // One-time data fix: flag the existing internal/in-app CMS entries so the
    // sitemap generator can rely on the column instead of slug conventions.
    await queryRunner.query(
      `UPDATE "article" SET "isInternal" = true
       WHERE "slug" LIKE 'bottom-sheet-%'
          OR "slug" LIKE 'gamla-%'
          OR "slug" LIKE 'automatiserade-meddelanden%'
          OR "slug" LIKE 'testar-%'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "isInternal"`);
  }
}
