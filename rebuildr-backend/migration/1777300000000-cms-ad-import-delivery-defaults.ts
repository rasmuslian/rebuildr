import { MigrationInterface, QueryRunner } from 'typeorm';

export class CmsAdImportDeliveryDefaults1777300000000
  implements MigrationInterface
{
  name = 'CmsAdImportDeliveryDefaults1777300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" ADD "defaultPickupEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" ADD "defaultDeliveryEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" ADD "defaultDeliveryRadius" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" ADD "defaultDeliveryPrice" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" ADD "defaultShippingPriceId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" ADD CONSTRAINT "FK_cms_ad_import_batch_shipping_price" FOREIGN KEY ("defaultShippingPriceId") REFERENCES "shipping_price"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" DROP CONSTRAINT "FK_cms_ad_import_batch_shipping_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" DROP COLUMN "defaultShippingPriceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" DROP COLUMN "defaultDeliveryPrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" DROP COLUMN "defaultDeliveryRadius"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" DROP COLUMN "defaultDeliveryEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cms_ad_import_batch" DROP COLUMN "defaultPickupEnabled"`,
    );
  }
}
