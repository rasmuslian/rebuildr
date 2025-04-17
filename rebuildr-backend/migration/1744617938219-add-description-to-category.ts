import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToCategory1744617938219
  implements MigrationInterface
{
  name = 'AddDescriptionToCategory1744617938219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category" ADD "description" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "description" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "description"`);
  }
}
