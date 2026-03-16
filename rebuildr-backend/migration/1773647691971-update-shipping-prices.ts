import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateShippingPrices1773647691971 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
          UPDATE   shipping_price sp
          SET price = 11500
          WHERE "maxWeight" = 1
        `)
      await queryRunner.query(`
          UPDATE   shipping_price sp
          SET price = 20100
          WHERE "maxWeight" = 5
        `)
      await queryRunner.query(`
          UPDATE   shipping_price sp
          SET price = 25700
          WHERE "maxWeight" = 10
        `)
      await queryRunner.query(`
          UPDATE   shipping_price sp
          SET price = 35500
          WHERE "maxWeight" = 20
        `)

      await queryRunner.query(`
          INSERT INTO shipping_price ("maxWeight", price, provider)
          VALUES 
          (2, 15400, 'POSTNORD'), 
          (2, 15400, 'DHL'),
          (3, 17000, 'POSTNORD'),
          (3, 17000, 'DHL')
        `)
    }

    public async down(): Promise<void> {
      return
    }

}
