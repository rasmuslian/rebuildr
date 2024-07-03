import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressToProduct1719414716791 implements MigrationInterface {
    name = 'AddAddressToProduct1719414716791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "address" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "address_location" geometry NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "address_location" TYPE geometry`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "address_location" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "address_location"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "address"`);
    }

}
