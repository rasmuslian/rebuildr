import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLikedbyRelationUserProject1749451227782 implements MigrationInterface {
    name = 'AddLikedbyRelationUserProject1749451227782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_liked_by_user" ("projectId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_e6dfbfd07631e844718e47b3d33" PRIMARY KEY ("projectId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0064452a1d2e9f0a0aff09059c" ON "project_liked_by_user" ("projectId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c6e2c614c80bb2d0293daed8c8" ON "project_liked_by_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "project_liked_by_user" ADD CONSTRAINT "FK_0064452a1d2e9f0a0aff09059ca" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_liked_by_user" ADD CONSTRAINT "FK_c6e2c614c80bb2d0293daed8c81" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_liked_by_user" DROP CONSTRAINT "FK_c6e2c614c80bb2d0293daed8c81"`);
        await queryRunner.query(`ALTER TABLE "project_liked_by_user" DROP CONSTRAINT "FK_0064452a1d2e9f0a0aff09059ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c6e2c614c80bb2d0293daed8c8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0064452a1d2e9f0a0aff09059c"`);
        await queryRunner.query(`DROP TABLE "project_liked_by_user"`);
    }

}
