import { MigrationInterface, QueryRunner } from "typeorm";

export class FixGeometryTypes1722952698238 implements MigrationInterface {
    name = 'FixGeometryTypes1722952698238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "address_location" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "address_location" TYPE geometry(Point,4326)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "address_location" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "address_location" TYPE geometry(GEOMETRY,0)`);
    }

}
