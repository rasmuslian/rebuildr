import { MigrationInterface, QueryRunner } from 'typeorm';

export class CmsAdImportDefaultAddress1777200000000
  implements MigrationInterface
{
  name = 'CmsAdImportDefaultAddress1777200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" ADD "defaultAddress" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" DROP COLUMN "defaultAddress"`,
    );
  }
}
