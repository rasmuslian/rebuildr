import { MigrationInterface, QueryRunner } from 'typeorm';

export class RetypeAndRenameVerifiedToEmailVerifiedAtUser1743080147773
  implements MigrationInterface
{
  name = 'RetypeAndRenameVerifiedToEmailVerifiedAtUser1743080147773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email_verified_at" TIMESTAMP`,
    );
    await queryRunner.query(`
          UPDATE "user"
          SET email_verified_at = NOW()
          WHERE verified = TRUE
            `);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verified"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "email_verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email_verified_at" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "email_verified_at" TO "verified"`,
    );
  }
}
