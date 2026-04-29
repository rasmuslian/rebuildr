import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationsDropColumns1777377921353 implements MigrationInterface {
  name = "AddConversationsDropColumns1777377921353";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "productId"`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "readAt"`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "purchaseId"`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
    
}
