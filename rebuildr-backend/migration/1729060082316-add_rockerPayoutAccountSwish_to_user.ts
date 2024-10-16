import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRockerPayoutAccountSwishToUser1729060082316 implements MigrationInterface {
    name = 'AddRockerPayoutAccountSwishToUser1729060082316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_rocker_payout_account_swish_enum" AS ENUM('NOT_SET', 'VERIFIED', 'PENDING', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "rocker_payout_account_swish" "public"."user_rocker_payout_account_swish_enum" NOT NULL DEFAULT 'NOT_SET'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rocker_payout_account_swish"`);
        await queryRunner.query(`DROP TYPE "public"."user_rocker_payout_account_swish_enum"`);
    }

}
