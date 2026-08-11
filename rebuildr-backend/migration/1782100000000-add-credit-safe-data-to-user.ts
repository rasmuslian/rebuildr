import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreditsafeDataToUser1782100000000 implements MigrationInterface {
    name = 'AddCreditsafeDataToUser1782100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "creditsafeData" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "creditsafeData"`);
    }

}
