import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAterbyggarenMessageFiles1782100000000
  implements MigrationInterface
{
  name = 'AddAterbyggarenMessageFiles1782100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" ADD "aterbyggarenMessageImageId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD "aterbyggarenMessageDocumentId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_file_aterbyggaren_message_image" FOREIGN KEY ("aterbyggarenMessageImageId") REFERENCES "bygghjalpen_message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_file_aterbyggaren_message_document" FOREIGN KEY ("aterbyggarenMessageDocumentId") REFERENCES "bygghjalpen_message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_file_aterbyggaren_message_document"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_file_aterbyggaren_message_image"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP COLUMN "aterbyggarenMessageDocumentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP COLUMN "aterbyggarenMessageImageId"`,
    );
  }
}
