import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsToMessage1749471569893 implements MigrationInterface {
    name = 'AddColumnsToMessage1749471569893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" RENAME COLUMN "body" TO "message"`)
        await queryRunner.query(`ALTER TABLE "message" ADD "readAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."message_messagetype_enum" AS ENUM('USER', 'SYSTEM')`);
        await queryRunner.query(`ALTER TABLE "message" ADD "messageType" "public"."message_messagetype_enum" NOT NULL DEFAULT 'USER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "messageType"`);
        await queryRunner.query(`DROP TYPE "public"."message_messagetype_enum"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "readAt"`);
        await queryRunner.query(`ALTER TABLE "message" RENAME COLUMN "message" TO "body"`)
      }

}
