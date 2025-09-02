import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotifyOnMessageAtToUser1756739012050 implements MigrationInterface {
    name = 'AddNotifyOnMessageAtToUser1756739012050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "notifiedOnMessageAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notifiedOnMessageAt"`);
    }

}
