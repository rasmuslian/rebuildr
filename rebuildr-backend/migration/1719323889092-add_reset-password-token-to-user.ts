import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetPasswordTokenToUser1719323889092 implements MigrationInterface {
    name = 'AddResetPasswordTokenToUser1719323889092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "reset_password_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "reset_password_token"`);
    }

}
