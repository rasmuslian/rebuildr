import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueOnRockerPaymentId1750252903150 implements MigrationInterface {
    name = 'RemoveUniqueOnRockerPaymentId1750252903150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "UQ_3bd8aa6019bd5f2e6c8071b2b98"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "UQ_3bd8aa6019bd5f2e6c8071b2b98" UNIQUE ("rockerPaymentId")`);
    }

}
