import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepositFactorToCo2Factor1778590501515 implements MigrationInterface {
    name = 'AddDepositFactorToCo2Factor1778590501515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "co2_factor" RENAME "coefficient" TO "productionCoefficient"`)
        await queryRunner.query(`COMMENT ON COLUMN "co2_factor"."productionCoefficient" IS 'Co2 coefficient matching ''A1-A3'''`);
        
        await queryRunner.query(`ALTER TABLE "co2_factor" ADD "disposalCoefficient" double precision NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "co2_factor" ALTER COLUMN "disposalCoefficient" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "co2_factor"."disposalCoefficient" IS 'Co2 coefficient matching ''C1-C3'''`);
        
        await queryRunner.query(`ALTER TABLE "product" RENAME "co2Saving" TO "co2SavingBuyer"`)
        await queryRunner.query(`ALTER TABLE "product" ADD "co2SavingSeller" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "co2SavingSeller"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME "co2SavingBuyer" TO "co2Saving"`)
        
        await queryRunner.query(`ALTER TABLE "co2_factor" DROP COLUMN "disposalCoefficient"`);
        await queryRunner.query(`COMMENT ON COLUMN "co2_factor"."productionCoefficient" IS 'Co2 coefficient matching ''A1-A3'''`);
        await queryRunner.query(`ALTER TABLE "co2_factor" RENAME "productionCoefficient" TO "coefficient"`)
    }

}
