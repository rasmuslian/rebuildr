import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayoutVariablesToPurchase1729174966893 implements MigrationInterface {
    name = 'AddPayoutVariablesToPurchase1729174966893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "failure_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "rocker_payout_id" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payout_started_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "failed_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "failed_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payout_started_at"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "rocker_payout_id"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "failure_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

}
