import { MigrationInterface, QueryRunner } from "typeorm";

export class TrustlyPayoutMethodEnumValue1746603999554 implements MigrationInterface {
    name = 'TrustlyPayoutMethodEnumValue1746603999554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_selected_payout_method_enum" RENAME TO "user_selected_payout_method_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_selected_payout_method_enum" AS ENUM('SWISH', 'TRUSTLY', 'RIX', 'BANKGIRO', 'PLUGIRO')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "selected_payout_method" TYPE "public"."user_selected_payout_method_enum" USING "selected_payout_method"::"text"::"public"."user_selected_payout_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_selected_payout_method_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_selected_payout_method_enum_old" AS ENUM('SWISH', 'RIX', 'BANKGIRO', 'PLUGIRO')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "selected_payout_method" TYPE "public"."user_selected_payout_method_enum_old" USING "selected_payout_method"::"text"::"public"."user_selected_payout_method_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_selected_payout_method_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_selected_payout_method_enum_old" RENAME TO "user_selected_payout_method_enum"`);
    }

}
