import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCo2Factor1770967932656 implements MigrationInterface {
    name = 'AddCo2Factor1770967932656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "co2_factor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "resourceId" character varying NOT NULL, "coefficient" double precision NOT NULL, "productName" character varying NOT NULL, "categoryName" character varying NOT NULL, "version" character varying NOT NULL, "dataUpdatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_c82241457198fd7b4510ca4fee7" UNIQUE ("resourceId"), CONSTRAINT "PK_7785c8d99aa908ccf48f838ce4d" PRIMARY KEY ("id")); COMMENT ON COLUMN "co2_factor"."resourceId" IS 'Foreign id pointing to ''resourceId'' in Boverket '; COMMENT ON COLUMN "co2_factor"."coefficient" IS 'Co2 coefficient matching ''A1-A3 Conservative'' in Boverket'; COMMENT ON COLUMN "co2_factor"."productName" IS 'Matching ''name'' in Boverket'; COMMENT ON COLUMN "co2_factor"."categoryName" IS 'Matching categories.text'; COMMENT ON COLUMN "co2_factor"."version" IS 'What version in Boverket this data is based of'; COMMENT ON COLUMN "co2_factor"."dataUpdatedAt" IS 'When fetched data was updated at Boverket'`);
        await queryRunner.query(`ALTER TABLE "category" ADD "co2FactorId" uuid`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_91ebfff7608f31c94b47c46d29e" FOREIGN KEY ("co2FactorId") REFERENCES "co2_factor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_91ebfff7608f31c94b47c46d29e"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "co2FactorId"`);
        await queryRunner.query(`DROP TABLE "co2_factor"`);
    }

}
