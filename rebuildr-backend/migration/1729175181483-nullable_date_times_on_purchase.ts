import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableDateTimesOnPurchase1729175181483 implements MigrationInterface {
    name = 'NullableDateTimesOnPurchase1729175181483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payment_sent_to_rocker_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payment_accepted_by_rocker_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "delivered_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "approved_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "disapproved_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payout_started_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payout_received_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "failed_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "failed_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payout_received_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payout_started_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "disapproved_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "approved_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "delivered_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payment_accepted_by_rocker_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "payment_sent_to_rocker_at" SET NOT NULL`);
    }

}
