import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFile1719911960183 implements MigrationInterface {
    name = 'AddFile1719911960183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mime_type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "product_id" uuid, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "address_location" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "address_location" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_e4c65a52e0203d2daee81936bcc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_e4c65a52e0203d2daee81936bcc"`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "address_location" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "address_location" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
