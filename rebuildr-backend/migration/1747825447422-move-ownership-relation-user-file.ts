import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveOwnershipRelationUserFile1747825447422 implements MigrationInterface {
    name = 'MoveOwnershipRelationUserFile1747825447422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_e4238c3828bc51ff8ca27c46385"`);
        await queryRunner.query(`ALTER TABLE "file" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "UQ_516f1cf15166fd07b732b4b6ab0" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e4238c3828bc51ff8ca27c46385"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_picture_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_picture_id" character varying`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_picture_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_picture_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e4238c3828bc51ff8ca27c46385" UNIQUE ("profile_picture_id")`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "UQ_516f1cf15166fd07b732b4b6ab0"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_e4238c3828bc51ff8ca27c46385" FOREIGN KEY ("profile_picture_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
