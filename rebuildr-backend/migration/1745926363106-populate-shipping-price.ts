import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateShippingPrice1745926363106 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      INSERT INTO shipping_price (max_weight, price, provider) VALUES
      (1, 2900, 'POSTNORD'),
      (5, 6900, 'POSTNORD'),
      (10, 17900, 'POSTNORD'),
      (20, 22900, 'POSTNORD'),
      (1, 2900, 'DHL'),
      (5, 6900, 'DHL'),
      (10, 17900, 'DHL'),
      (20, 22900, 'DHL')`);
  }

  public async down(): Promise<void> {
    return null;
  }
}
