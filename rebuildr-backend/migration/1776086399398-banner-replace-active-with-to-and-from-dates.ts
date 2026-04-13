import { MigrationInterface, QueryRunner } from "typeorm";

export class BannerReplaceActiveWithToAndFromDates1776086399398 implements MigrationInterface {
    name = 'BannerReplaceActiveWithToAndFromDates1776086399398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banner" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "banner" ADD "showFrom" TIMESTAMP NOT NULL DEFAULT NOW()`)
        await queryRunner.query(`ALTER TABLE "banner" ALTER COLUMN "showFrom" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "banner" ADD "showTo" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banner" DROP COLUMN "showTo"`);
        await queryRunner.query(`ALTER TABLE "banner" DROP COLUMN "showFrom"`);
        await queryRunner.query(`ALTER TABLE "banner" ADD "active" boolean NOT NULL DEFAULT true`);
    }

}
