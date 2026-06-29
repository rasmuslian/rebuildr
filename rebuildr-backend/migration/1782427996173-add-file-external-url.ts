import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileExternalUrl1782427996173 implements MigrationInterface {
  name = 'AddFileExternalUrl1782427996173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" ADD "externalUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "externalUrl"`);
  }
}
