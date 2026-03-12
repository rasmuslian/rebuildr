import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResolvedAtToReportPurchase1773329747139 implements MigrationInterface {
    name = 'AddResolvedAtToReportPurchase1773329747139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_purchase" ADD "resolvedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_purchase" DROP COLUMN "resolvedAt"`);
    }

}
