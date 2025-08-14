import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePaymentSentToPaymentStarted1755155248295 implements MigrationInterface {
    name = 'ChangePaymentSentToPaymentStarted1755155248295'

    public async up(queryRunner: QueryRunner): Promise<void> {
    const dbName = process.env.DB_NAME;

        await queryRunner.query(`ALTER TABLE "purchase" RENAME COLUMN "paymentSentAt" TO "paymentStartedAt"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_status_enum" AS ENUM('CLAIMED', 'PAYMENT_STARTED', 'PAYMENT_ACCEPTED', 'SHIPMENT_BOOKED', 'SHIPMENT_DROPPED_OFF', 'SHIPPING_STARTED', 'SHIPPING_DELIVERED', 'DELIVERED', 'APPROVED', 'PAYOUT_STARTED', 'FINISHED_FAILED', 'FINISHED_SUCCESS', 'PAUSED', 'PAYOUT_FAILED')`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","status",dbName,"public","purchase"]);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "status" "public"."purchase_status_enum" GENERATED ALWAYS AS (
      CASE
        WHEN "failedAt" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum
        WHEN "payoutReceivedAt" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum
        WHEN "payoutFailedAt" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum
        WHEN "payoutStartedAt" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum
        WHEN "approvedAt" IS NOT NULL THEN 'APPROVED'::purchase_status_enum
        WHEN "pausedAt" IS NOT NULL THEN 'PAUSED'::purchase_status_enum
        WHEN "deliveredAt" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum
        WHEN "shipmentDeliveredAt" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum
        WHEN "shipmentStartedAt" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum
        WHEN "shipmentDroppedOffAt" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum
        WHEN "shipmentBookedAt" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum
        WHEN "paymentAcceptedAt" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum
        WHEN "paymentStartedAt" IS NOT NULL THEN 'PAYMENT_STARTED'::purchase_status_enum
        ELSE 'CLAIMED'::purchase_status_enum
      END
    ) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, [dbName,"public","purchase","GENERATED_COLUMN","status","\n      CASE\n        WHEN \"failedAt\" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum\n        WHEN \"payoutReceivedAt\" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum\n        WHEN \"payoutFailedAt\" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum\n        WHEN \"payoutStartedAt\" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum\n        WHEN \"approvedAt\" IS NOT NULL THEN 'APPROVED'::purchase_status_enum\n        WHEN \"pausedAt\" IS NOT NULL THEN 'PAUSED'::purchase_status_enum\n        WHEN \"deliveredAt\" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum\n        WHEN \"shipmentDeliveredAt\" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum\n        WHEN \"shipmentStartedAt\" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum\n        WHEN \"shipmentDroppedOffAt\" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum\n        WHEN \"shipmentBookedAt\" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum\n        WHEN \"paymentAcceptedAt\" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum\n        WHEN \"paymentStartedAt\" IS NOT NULL THEN 'PAYMENT_STARTED'::purchase_status_enum\n        ELSE 'CLAIMED'::purchase_status_enum\n      END\n    "]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    const dbName = process.env.DB_NAME;

        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","status",dbName,"public","purchase"]);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "status"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, [dbName,"public","purchase","GENERATED_COLUMN","status","\n      CASE\n        WHEN \"failedAt\" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum\n        WHEN \"payoutReceivedAt\" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum\n        WHEN \"payoutFailedAt\" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum\n        WHEN \"payoutStartedAt\" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum\n        WHEN \"approvedAt\" IS NOT NULL THEN 'APPROVED'::purchase_status_enum\n        WHEN \"pausedAt\" IS NOT NULL THEN 'PAUSED'::purchase_status_enum\n        WHEN \"deliveredAt\" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum\n        WHEN \"shipmentDeliveredAt\" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum\n        WHEN \"shipmentStartedAt\" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum\n        WHEN \"shipmentDroppedOffAt\" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum\n        WHEN \"shipmentBookedAt\" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum\n        WHEN \"paymentAcceptedAt\" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum\n        WHEN \"paymentSentAt\" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum\n        ELSE 'CLAIMED'::purchase_status_enum\n      END\n    "]);
        await queryRunner.query(`CREATE TYPE "public"."purchase_status_enum" AS ENUM('CLAIMED', 'PAYMENT_SENT', 'PAYMENT_ACCEPTED', 'SHIPMENT_BOOKED', 'SHIPMENT_DROPPED_OFF', 'SHIPPING_STARTED', 'SHIPPING_DELIVERED', 'DELIVERED', 'APPROVED', 'PAYOUT_STARTED', 'FINISHED_FAILED', 'FINISHED_SUCCESS', 'PAUSED', 'PAYOUT_FAILED')`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "status" "public"."purchase_status_enum" GENERATED ALWAYS AS (
      CASE
        WHEN "failedAt" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum
        WHEN "payoutReceivedAt" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum
        WHEN "payoutFailedAt" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum
        WHEN "payoutStartedAt" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum
        WHEN "approvedAt" IS NOT NULL THEN 'APPROVED'::purchase_status_enum
        WHEN "pausedAt" IS NOT NULL THEN 'PAUSED'::purchase_status_enum
        WHEN "deliveredAt" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum
        WHEN "shipmentDeliveredAt" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum
        WHEN "shipmentStartedAt" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum
        WHEN "shipmentDroppedOffAt" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum
        WHEN "shipmentBookedAt" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum
        WHEN "paymentAcceptedAt" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum
        WHEN "paymentSentAt" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum
        ELSE 'CLAIMED'::purchase_status_enum
      END
    ) STORED NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" RENAME COLUMN "paymentStartedAt" TO "paymentSentAt"`);
    }

}
