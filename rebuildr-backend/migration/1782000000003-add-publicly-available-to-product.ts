import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPubliclyAvailableToProduct1782000000003
  implements MigrationInterface
{
  name = 'AddPubliclyAvailableToProduct1782000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product" ADD "publiclyAvailable" boolean NOT NULL DEFAULT false',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product" DROP COLUMN "publiclyAvailable"',
    );
  }
}
