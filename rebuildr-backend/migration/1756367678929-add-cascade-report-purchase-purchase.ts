import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeReportPurchasePurchase1756367678929 implements MigrationInterface {
    name = 'AddCascadeReportPurchasePurchase1756367678929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_purchase" DROP CONSTRAINT "FK_a59bbdeb911e287dccf78d62556"`);
        await queryRunner.query(`ALTER TABLE "report_purchase" ADD CONSTRAINT "FK_a59bbdeb911e287dccf78d62556" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_purchase" DROP CONSTRAINT "FK_a59bbdeb911e287dccf78d62556"`);
        await queryRunner.query(`ALTER TABLE "report_purchase" ADD CONSTRAINT "FK_a59bbdeb911e287dccf78d62556" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
