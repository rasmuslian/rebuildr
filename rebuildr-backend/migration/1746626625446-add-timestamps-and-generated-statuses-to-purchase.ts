import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampsAndGeneratedStatusesToPurchase1746626625446 implements MigrationInterface {
    name = 'AddTimestampsAndGeneratedStatusesToPurchase1746626625446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_sent_to_rocker_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_accepted_by_rocker_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "disapproved_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_sent_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_accepted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "shipment_booked_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "shipment_dropped_off_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "shipment_delivered_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "shipment_started_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "paused_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payout_failed_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_status_enum" AS ENUM('CLAIMED', 'PAYMENT_SENT', 'PAYMENT_ACCEPTED', 'SHIPMENT_BOOKED', 'SHIPMENT_DROPPED_OFF', 'SHIPPING_STARTED', 'SHIPPING_DELIVERED', 'DELIVERED', 'APPROVED', 'PAYOUT_STARTED', 'FINISHED_FAILED', 'FINISHED_SUCCESS', 'PAUSED', 'PAYOUT_FAILED')`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "status" "public"."purchase_status_enum" GENERATED ALWAYS AS (
      CASE
        WHEN "failed_at" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum
        WHEN "payout_received_at" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum
        WHEN "payout_failed_at" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum
        WHEN "payout_started_at" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum
        WHEN "approved_at" IS NOT NULL THEN 'APPROVED'::purchase_status_enum
        WHEN "paused_at" IS NOT NULL THEN 'PAUSED'::purchase_status_enum
        WHEN "delivered_at" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum
        WHEN "shipment_delivered_at" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum
        WHEN "shipment_started_at" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum
        WHEN "shipment_dropped_off_at" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum
        WHEN "shipment_booked_at" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum
        WHEN "payment_accepted_at" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum
        WHEN "payment_sent_at" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum
        ELSE 'CLAIMED'::purchase_status_enum
      END
    ) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["postgres","public","purchase","GENERATED_COLUMN","status","\n      CASE\n        WHEN \"failed_at\" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum\n        WHEN \"payout_received_at\" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum\n        WHEN \"payout_failed_at\" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum\n        WHEN \"payout_started_at\" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum\n        WHEN \"approved_at\" IS NOT NULL THEN 'APPROVED'::purchase_status_enum\n        WHEN \"paused_at\" IS NOT NULL THEN 'PAUSED'::purchase_status_enum\n        WHEN \"delivered_at\" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum\n        WHEN \"shipment_delivered_at\" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum\n        WHEN \"shipment_started_at\" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum\n        WHEN \"shipment_dropped_off_at\" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum\n        WHEN \"shipment_booked_at\" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum\n        WHEN \"payment_accepted_at\" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum\n        WHEN \"payment_sent_at\" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum\n        ELSE 'CLAIMED'::purchase_status_enum\n      END\n    "]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","status","postgres","public","purchase"]);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_status_enum"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payout_failed_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "paused_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "shipment_started_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "shipment_delivered_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "shipment_dropped_off_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "shipment_booked_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_accepted_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_sent_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "disapproved_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_accepted_by_rocker_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_sent_to_rocker_at" TIMESTAMP WITH TIME ZONE`);
    }

}
