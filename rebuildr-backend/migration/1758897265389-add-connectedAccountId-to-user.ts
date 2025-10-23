import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConnectedAccountIdToUser1758897265389 implements MigrationInterface {
    name = 'AddConnectedAccountIdToUser1758897265389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "connectedAccountId" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."connectedAccountId" IS 'Id pointing to connected account at Stripe'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "user"."connectedAccountId" IS 'Id pointing to connected account at Stripe'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "connectedAccountId"`);
    }

}
