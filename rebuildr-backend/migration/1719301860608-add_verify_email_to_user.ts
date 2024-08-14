import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerifyEmailToUser1719301860608 implements MigrationInterface {
    name = 'AddVerifyEmailToUser1719301860608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "verify_email_token" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verify_email_token"`);
    }

}
