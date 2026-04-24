import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillPurchaseIdOnMessage1777300000000 implements MigrationInterface {
    name = 'BackfillPurchaseIdOnMessage1777300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "message" m
            SET "purchaseId" = (
                SELECT p.id
                FROM "purchase" p
                WHERE p."productId" = m."productId"
                  AND (p."buyerId" = m."senderId" OR p."buyerId" = m."receiverId")
                ORDER BY p."createdAt" DESC
                LIMIT 1
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "message" SET "purchaseId" = NULL`);
    }

}
