import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversation1777016963973 implements MigrationInterface {
    name = 'AddConversation1777016963973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_9d91cdd8a0ee3dd7798d4aaee1c"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_e5cbcb258fc22359b1e5afd4300"`);
        await queryRunner.query(`CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "buyerId" uuid NOT NULL, "sellerReadAt" TIMESTAMP WITH TIME ZONE, "buyerReadAt" TIMESTAMP WITH TIME ZONE, "productId" uuid NOT NULL, "purchaseId" uuid, CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);

        // One conversation per purchase, restricted to purchases that have messaging activity.
        await queryRunner.query(`
            INSERT INTO "conversation" ("id", "createdAt", "buyerId", "productId", "purchaseId")
            SELECT
                uuid_generate_v4(),
                pu."createdAt",
                pu."buyerId",
                pu."productId",
                pu.id
            FROM "purchase" pu
            WHERE EXISTS (
                SELECT 1 FROM "message" m
                JOIN "product" p ON p.id = m."productId"
                WHERE m."productId" = pu."productId"
                  AND (m."senderId" = pu."buyerId" OR m."receiverId" = pu."buyerId")
                  AND (m."senderId" = p."sellerId" OR m."receiverId" = p."sellerId")
            )
        `);

        // Pre-purchase conversations for buyer+product pairs that have messages
        // before the first purchase, or no purchase at all.
        await queryRunner.query(`
            INSERT INTO "conversation" ("id", "createdAt", "buyerId", "productId", "purchaseId")
            SELECT
                uuid_generate_v4(),
                groups."firstMessageAt",
                groups."buyerId",
                groups."productId",
                NULL
            FROM (
                SELECT
                    m."productId",
                    CASE WHEN m."senderId" = p."sellerId" THEN m."receiverId" ELSE m."senderId" END AS "buyerId",
                    MIN(m."createdAt") AS "firstMessageAt"
                FROM "message" m
                JOIN "product" p ON p.id = m."productId"
                GROUP BY
                    m."productId",
                    CASE WHEN m."senderId" = p."sellerId" THEN m."receiverId" ELSE m."senderId" END
            ) groups
            WHERE groups."firstMessageAt" < (
                SELECT MIN(pu."createdAt")
                FROM "purchase" pu
                WHERE pu."productId" = groups."productId"
                  AND pu."buyerId" = groups."buyerId"
            )
            OR NOT EXISTS (
                SELECT 1 FROM "purchase" pu
                WHERE pu."productId" = groups."productId"
                  AND pu."buyerId" = groups."buyerId"
            )
        `);

        // Add conversationId as nullable first so we can populate it before adding the NOT NULL constraint.
        await queryRunner.query(`ALTER TABLE "message" ADD "conversationId" uuid`);

        // Assign each message to the latest conversation for that buyer+product
        // that was created on or before the message.
        await queryRunner.query(`
            UPDATE "message" m
            SET "conversationId" = (
                SELECT c.id
                FROM "conversation" c
                JOIN "product" p ON p.id = c."productId"
                WHERE c."productId" = m."productId"
                  AND (
                    (m."senderId" = p."sellerId" AND m."receiverId" = c."buyerId")
                    OR (m."receiverId" = p."sellerId" AND m."senderId" = c."buyerId")
                  )
                  AND c."createdAt" <= m."createdAt"
                ORDER BY c."createdAt" DESC
                LIMIT 1
            )
        `);

        //Remove any conversations which has no messages
        await queryRunner.query(`
          with empty_conv as (select c.id as "conversationId", c."createdAt", c."purchaseId", count(m.id) as messages from conversation c
            LEFT join message m ON m."conversationId" = c.id
            GROUP BY c.id
            HAVING count(m.id) = 0)
            DELETE from conversation
            WHERE id in (SELECT "conversationId" from empty_conv);
          `)

        //Mark all conversations as read
        await queryRunner.query(`
          UPDATE conversation c
            SET "buyerReadAt" = NOW(), "sellerReadAt" = NOW();
          `)

        // Delete messages that could not be matched to a conversation (neither participant is the product seller).
        await queryRunner.query(`
            DELETE FROM "message"
            WHERE "conversationId" IS NULL
        `);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "conversationId" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "senderId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "receiverId" DROP NOT NULL`);
        
        //ProductId  will be deleted, however we keep it to be removed in a later migration in case we have to rollback
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "productId" DROP NOT NULL`);

        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_4ca3d8a73b4ef8519ff4c3de8a7" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_85c39e2d694cd46df2c78576072" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_24bac3de0774d3ca7f620b10496" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async down(queryRunner: QueryRunner): Promise<void> {}

}
