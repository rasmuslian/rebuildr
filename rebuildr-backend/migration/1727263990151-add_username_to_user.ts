import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUser1727263990151 implements MigrationInterface {
  name = 'AddUsernameToUser1727263990151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`,
    );
    await queryRunner.query(`UPDATE "user" SET username = uuid_generate_v4()`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN username SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
  }
}
