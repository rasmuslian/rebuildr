import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameBygghjalpenChatToAterbyggaren1783100000000
  implements MigrationInterface
{
  name = 'RenameBygghjalpenChatToAterbyggaren1783100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bygghjalpen_message" RENAME TO "aterbyggaren_message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bygghjalpen_chat" RENAME TO "aterbyggaren_chat"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."bygghjalpen_message_role_enum" RENAME TO "aterbyggaren_message_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."bygghjalpen_message_status_enum" RENAME TO "aterbyggaren_message_status_enum"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_bygghjalpen_chat_user_updated" RENAME TO "IDX_aterbyggaren_chat_user_updated"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_bygghjalpen_chat_guest" RENAME TO "IDX_aterbyggaren_chat_guest"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_bygghjalpen_message_chat_created" RENAME TO "IDX_aterbyggaren_message_chat_created"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_aterbyggaren_message_chat_created" RENAME TO "IDX_bygghjalpen_message_chat_created"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_aterbyggaren_chat_guest" RENAME TO "IDX_bygghjalpen_chat_guest"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_aterbyggaren_chat_user_updated" RENAME TO "IDX_bygghjalpen_chat_user_updated"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."aterbyggaren_message_status_enum" RENAME TO "bygghjalpen_message_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."aterbyggaren_message_role_enum" RENAME TO "bygghjalpen_message_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aterbyggaren_chat" RENAME TO "bygghjalpen_chat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aterbyggaren_message" RENAME TO "bygghjalpen_message"`,
    );
  }
}