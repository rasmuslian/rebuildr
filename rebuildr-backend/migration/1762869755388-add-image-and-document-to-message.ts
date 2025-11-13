import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageAndDocumentToMessage1762869755388 implements MigrationInterface {
    name = 'AddImageAndDocumentToMessage1762869755388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "messageImageId" uuid`);
        await queryRunner.query(`ALTER TABLE "file" ADD "messageDocumentId" uuid`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_8a80292ed5a8a751d051c7092f0" FOREIGN KEY ("messageImageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_4eb2d958915d29e36d85772e211" FOREIGN KEY ("messageDocumentId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_4eb2d958915d29e36d85772e211"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_8a80292ed5a8a751d051c7092f0"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "messageDocumentId"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "messageImageId"`);
    }

}
