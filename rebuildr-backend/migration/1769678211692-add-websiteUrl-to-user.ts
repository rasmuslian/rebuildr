import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWebsiteUrlToUser1769678211692 implements MigrationInterface {
    name = 'AddWebsiteUrlToUser1769678211692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "websiteUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "websiteUrl"`);
    }

}
