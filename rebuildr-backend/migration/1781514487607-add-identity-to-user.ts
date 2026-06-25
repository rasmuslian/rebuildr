import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdentityToUser1781514487607 implements MigrationInterface {
    name = 'AddIdentityToUser1781514487607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "identity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ssn" character varying, "name" character varying, "lastIdentifiedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_84f28911d62ac0916256da68106" UNIQUE ("ssn"), CONSTRAINT "PK_ff16a44186b286d5e626178f726" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "identityId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_dea97e26c765a4cdb575957a146" FOREIGN KEY ("identityId") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_dea97e26c765a4cdb575957a146"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "identityId"`);
        await queryRunner.query(`DROP TABLE "identity"`);
    }

}
