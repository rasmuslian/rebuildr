import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToUser1747732919816 implements MigrationInterface {
    name = 'AddDescriptionToUser1747732919816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "description"`);
    }

}
