import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPartner1770127632817 implements MigrationInterface {
    name = 'AddPartner1770127632817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "partner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "websiteUrl" character varying, "logoId" uuid, CONSTRAINT "REL_1e1b4185b1639feb821388500d" UNIQUE ("logoId"), CONSTRAINT "PK_8f34ff11ddd5459eacbfacd48ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "partner" ADD CONSTRAINT "FK_1e1b4185b1639feb821388500db" FOREIGN KEY ("logoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner" DROP CONSTRAINT "FK_1e1b4185b1639feb821388500db"`);
        await queryRunner.query(`DROP TABLE "partner"`);
    }

}
