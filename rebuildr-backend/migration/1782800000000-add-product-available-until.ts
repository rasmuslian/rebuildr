import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductAvailableUntil1782800000000
  implements MigrationInterface
{
  name = 'AddProductAvailableUntil1782800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "availableUntil" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "availableUntil"`,
    );
  }
}
