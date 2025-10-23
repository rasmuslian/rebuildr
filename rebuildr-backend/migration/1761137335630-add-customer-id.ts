import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerId1761137335630 implements MigrationInterface {
    name = 'AddCustomerId1761137335630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "customerId" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."customerId" IS 'Id pointing to Customer at Stripe'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "user"."customerId" IS 'Id pointing to Customer at Stripe'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "customerId"`);
    }

}
