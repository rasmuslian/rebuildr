import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableEmailUser1743177239470 implements MigrationInterface {
    name = 'NullableEmailUser1743177239470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL`);
    }

}
