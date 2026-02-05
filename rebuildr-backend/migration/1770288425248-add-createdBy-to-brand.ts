import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByToBrand1770288425248 implements MigrationInterface {
    name = 'AddCreatedByToBrand1770288425248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" ADD "createdById" uuid`);
        await queryRunner.query(`ALTER TABLE "brand" ADD CONSTRAINT "FK_7d175bc7e8359f4e22700d607ee" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" DROP CONSTRAINT "FK_7d175bc7e8359f4e22700d607ee"`);
        await queryRunner.query(`ALTER TABLE "brand" DROP COLUMN "createdById"`);
    }

}
