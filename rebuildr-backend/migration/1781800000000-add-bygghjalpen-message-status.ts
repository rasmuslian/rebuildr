import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBygghjalpenMessageStatus1781800000000 implements MigrationInterface {
    name = 'AddBygghjalpenMessageStatus1781800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bygghjalpen_message_status_enum" AS ENUM('COMPLETE', 'INTERRUPTED', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "bygghjalpen_message" ADD "status" "public"."bygghjalpen_message_status_enum" NOT NULL DEFAULT 'COMPLETE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bygghjalpen_message" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."bygghjalpen_message_status_enum"`);
    }

}