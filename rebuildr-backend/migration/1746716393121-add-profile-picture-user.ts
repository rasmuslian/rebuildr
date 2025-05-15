import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePictureUser1746716393121 implements MigrationInterface {
    name = 'AddProfilePictureUser1746716393121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_picture_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e4238c3828bc51ff8ca27c46385" UNIQUE ("profile_picture_id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_e4238c3828bc51ff8ca27c46385" FOREIGN KEY ("profile_picture_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_e4238c3828bc51ff8ca27c46385"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e4238c3828bc51ff8ca27c46385"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_picture_id"`);
    }

}
