import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddToServicePointIdToPurchase1751983336327
  implements MigrationInterface
{
  name = 'AddToServicePointIdToPurchase1751983336327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD "toServicePointId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP COLUMN "toServicePointId"`,
    );
  }
}
