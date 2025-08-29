import { MigrationInterface, QueryRunner } from "typeorm";

export class ReportPurchaseResolutionEnum1756393717623 implements MigrationInterface {
    name = 'ReportPurchaseResolutionEnum1756393717623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_purchase" DROP COLUMN "resolution"`);
        await queryRunner.query(`CREATE TYPE "public"."report_purchase_resolution_enum" AS ENUM('REFUND', 'PROCEED', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "report_purchase" ADD "resolution" "public"."report_purchase_resolution_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_purchase" DROP COLUMN "resolution"`);
        await queryRunner.query(`DROP TYPE "public"."report_purchase_resolution_enum"`);
        await queryRunner.query(`ALTER TABLE "report_purchase" ADD "resolution" character varying`);
    }

}
