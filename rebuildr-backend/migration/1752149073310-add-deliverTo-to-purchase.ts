import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliverToToPurchase1752149073310 implements MigrationInterface {
    name = 'AddDeliverToToPurchase1752149073310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "deliverToAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "deliverToLocation" geometry(Point,4326)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "deliverToLocation"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "deliverToAddress"`);
    }

}
