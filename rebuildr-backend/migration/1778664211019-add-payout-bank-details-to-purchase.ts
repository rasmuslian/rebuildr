import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayoutBankDetailsToPurchase1778664211019 implements MigrationInterface {
    name = 'AddPayoutBankDetailsToPurchase1778664211019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payoutBankAccountId" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payoutBankName" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payoutBankLast4" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payoutBankLast4"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payoutBankName"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payoutBankAccountId"`);
    }
}
