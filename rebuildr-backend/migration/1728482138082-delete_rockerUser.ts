import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteRockerUser1728482138082 implements MigrationInterface {
  name = 'DeleteRockerUser1728482138082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "rocker_user_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "rocker_user" DROP CONSTRAINT "FK_1842f3b5e76fc9d815293b333b6"`,
    );
    await queryRunner.query(`DROP TABLE "rocker_user"`);
    await queryRunner.query(`DROP TYPE "public"."rocker_user_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rocker_user_id"`);
    await queryRunner.query(
      `CREATE TYPE "public"."rocker_user_type_enum" AS ENUM('FOREIGN_USER', 'AUTHENTICATED_USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rocker_user" ("id" character varying NOT NULL, "user_id" uuid NOT NULL, "type" "public"."rocker_user_type_enum" NOT NULL DEFAULT 'FOREIGN_USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_1842f3b5e76fc9d815293b333b" UNIQUE ("user_id"), CONSTRAINT "PK_7bee45fb430ba292111cd5bad2e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "rocker_user" ADD CONSTRAINT "FK_1842f3b5e76fc9d815293b333b6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
