import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillInternalAdCo2Savings1784400000000
  implements MigrationInterface
{
  name = 'BackfillInternalAdCo2Savings1784400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "product" product
      SET
        "co2SavingBuyer" = product.weight * factor."productionCoefficient",
        "co2SavingSeller" = product.weight * factor."disposalCoefficient"
      FROM "category" category
      INNER JOIN "co2_factor" factor ON factor.id = category."co2FactorId"
      WHERE product."categoryId" = category.id
        AND product.visibility = 'INTERNAL'
        AND product.weight IS NOT NULL
    `);
    await queryRunner.query(`
      INSERT INTO "internal_ad_reservation" (
        "productId",
        quantity,
        "weightAtSale",
        "co2SavingBuyerAtSale",
        "co2SavingSellerAtSale",
        "marketValueAtSale",
        "soldAt"
      )
      SELECT
        product.id,
        CASE
          WHEN product."soldByQuantity" = TRUE
            THEN product."primaryQuantity"
          ELSE NULL
        END,
        product.weight,
        product."co2SavingBuyer",
        product."co2SavingSeller",
        CASE
          WHEN product."priceSuggestionMin" IS NOT NULL
            AND product."priceSuggestionMax" IS NOT NULL
            THEN ROUND(
              (product."priceSuggestionMin" + product."priceSuggestionMax")
              / 2.0 * 100
            )
          WHEN product."publicPriceConfirmed" = TRUE THEN product.price
          ELSE 0
        END,
        product."updatedAt"
      FROM "product" product
      WHERE product.visibility = 'INTERNAL'
        AND product.status = 'SOLD'
        AND NOT EXISTS (
          SELECT 1
          FROM "internal_ad_reservation" reservation
          WHERE reservation."productId" = product.id
            AND reservation."soldAt" IS NOT NULL
            AND reservation."canceledAt" IS NULL
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "purchase" purchase
          WHERE purchase."productId" = product.id
            AND purchase."paymentAcceptedAt" IS NOT NULL
            AND purchase."failedAt" IS NULL
        )
    `);
  }

  public async down(): Promise<void> {}
}
