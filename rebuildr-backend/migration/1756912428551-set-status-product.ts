import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetStatusProduct1756912428551 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE product p
          SET status = 'SOLD'
          WHERE EXISTS (
            SELECT 1 
              FROM purchase pu 
              WHERE 
                pu."productId" = p.id AND pu.status <> 'FINISHED_FAILED')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE product p
          SET status = 'PUBLISHED'
          WHERE EXISTS (
            SELECT 1 
              FROM purchase pu 
              WHERE 
                pu."productId" = p.id AND pu.status <> 'FINISHED_SUCCESS')
        `);
  }
}
