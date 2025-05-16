import { MigrationInterface, QueryRunner } from "typeorm";

export class AppProjectImage1747394671869 implements MigrationInterface {
    name = 'AppProjectImage1747394671869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "project_picture_id" uuid`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "UQ_bbf3741715e8823e91e6ea26ca9" UNIQUE ("project_picture_id")`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_bbf3741715e8823e91e6ea26ca9" FOREIGN KEY ("project_picture_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_bbf3741715e8823e91e6ea26ca9"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "UQ_bbf3741715e8823e91e6ea26ca9"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "project_picture_id"`);
    }

}
