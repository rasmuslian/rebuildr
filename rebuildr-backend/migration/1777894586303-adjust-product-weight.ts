import { MigrationInterface, QueryRunner } from "typeorm";

export class AdjustProductWeight1777894586303 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        UPDATE product p
  SET "co2Saving" = p."co2Saving" / (
    COALESCE(p."primaryQuantity", 0) + COALESCE((
      SELECT SUM(pur."purchasedQuantity")
      FROM purchase pur
      WHERE pur."productId" = p.id
        AND pur."failedAt" IS NULL
    ), 0)
  )
  WHERE p."soldByQuantity" = true
    AND p."co2Saving" IS NOT NULL
    AND (
      COALESCE(p."primaryQuantity", 0) + COALESCE((
        SELECT SUM(pur."purchasedQuantity")
        FROM purchase pur
        WHERE pur."productId" = p.id
          AND pur."failedAt" IS NULL
      ), 0)
    ) > 0;
        `)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
