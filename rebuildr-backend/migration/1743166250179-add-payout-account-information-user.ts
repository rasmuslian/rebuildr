import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayoutAccountInformationUser1743166250179 implements MigrationInterface {
    name = 'AddPayoutAccountInformationUser1743166250179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rocker_payout_account_swish"`);
        await queryRunner.query(`DROP TYPE "public"."user_rocker_payout_account_swish_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payout_account_swish_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payout_account_rix_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payout_account_bank_giro_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "payout_account_plus_giro_id" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."user_selected_payout_method_enum" AS ENUM('SWISH', 'RIX', 'BANKGIRO', 'PLUGIRO')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "selected_payout_method" "public"."user_selected_payout_method_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "selected_payout_method"`);
        await queryRunner.query(`DROP TYPE "public"."user_selected_payout_method_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payout_account_plus_giro_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payout_account_bank_giro_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payout_account_rix_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "payout_account_swish_id"`);
        await queryRunner.query(`CREATE TYPE "public"."user_rocker_payout_account_swish_enum" AS ENUM('FAILED', 'NOT_SET', 'PENDING', 'VERIFIED')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "rocker_payout_account_swish" "public"."user_rocker_payout_account_swish_enum" NOT NULL DEFAULT 'NOT_SET'`);
    }

}
