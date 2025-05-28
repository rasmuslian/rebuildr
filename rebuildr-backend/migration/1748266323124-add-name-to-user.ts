import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToUser1748266323124 implements MigrationInterface {
    name = 'AddNameToUser1748266323124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    }

}
