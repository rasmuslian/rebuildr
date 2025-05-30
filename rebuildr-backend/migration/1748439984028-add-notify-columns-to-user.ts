import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotifyColumnsToUser1748439984028 implements MigrationInterface {
    name = 'AddNotifyColumnsToUser1748439984028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "notify_on_message" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notify_on_buy" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notify_on_sale" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notify_on_sale"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notify_on_buy"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notify_on_message"`);
    }

}
