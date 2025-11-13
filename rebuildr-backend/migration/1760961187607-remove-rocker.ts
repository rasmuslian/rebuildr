import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRocker1760961187607 implements MigrationInterface {
    name = 'RemoveRocker1760961187607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "rockerPaymentId"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "rockerOfferId"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "rockerPayoutId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rockerUserId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payoutAccountSwishId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payoutAccountRixId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payoutAccountBankGiroId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payoutAccountPlusGiroId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "selectedPayoutMethod"`);
        await queryRunner.query(`DROP TYPE "public"."user_selectedpayoutmethod_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_selectedpayoutmethod_enum" AS ENUM('SWISH', 'TRUSTLY', 'RIX', 'BANKGIRO', 'PLUGIRO')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "selectedPayoutMethod" "public"."user_selectedpayoutmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payoutAccountPlusGiroId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payoutAccountBankGiroId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payoutAccountRixId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payoutAccountSwishId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "rockerUserId" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "rockerPayoutId" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "rockerOfferId" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "rockerPaymentId" character varying`);
    }

}
