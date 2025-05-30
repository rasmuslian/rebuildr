import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostCodeAndCityToUser1748266712172 implements MigrationInterface {
    name = 'AddPostCodeAndCityToUser1748266712172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "post_code" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "city" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "post_code"`);
    }

}
