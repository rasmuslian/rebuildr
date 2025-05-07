import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryEnabledToProduct1746011871069 implements MigrationInterface {
    name = 'AddDeliveryEnabledToProduct1746011871069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "delivery_enabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "delivery_enabled"`);
    }

}
