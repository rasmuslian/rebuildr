import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicPriceConfirmedToProduct1782000000004
  implements MigrationInterface
{
  name = 'AddPublicPriceConfirmedToProduct1782000000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product" ADD "publicPriceConfirmed" boolean NOT NULL DEFAULT false',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product" DROP COLUMN "publicPriceConfirmed"',
    );
  }
}
