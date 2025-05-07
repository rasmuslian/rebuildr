import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryAndPickupToProduct1745826155991 implements MigrationInterface {
    name = 'AddDeliveryAndPickupToProduct1745826155991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "pickup_enabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "product" ADD "delivery_radius" integer`);
        await queryRunner.query(`ALTER TABLE "product" ADD "delivery_price" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "delivery_price"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "delivery_radius"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "pickup_enabled"`);
    }

}
