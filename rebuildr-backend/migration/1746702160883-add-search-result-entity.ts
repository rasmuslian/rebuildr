import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSearchResultEntity1746702160883 implements MigrationInterface {
    name = 'AddSearchResultEntity1746702160883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "search_result" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "search_string" character varying NOT NULL, "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "searcher_id" uuid, CONSTRAINT "PK_865d292f5c747bc41aa39440d36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "search_result" ADD CONSTRAINT "FK_c1bdc5f3596da7ec2ea219a1d40" FOREIGN KEY ("searcher_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "search_result" DROP CONSTRAINT "FK_c1bdc5f3596da7ec2ea219a1d40"`);
        await queryRunner.query(`DROP TABLE "search_result"`);
    }

}
