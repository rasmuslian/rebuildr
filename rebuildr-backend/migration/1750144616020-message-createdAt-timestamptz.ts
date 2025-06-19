import { MigrationInterface, QueryRunner } from 'typeorm';

export class MessageCreatedAtTimestamptz1750144616020
  implements MigrationInterface
{
  name = 'MessageCreatedAtTimestamptz1750144616020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "message"
            ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE
            USING "createdAt" AT TIME ZONE 'UTC'
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "message"
            ALTER COLUMN "createdAt" TYPE TIMESTAMP
            USING "createdAt" AT TIME ZONE 'UTC'
          `);
  }
}
