import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedAtToPurchase1756130030993 implements MigrationInterface {
  name = 'AddUpdatedAtToPurchase1756130030993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    queryRunner.query(`UPDATE "purchase" set "updatedAt" = "createdAt"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "updatedAt"`);
  }
}
