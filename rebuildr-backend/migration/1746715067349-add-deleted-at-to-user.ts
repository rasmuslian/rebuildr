import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToUser1746715067349 implements MigrationInterface {
    name = 'AddDeletedAtToUser1746715067349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    }

}
