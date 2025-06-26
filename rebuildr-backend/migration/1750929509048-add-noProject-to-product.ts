import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoProjectToProduct1750929509048 implements MigrationInterface {
  name = 'AddNoProjectToProduct1750929509048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" ADD "noProject" boolean`);
    await queryRunner.query(
      `COMMENT ON COLUMN "product"."noProject" IS 'null, no choice regarding connection to project has been made      true, user has deliberately made the choice not to connect to project      false, this means a connection is done to a project, but is irrelevant because of ''project'' column'`,
    );
    await queryRunner.query(`
        UPDATE product
        SET "noProject" = TRUE
        WHERE "projectId" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "product"."noProject" IS 'null, no choice regarding connection to project has been made      true, user has deliberately made the choice not to connect to project      false, this means a connection is done to a project, but is irrelevant because of ''project'' column'`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "noProject"`);
  }
}
