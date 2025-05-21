import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRelationIdFromUser1747827356314 implements MigrationInterface {
    name = 'RemoveRelationIdFromUser1747827356314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_picture_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_picture_id" character varying`);
    }

}
