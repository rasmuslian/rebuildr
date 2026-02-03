import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturesToUser1770045564956 implements MigrationInterface {
    name = 'AddFeaturesToUser1770045564956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isFeatured" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isFeatured"`);
    }

}
