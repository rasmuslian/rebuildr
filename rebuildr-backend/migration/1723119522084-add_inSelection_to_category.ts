import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInSelectionToCategory1723119522084
  implements MigrationInterface
{
  name = 'AddInSelectionToCategory1723119522084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category" ADD "in_selection" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "address_location" TYPE geometry(GEOMETRY,0)`,
    );
  }
}
