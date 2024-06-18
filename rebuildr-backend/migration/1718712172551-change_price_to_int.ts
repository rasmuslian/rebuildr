import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePriceToInt1718712172551 implements MigrationInterface {
  name = 'ChangePriceToInt1718712172551';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "price" integer NOT NULL default 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "price" numeric NOT NULL default 0`,
    );
  }
}
