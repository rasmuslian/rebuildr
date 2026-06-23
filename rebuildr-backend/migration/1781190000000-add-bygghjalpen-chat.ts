import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBygghjalpenChat1781190000000 implements MigrationInterface {
    name = 'AddBygghjalpenChat1781190000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bygghjalpen_message_role_enum" AS ENUM('USER', 'ASSISTANT')`);
        await queryRunner.query(`CREATE TABLE "bygghjalpen_chat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying, "userId" uuid, "guestId" character varying, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e267192f731725c309180d6611b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bygghjalpen_message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "public"."bygghjalpen_message_role_enum" NOT NULL, "content" text NOT NULL, "chatId" uuid NOT NULL, CONSTRAINT "PK_6cf6cb1d247c44bdd8fc09731f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bygghjalpen_chat_user_updated" ON "bygghjalpen_chat" ("userId", "updatedAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_bygghjalpen_chat_guest" ON "bygghjalpen_chat" ("guestId")`);
        await queryRunner.query(`CREATE INDEX "IDX_bygghjalpen_message_chat_created" ON "bygghjalpen_message" ("chatId", "createdAt")`);
        await queryRunner.query(`ALTER TABLE "bygghjalpen_chat" ADD CONSTRAINT "FK_8ff82a9f411cf8ec899c2864ad7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bygghjalpen_message" ADD CONSTRAINT "FK_9760c678df8ed9844cad6a51639" FOREIGN KEY ("chatId") REFERENCES "bygghjalpen_chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bygghjalpen_message" DROP CONSTRAINT "FK_9760c678df8ed9844cad6a51639"`);
        await queryRunner.query(`ALTER TABLE "bygghjalpen_chat" DROP CONSTRAINT "FK_8ff82a9f411cf8ec899c2864ad7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bygghjalpen_message_chat_created"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bygghjalpen_chat_guest"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bygghjalpen_chat_user_updated"`);
        await queryRunner.query(`DROP TABLE "bygghjalpen_message"`);
        await queryRunner.query(`DROP TABLE "bygghjalpen_chat"`);
        await queryRunner.query(`DROP TYPE "public"."bygghjalpen_message_role_enum"`);
    }
}