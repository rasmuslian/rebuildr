import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToFile1744793615279 implements MigrationInterface {
  name = 'AddNameToFile1744793615279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ADD "name" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "name"`);
  }
}
