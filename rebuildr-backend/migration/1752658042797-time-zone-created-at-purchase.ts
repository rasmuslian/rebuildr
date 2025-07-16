import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeZoneCreatedAtPurchase1752658042797
  implements MigrationInterface
{
  name = 'TimeZoneCreatedAtPurchase1752658042797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "purchase"
          ALTER COLUMN "createdAt"
          SET DATA TYPE TIMESTAMP WITH TIME ZONE
          USING "createdAt" AT TIME ZONE 'UTC';
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "purchase"
      ALTER COLUMN "createdAt"
      SET DATA TYPE TIMESTAMP WITHOUT TIME ZONE
      USING "createdAt" AT TIME ZONE 'UTC';
      `);
  }
}
