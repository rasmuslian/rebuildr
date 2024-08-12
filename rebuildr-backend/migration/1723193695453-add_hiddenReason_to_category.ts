import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHiddenReasonToCategory1723193695453 implements MigrationInterface {
    name = 'AddHiddenReasonToCategory1723193695453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "hidden_reason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "hidden_reason"`);
    }

}
