import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAterbankenReportingSnapshots1784300000000
  implements MigrationInterface
{
  name = 'AddAterbankenReportingSnapshots1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "initialPrimaryQuantity" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" ADD "weightAtSale" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" ADD "co2SavingBuyerAtSale" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" ADD "co2SavingSellerAtSale" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" ADD "marketValueAtSale" integer`,
    );
    await queryRunner.query(`
      UPDATE "product" product
      SET "initialPrimaryQuantity" = CASE
        WHEN product."soldByQuantity" = TRUE THEN
          COALESCE(product."primaryQuantity", 0)
          + COALESCE((
              SELECT SUM(reservation.quantity)
              FROM "internal_ad_reservation" reservation
              WHERE reservation."productId" = product.id
                AND reservation."soldAt" IS NOT NULL
                AND reservation."canceledAt" IS NULL
            ), 0)
          + COALESCE((
              SELECT SUM(purchase."purchasedQuantity")
              FROM "purchase" purchase
              WHERE purchase."productId" = product.id
                AND purchase."paymentAcceptedAt" IS NOT NULL
                AND purchase."failedAt" IS NULL
            ), 0)
        ELSE COALESCE(product."primaryQuantity", 1)
      END
      WHERE product.visibility = 'INTERNAL'
        AND product.status IN ('PUBLISHED', 'SOLD')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" DROP COLUMN "marketValueAtSale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" DROP COLUMN "co2SavingSellerAtSale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" DROP COLUMN "co2SavingBuyerAtSale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internal_ad_reservation" DROP COLUMN "weightAtSale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "initialPrimaryQuantity"`,
    );
  }
}