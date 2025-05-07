import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentsToProduct1744199203804 implements MigrationInterface {
  name = 'AddDocumentsToProduct1744199203804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_e4c65a52e0203d2daee81936bcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "product_id" TO "product_images_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD "product_document_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_0939e72c072f2ad3bf460464738" FOREIGN KEY ("product_images_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_5cd168fb06c2e35b3a67d2aea26" FOREIGN KEY ("product_document_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_5cd168fb06c2e35b3a67d2aea26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_0939e72c072f2ad3bf460464738"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP COLUMN "product_document_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "product_images_id" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_e4c65a52e0203d2daee81936bcc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
