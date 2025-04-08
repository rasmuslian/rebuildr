import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneNumberToUser1743164440486 implements MigrationInterface {
    name = 'AddPhoneNumberToUser1743164440486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "phone_number" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone_number"`);
    }

}
