import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileSourceColumn1757515403160 implements MigrationInterface {
    name = 'AddFileSourceColumn1757515403160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."file_source_enum" AS ENUM('APP', 'ADMIN')`);
        await queryRunner.query(`ALTER TABLE "file" ADD "source" "public"."file_source_enum" NOT NULL DEFAULT 'APP'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "source"`);
        await queryRunner.query(`DROP TYPE "public"."file_source_enum"`);
    }

}
